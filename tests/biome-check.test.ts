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

describe("Biome check commands", () => {
	it("should detect formatting issues without modifying files", () =>
		withTempProject((project) => {
			const content = "export const greeting = 'hi'\n";
			project.writeFile("src/format-check.ts", content);

			const result = project.run("npm run format:check");
			const after = project.readFile("src/format-check.ts");

			expect(result.code).toBe(1);
			expect(after).toBe(content);
		}));

	it("should detect linting issues without modifying files", () =>
		withTempProject((project) => {
			const content = "const unused = 1;\nexport const value = 2;\n";
			project.writeFile("src/lint-check.ts", content);

			const result = project.run("npm run lint:check");
			const after = project.readFile("src/lint-check.ts");

			expect(result.code).toBe(1);
			expect(after).toBe(content);
		}));

	it("should return success for compliant code", () =>
		withTempProject((project) => {
			const content = 'export const greeting = "hi";\n';
			project.writeFile("src/clean.ts", content);

			const result = project.run("npm run check");
			const after = project.readFile("src/clean.ts");

			expect(result.code).toBe(0);
			expect(after).toBe(content);
		}));
});
