import { stat } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import type { CommandModule } from "yargs";
import { findRepoRoot } from "../../lib/repo-root.js";
import {
	applySlashCommandSync,
	formatPlanSummary,
	formatSyncSummary,
	planSlashCommandSync,
	type CodexConversionScope,
	type CodexOption,
	type ConflictResolution,
	type SyncPlanDetails,
	type UnsupportedFallback,
} from "../../lib/slash-commands/sync.js";
import {
	SLASH_COMMAND_TARGETS,
	getDefaultScope,
	getTargetProfile,
	isSlashCommandTargetName,
	type Scope,
	type TargetName,
} from "../../lib/slash-commands/targets.js";

type SyncCommandsArgs = {
	skip?: string | string[];
	only?: string | string[];
	json: boolean;
	yes: boolean;
	removeMissing: boolean;
	conflicts?: string;
};

const SUPPORTED_TARGETS = SLASH_COMMAND_TARGETS.map((target) => target.name).join(", ");

function parseList(value?: string | string[]): string[] {
	if (!value) {
		return [];
	}
	const rawValues = Array.isArray(value) ? value : [value];
	return rawValues
		.flatMap((entry) => entry.split(","))
		.map((entry) => entry.trim())
		.filter(Boolean);
}

async function assertSourceDirectory(sourcePath: string): Promise<boolean> {
	try {
		const stats = await stat(sourcePath);
		return stats.isDirectory();
	} catch {
		return false;
	}
}

function logWithChannel(message: string, jsonOutput: boolean) {
	if (jsonOutput) {
		console.error(message);
		return;
	}
	console.log(message);
}

async function withPrompter<T>(fn: (ask: (prompt: string) => Promise<string>) => Promise<T>) {
	const rl = createInterface({ input: process.stdin, output: process.stderr });
	try {
		return await fn((prompt) => rl.question(prompt));
	} finally {
		rl.close();
	}
}

async function promptChoice(
	ask: (prompt: string) => Promise<string>,
	question: string,
	choices: string[],
	defaultValue: string,
): Promise<string> {
	const normalizedChoices = new Map(choices.map((choice) => [choice.toLowerCase(), choice]));
	while (true) {
		const answer = (await ask(question)).trim();
		if (!answer) {
			return defaultValue;
		}
		const normalized = answer.toLowerCase();
		const match = normalizedChoices.get(normalized);
		if (match) {
			return match;
		}
		console.error(`Please enter one of: ${choices.join(", ")}.`);
	}
}

async function promptConfirm(
	ask: (prompt: string) => Promise<string>,
	question: string,
	defaultValue: boolean,
): Promise<boolean> {
	const choices = ["yes", "no"];
	const defaultLabel = defaultValue ? "yes" : "no";
	const answer = await promptChoice(
		ask,
		`${question} (${choices.join("/")}) [${defaultLabel}]: `,
		choices,
		defaultLabel,
	);
	return answer.toLowerCase() === "yes";
}

export const syncCommandsCommand: CommandModule<Record<string, never>, SyncCommandsArgs> = {
	command: "sync-commands",
	describe: "Sync canonical slash commands to supported agents",
	builder: (yargs) =>
		yargs
			.usage("agentctl sync-commands [options]")
			.option("skip", {
				type: "string",
				describe: `Comma-separated targets to skip (${SUPPORTED_TARGETS})`,
			})
			.option("only", {
				type: "string",
				describe: `Comma-separated targets to sync (${SUPPORTED_TARGETS})`,
			})
			.option("yes", {
				type: "boolean",
				default: false,
				describe: "Accept defaults and skip confirmation prompts",
			})
			.option("json", {
				type: "boolean",
				default: false,
				describe: "Output JSON summary",
			})
			.option("remove-missing", {
				type: "boolean",
				default: true,
				describe: "Remove previously synced commands missing from the catalog",
			})
			.option("conflicts", {
				type: "string",
				choices: ["overwrite", "rename", "skip"],
				describe: "Conflict resolution strategy",
			})
			.epilog(`Supported targets: ${SUPPORTED_TARGETS}`)
			.example("agentctl sync-commands", "Sync all targets with prompts")
			.example("agentctl sync-commands --only claude,gemini", "Sync only Claude and Gemini")
			.example("agentctl sync-commands --skip codex", "Skip Codex prompts")
			.example("agentctl sync-commands --yes", "Accept defaults and apply changes"),
	handler: async (argv) => {
		const skipList = parseList(argv.skip);
		const onlyList = parseList(argv.only);
		const nonInteractive = argv.yes || !process.stdin.isTTY;

		if (skipList.length > 0 && onlyList.length > 0) {
			console.error("Error: Use either --skip or --only, not both.");
			process.exit(1);
			return;
		}

		const unknownTargets = [...skipList, ...onlyList].filter(
			(name) => !isSlashCommandTargetName(name),
		);
		if (unknownTargets.length > 0) {
			console.error(
				`Error: Unknown target name(s): ${unknownTargets.join(", ")}. ` +
					`Supported targets: ${SUPPORTED_TARGETS}.`,
			);
			process.exit(1);
			return;
		}

		const availableTargets = SLASH_COMMAND_TARGETS.map((target) => target.name);
		let selectedTargets: TargetName[] = [];
		if (onlyList.length > 0) {
			selectedTargets = onlyList as TargetName[];
		} else if (skipList.length > 0) {
			const skipSet = new Set(skipList);
			selectedTargets = availableTargets.filter((name) => !skipSet.has(name));
		}

		if (selectedTargets.length === 0) {
			if (nonInteractive) {
				selectedTargets = availableTargets;
			} else {
				selectedTargets = await withPrompter(async (ask) => {
					const targetList = SLASH_COMMAND_TARGETS.map((target) => {
						const supportLabel = target.supportsSlashCommands ? "commands" : "unsupported";
						return `${target.name} (${target.displayName}, ${supportLabel})`;
					}).join(", ");
					const prompt = `Select targets to sync (comma-separated) [all]: ${targetList}\n> `;
					const answer = (await ask(prompt)).trim();
					if (!answer) {
						return availableTargets;
					}
					const parsed = answer
						.split(",")
						.map((entry) => entry.trim())
						.filter(Boolean);
					const invalid = parsed.filter((name) => !isSlashCommandTargetName(name));
					if (invalid.length > 0) {
						console.error(
							`Error: Unknown target name(s): ${invalid.join(", ")}. ` +
								`Supported targets: ${SUPPORTED_TARGETS}.`,
						);
						process.exit(1);
						return [];
					}
					return parsed as TargetName[];
				});
			}
		}

		if (selectedTargets.length === 0) {
			console.error("Error: No targets selected after applying filters.");
			process.exit(1);
			return;
		}

		const startDir = process.cwd();
		const repoRoot = await findRepoRoot(startDir);

		if (!repoRoot) {
			console.error(
				`Error: Repository root not found starting from ${startDir}. Looked for .git or package.json.`,
			);
			process.exit(1);
			return;
		}

		const sourcePath = path.join(repoRoot, "agents", "commands");
		if (!(await assertSourceDirectory(sourcePath))) {
			console.error(`Error: Command catalog not found at ${sourcePath}.`);
			process.exit(1);
			return;
		}

		const scopeByTarget: Partial<Record<TargetName, Scope>> = {};
		let unsupportedFallback: UnsupportedFallback | undefined;
		let codexOption: CodexOption | undefined;
		let codexConversionScope: CodexConversionScope | undefined;

		if (!nonInteractive) {
			await withPrompter(async (ask) => {
				for (const targetName of selectedTargets) {
					const profile = getTargetProfile(targetName);
					if (!profile.supportsSlashCommands) {
						if (!unsupportedFallback) {
							const choice = await promptChoice(
								ask,
								`${profile.displayName} does not support slash commands. ` +
									"Convert to skills instead? (convert/skip) [skip]: ",
								["convert", "skip"],
								"skip",
							);
							unsupportedFallback = choice === "convert" ? "convert_to_skills" : "skip";
						}
						continue;
					}

					if (targetName === "codex") {
						if (!codexOption) {
							logWithChannel(
								"Codex only supports global prompts (no project-level custom commands).",
								argv.json,
							);
							const choice = await promptChoice(
								ask,
								"Choose Codex option (global/convert/skip) [global]: ",
								["global", "convert", "skip"],
								"global",
							);
							codexOption =
								choice === "convert"
									? "convert_to_skills"
									: choice === "skip"
										? "skip"
										: "prompts";
							if (codexOption === "convert_to_skills") {
								logWithChannel(
									"Codex skill conversion supports global (default) or project scope; project may not work.",
									argv.json,
								);
								const scopeChoice = await promptChoice(
									ask,
									"Choose conversion scope (global/project/skip) [global]: ",
									["global", "project", "skip"],
									"global",
								);
								codexConversionScope = scopeChoice as CodexConversionScope;
							}
						}
						continue;
					}

					if (profile.supportedScopes.length > 1 && !scopeByTarget[targetName]) {
						const defaultScope = getDefaultScope(profile);
						const scopeChoice = await promptChoice(
							ask,
							`Select scope for ${profile.displayName} (project/global) [${defaultScope}]: `,
							["project", "global"],
							defaultScope,
						);
						scopeByTarget[targetName] = scopeChoice as Scope;
					}
				}
			});
		}

		if (nonInteractive) {
			for (const targetName of selectedTargets) {
				const profile = getTargetProfile(targetName);
				if (profile.supportedScopes.length > 1 && !scopeByTarget[targetName]) {
					scopeByTarget[targetName] = getDefaultScope(profile);
				}
			}
		}

		const conflictResolution = argv.conflicts as ConflictResolution | undefined;
		const planRequestBase = {
			repoRoot,
			targets: selectedTargets,
			scopeByTarget,
			removeMissing: argv.removeMissing,
			unsupportedFallback: unsupportedFallback ?? (nonInteractive ? "skip" : undefined),
			codexOption: codexOption ?? (nonInteractive ? "prompts" : undefined),
			codexConversionScope: codexConversionScope ?? (nonInteractive ? "global" : undefined),
			conflictResolution: conflictResolution ?? "skip",
			useDefaults: argv.yes,
			nonInteractive,
		};

		let planDetails: SyncPlanDetails;
		try {
			planDetails = await planSlashCommandSync(planRequestBase);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(`Error: ${message}`);
			process.exit(1);
			return;
		}

		if (!nonInteractive && !conflictResolution && planDetails.conflicts > 0) {
			await withPrompter(async (ask) => {
				const resolution = await promptChoice(
					ask,
					"Conflicts detected. Choose resolution (overwrite/rename/skip) [skip]: ",
					["overwrite", "rename", "skip"],
					"skip",
				);
				planDetails = await planSlashCommandSync({
					...planRequestBase,
					conflictResolution: resolution as ConflictResolution,
				});
			});
		}

		if (!nonInteractive && !argv.yes) {
			logWithChannel(
				formatPlanSummary(planDetails.plan, planDetails.targetSummaries),
				argv.json,
			);
			const shouldApply = await withPrompter((ask) =>
				promptConfirm(ask, "Apply these changes?", false),
			);
			if (!shouldApply) {
				logWithChannel("Aborted.", argv.json);
				return;
			}
		}

		const summary = await applySlashCommandSync(planDetails);
		const output = formatSyncSummary(summary, argv.json);
		if (output.length > 0) {
			console.log(output);
		}

		if (summary.hadFailures) {
			process.exitCode = 1;
		}
	},
};
