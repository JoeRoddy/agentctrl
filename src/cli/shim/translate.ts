import type {
	FlagMap,
	InvocationMode,
	TargetCliDefinition,
	TranslationResult,
} from "../../lib/targets/config-types.js";
import type { ResolvedInvocation } from "./types.js";

type TranslateOptions = {
	includePassthrough?: boolean;
};

function formatWarning(agentId: string, flag: string, value?: string): string {
	const suffix = value ? ` (${value})` : "";
	return `Warning: ${agentId} does not support ${flag}${suffix}; ignoring.`;
}

function resolveFlagMapValue<T extends string>(
	map: FlagMap<T> | undefined,
	mode: InvocationMode,
	value: T,
): string[] | null | undefined {
	if (!map) {
		return undefined;
	}
	const byMode = map.byMode?.[mode];
	if (byMode && Object.hasOwn(byMode, value)) {
		return byMode[value];
	}
	if (map.values && Object.hasOwn(map.values, value)) {
		return map.values[value];
	}
	return undefined;
}

function modeAllowed(modes: InvocationMode[] | undefined, mode: InvocationMode): boolean {
	if (!modes || modes.length === 0) {
		return true;
	}
	return modes.includes(mode);
}

function buildPromptArgs(
	invocation: ResolvedInvocation,
	cli: TargetCliDefinition,
	warnings: string[],
): { promptArgs: string[]; position: "first" | "last" } {
	if (invocation.mode !== "one-shot" || invocation.prompt === null) {
		return { promptArgs: [], position: "last" };
	}
	if (!cli.prompt) {
		warnings.push(formatWarning(invocation.agent.id, "--prompt"));
		return { promptArgs: [], position: "last" };
	}
	if (cli.prompt.type === "flag") {
		return { promptArgs: [...cli.prompt.flag, invocation.prompt], position: "last" };
	}
	const position = cli.prompt.position === "first" ? "first" : "last";
	return { promptArgs: [invocation.prompt], position };
}

export function translateInvocation(
	invocation: ResolvedInvocation,
	cli: TargetCliDefinition,
	options: TranslateOptions = {},
): TranslationResult {
	if (cli.translate) {
		return cli.translate(invocation);
	}

	const includePassthrough = options.includePassthrough !== false;
	const warnings: string[] = [];
	const mode = invocation.mode;
	const base = mode === "interactive" ? cli.modes.interactive : cli.modes.oneShot;
	const args: string[] = [...(base.args ?? [])];

	const { requests } = invocation;
	const flags = cli.flags;

	if (requests.approval) {
		const mapped = resolveFlagMapValue(flags?.approval, mode, requests.approval);
		if (mapped === undefined || mapped === null) {
			warnings.push(formatWarning(invocation.agent.id, "--approval", requests.approval));
		} else {
			args.push(...mapped);
		}
	}

	if (requests.sandbox) {
		const mapped = resolveFlagMapValue(flags?.sandbox, mode, requests.sandbox);
		if (mapped === undefined || mapped === null) {
			warnings.push(formatWarning(invocation.agent.id, "--sandbox", requests.sandbox));
		} else {
			args.push(...mapped);
		}
	}

	if (requests.output) {
		const mapped = resolveFlagMapValue(flags?.output, mode, requests.output);
		if (mapped === undefined || mapped === null) {
			warnings.push(formatWarning(invocation.agent.id, "--output", requests.output));
		} else {
			args.push(...mapped);
		}
	}

	if (requests.model) {
		if (!flags?.model || !modeAllowed(flags.model.modes, mode)) {
			warnings.push(formatWarning(invocation.agent.id, "--model", requests.model));
		} else {
			args.push(...flags.model.flag, requests.model);
		}
	}

	if (requests.web !== undefined) {
		const modeAllowedForWeb = modeAllowed(flags?.web?.modes, mode);
		if (!flags?.web || !modeAllowedForWeb) {
			warnings.push(formatWarning(invocation.agent.id, "--web", requests.web ? "on" : "off"));
		} else {
			const mapped = requests.web ? flags.web.on : flags.web.off;
			if (mapped === undefined || mapped === null) {
				warnings.push(formatWarning(invocation.agent.id, "--web", requests.web ? "on" : "off"));
			} else {
				args.push(...mapped);
			}
		}
	}

	if (mode === "one-shot" && base.args?.includes("exec")) {
		const searchIndex = args.indexOf("--search");
		if (searchIndex > -1) {
			args.splice(searchIndex, 1);
			args.unshift("--search");
		}
	}

	const { promptArgs, position } = buildPromptArgs(invocation, cli, warnings);
	const passthroughArgs = includePassthrough ? invocation.passthrough.args : [];

	if (promptArgs.length === 0) {
		return {
			command: base.command,
			args: [...args, ...passthroughArgs],
			warnings,
		};
	}

	const passthroughPosition = cli.passthrough?.position ?? "after";
	const beforePrompt = passthroughPosition === "before-prompt" ? passthroughArgs : ([] as string[]);
	const afterPrompt = passthroughPosition === "before-prompt" ? ([] as string[]) : passthroughArgs;

	if (position === "first") {
		return {
			command: base.command,
			args: [...beforePrompt, ...promptArgs, ...args, ...afterPrompt],
			warnings,
		};
	}

	return {
		command: base.command,
		args: [...args, ...beforePrompt, ...promptArgs, ...afterPrompt],
		warnings,
	};
}
