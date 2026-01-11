export const TARGETS = [
	{ name: "codex", relativePath: ".codex/skills" },
	{ name: "claude", relativePath: ".claude/skills" },
	{ name: "copilot", relativePath: ".github/skills" },
] as const;

export type TargetName = (typeof TARGETS)[number]["name"];
export type TargetSpec = (typeof TARGETS)[number];

const targetNames = TARGETS.map((target) => target.name) as TargetName[];
const targetNameSet = new Set<TargetName>(targetNames);

export function isTargetName(value: string): value is TargetName {
	return targetNameSet.has(value as TargetName);
}
