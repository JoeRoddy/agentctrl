export const agentConfig = {
	agentId: "copilot",
	cliCommand: "copilot",
	model: process.env.OA_E2E_COPILOT_MODEL ?? null,
	passthroughDefaults: ["--silent"],
	passthroughArgs: ["--version"],
};

export const expectedDir = new URL("./expected/", import.meta.url);
