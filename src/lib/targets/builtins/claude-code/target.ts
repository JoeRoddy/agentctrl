import type { TargetDefinition } from "../../config-types.js";

export const claudeTarget: TargetDefinition = {
	id: "claude",
	displayName: "Claude Code",
	cli: {
		modes: {
			interactive: { command: "claude" },
			oneShot: { command: "claude" },
		},
		prompt: { type: "flag", flag: ["-p"] },
		flags: {
			approval: {
				values: {
					prompt: [],
					"auto-edit": null,
					yolo: ["--dangerously-skip-permissions"],
				},
			},
			output: {
				byMode: {
					"one-shot": {
						text: [],
						json: ["--output-format", "json"],
						"stream-json": ["--output-format", "stream-json", "--verbose"],
					},
				},
			},
			model: { flag: ["--model"] },
		},
	},
	outputs: {
		skills: "{repoRoot}/.omniagent/skills/{itemName}",
		subagents: "{repoRoot}/.omniagent/subagents/{itemName}.md",
		commands: {
			projectPath: "{repoRoot}/.omniagent/commands/{itemName}.md",
			userPath: "{homeDir}/.omniagent/commands/{itemName}.md",
		},
		instructions: {
			filename: "CLAUDE.md",
		},
	},
};
