import type { FrontmatterValue, SlashCommandDefinition } from "./catalog.js";

function ensureTrailingNewline(value: string): string {
	return value.endsWith("\n") ? value : `${value}\n`;
}

function formatTomlString(value: string): string {
	return JSON.stringify(value);
}

function formatTomlValue(value: FrontmatterValue): string {
	if (Array.isArray(value)) {
		return `[${value.map((entry) => formatTomlString(entry)).join(", ")}]`;
	}
	return formatTomlString(value);
}

const GEMINI_RESERVED_KEYS = new Set(["prompt", "targets", "targetagents"]);

export function renderClaudeCommand(command: SlashCommandDefinition): string {
	const prompt = command.prompt.trimEnd();
	return ensureTrailingNewline(prompt);
}

export function renderGeminiCommand(command: SlashCommandDefinition): string {
	const lines: string[] = [];
	for (const [key, value] of Object.entries(command.frontmatter)) {
		const normalizedKey = key.trim();
		if (!normalizedKey) {
			continue;
		}
		if (GEMINI_RESERVED_KEYS.has(normalizedKey.toLowerCase())) {
			continue;
		}
		lines.push(`${normalizedKey} = ${formatTomlValue(value)}`);
	}
	lines.push(`prompt = ${formatTomlString(command.prompt)}`);
	return ensureTrailingNewline(lines.join("\n"));
}

export function renderCodexPrompt(command: SlashCommandDefinition): string {
	const prompt = command.prompt.trimEnd();
	return ensureTrailingNewline(prompt);
}

export function renderSkillFromCommand(command: SlashCommandDefinition): string {
	const headerLines = [`# ${command.name}`];
	const prompt = command.prompt.trim();
	return ensureTrailingNewline(`${headerLines.join("\n")}\n\n${prompt}`);
}
