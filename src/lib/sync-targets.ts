export const TARGETS = [
	{ name: "codex", relativePath: ".codex/skills" },
	{ name: "claude", relativePath: ".claude/skills" },
	{ name: "copilot", relativePath: ".github/skills" },
	{ name: "gemini", relativePath: ".gemini/skills" },
] as const;

export type TargetName = (typeof TARGETS)[number]["name"];
export type TargetSpec = (typeof TARGETS)[number];
export type RawTargetValue = string | string[] | null | undefined;
export type TargetId = string;

const targetNames = TARGETS.map((target) => target.name) as TargetName[];
const targetNameSet = new Set<TargetName>(targetNames);
let customTargetNames = new Set<string>();

export class InvalidFrontmatterTargetsError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidFrontmatterTargetsError";
	}
}

export function isTargetName(value: string): value is TargetName {
	return targetNameSet.has(value as TargetName);
}

export function isKnownTargetName(value: string): value is string {
	const normalized = value.trim().toLowerCase();
	return targetNameSet.has(normalized as TargetName) || customTargetNames.has(normalized);
}

export function setCustomTargetNames(names: string[]): void {
	customTargetNames = new Set(names.map((name) => name.trim().toLowerCase()).filter(Boolean));
}

export function getCustomTargetNames(): string[] {
	return Array.from(customTargetNames.values());
}

export function getBuiltInTargetNames(): string[] {
	return [...targetNames];
}

function normalizeTargetInputs(rawValues: RawTargetValue[]): string[] {
	const values: string[] = [];
	for (const raw of rawValues) {
		if (!raw) {
			continue;
		}
		if (Array.isArray(raw)) {
			values.push(...raw);
		} else if (typeof raw === "string") {
			values.push(raw);
		}
	}

	return values
		.map((value) => value.trim())
		.filter(Boolean)
		.map((value) => value.toLowerCase());
}

function dedupeTargets<T extends string>(values: T[]): T[] {
	const seen = new Set<string>();
	const output: T[] = [];
	for (const value of values) {
		const key = value.toLowerCase();
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		output.push(value);
	}
	return output;
}

export function resolveFrontmatterTargets<T extends string>(
	rawValues: RawTargetValue[],
	isValidTarget: (value: string) => value is T,
): { targets: T[] | null; invalidTargets: string[] } {
	const normalized = normalizeTargetInputs(rawValues);
	if (normalized.length === 0) {
		return { targets: null, invalidTargets: [] };
	}

	const targets: T[] = [];
	const invalidTargets: string[] = [];

	for (const value of normalized) {
		if (isValidTarget(value)) {
			targets.push(value);
		} else {
			invalidTargets.push(value);
		}
	}

	const dedupedTargets = dedupeTargets(targets);
	const dedupedInvalids = dedupeTargets(invalidTargets);
	return {
		targets: dedupedTargets.length > 0 ? dedupedTargets : null,
		invalidTargets: dedupedInvalids,
	};
}

export function hasRawTargetValues(rawValues: RawTargetValue[]): boolean {
	return rawValues.some((value) => value !== undefined && value !== null);
}

export function resolveEffectiveTargets<T extends string>(options: {
	defaultTargets: T[] | null;
	overrideOnly?: T[] | null;
	overrideSkip?: T[] | null;
	allTargets: T[];
}): T[] {
	const overrideOnly = options.overrideOnly ?? [];
	const overrideSkip = options.overrideSkip ?? [];
	let base: T[] = [];
	if (overrideOnly.length > 0) {
		base = overrideOnly;
	} else if (options.defaultTargets && options.defaultTargets.length > 0) {
		base = options.defaultTargets;
	} else {
		base = options.allTargets;
	}

	const skipSet = new Set(overrideSkip);
	return dedupeTargets(base.filter((target) => !skipSet.has(target)));
}
