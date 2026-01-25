import type { TargetDefinition } from "../../config-types.js";

export const geminiTarget: TargetDefinition = {
	id: "gemini",
	displayName: "Gemini CLI",
	cli: {
		modes: {
			interactive: { command: "gemini" },
			oneShot: { command: "gemini" },
		},
		prompt: { type: "flag", flag: ["-p"] },
		flags: {
			approval: {
				values: {
					prompt: ["--approval-mode", "default"],
					"auto-edit": ["--approval-mode", "auto_edit"],
					yolo: ["--yolo"],
				},
			},
			sandbox: {
				values: {
					"workspace-write": ["--sandbox"],
					off: [],
				},
			},
			output: {
				byMode: {
					"one-shot": {
						text: [],
						json: ["--output-format", "json"],
						"stream-json": ["--output-format", "stream-json"],
					},
				},
			},
			model: { flag: ["--model"] },
			web: { on: [], off: null },
		},
	},
	outputs: {
		skills: "{repoRoot}/.omniagent/skills/{itemName}",
		subagents: {
			path: "{repoRoot}/.omniagent/subagents/{itemName}",
			fallback: { mode: "convert", targetType: "skills" },
		},
		commands: {
			projectPath: "{repoRoot}/.omniagent/commands/{itemName}.toml",
			userPath: "{homeDir}/.omniagent/commands/{itemName}.toml",
		},
		instructions: {
			filename: "GEMINI.md",
		},
	},
};
