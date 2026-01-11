import type { SlashCommandDefinition } from "./catalog.js";

function ensureTrailingNewline(value: string): string {
	return value.endsWith("\n") ? value : `${value}\n`;
}

function formatTomlString(value: string): string {
	return JSON.stringify(value);
}

function formatYamlString(value: string): string {
	return JSON.stringify(value);
}

export function renderClaudeCommand(command: SlashCommandDefinition): string {
	const prompt = command.prompt.trimEnd();
	if (command.description) {
		const header = [
			"---",
			`description: ${formatYamlString(command.description)}`,
			"---",
			"",
		].join("\n");
		return ensureTrailingNewline(`${header}${prompt}`);
	}
	return ensureTrailingNewline(prompt);
}

export function renderGeminiCommand(command: SlashCommandDefinition): string {
	const lines: string[] = [];
	if (command.description) {
		lines.push(`description = ${formatTomlString(command.description)}`);
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
	if (command.description) {
		headerLines.push("", command.description);
	}
	const prompt = command.prompt.trim();
	return ensureTrailingNewline(`${headerLines.join("\n")}\n\n${prompt}`);
}
