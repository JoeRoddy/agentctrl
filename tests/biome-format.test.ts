import { describe, expect, it } from "vitest";

import { createTempProject } from "./helpers/biome-test-utils.js";

const withTempProject = (fn: (project: ReturnType<typeof createTempProject>) => void) => {
	const project = createTempProject();
	try {
		return fn(project);
	} finally {
		project.cleanup();
	}
};

describe("Biome format command", () => {
	it("should format unformatted code", () =>
		withTempProject((project) => {
			project.writeFile("src/unformatted.ts", "export const greeting = 'hi'\n");

			const result = project.run("npm run format");
			const formatted = project.readFile("src/unformatted.ts");

			expect(result.code).toBe(0);
			expect(formatted).toBe('export const greeting = "hi";\n');
		}));

	it("should not modify correctly formatted code", () =>
		withTempProject((project) => {
			const content = 'export const greeting = "hi";\n';
			project.writeFile("src/formatted.ts", content);

			const result = project.run("npm run format");
			const formatted = project.readFile("src/formatted.ts");

			expect(result.code).toBe(0);
			expect(formatted).toBe(content);
		}));

	it("should organize imports", () =>
		withTempProject((project) => {
			project.writeFile(
				"src/organize-imports.ts",
				[
					'import zeta from "./zeta.js";',
					'import alpha from "./alpha.js";',
					"",
					"export const value = alpha + zeta;",
					"",
				].join("\n"),
			);

			// Biome organizes imports as part of the check pipeline.
			const result = project.run("npm run check:write");
			const organized = project.readFile("src/organize-imports.ts");

			expect(result.code).toBe(0);
			expect(organized).toBe(
				[
					'import alpha from "./alpha.js";',
					'import zeta from "./zeta.js";',
					"",
					"export const value = alpha + zeta;",
					"",
				].join("\n"),
			);
		}));
});
