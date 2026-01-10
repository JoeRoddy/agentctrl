import { describe, expect, it } from "vitest";

import { createTempProject } from "./helpers/biome-test-utils.js";

const withTempProject = (fn: (project: ReturnType<typeof createTempProject>) => void) => {
	const project = createTempProject();
	try {
		return (fn as (project: ReturnType<typeof createTempProject>) => void)(project);
	} finally {
		project.cleanup();
	}
};

describe("Biome build integration", () => {
	it("should run Biome checks during build", () =>
		withTempProject((project) => {
			project.writeFile("src/bad-format.ts", "export const value = 'bad'\n");

			const result = project.run("npm run build");
			const output = `${result.stdout}\n${result.stderr}`;

			expect(result.code).toBe(1);
			expect(output).toContain("bad-format.ts");
		}));

	it("should fail build when formatting issues exist", () =>
		withTempProject((project) => {
			project.writeFile("src/formatting-issue.ts", "export const value = 'bad'\n");

			const result = project.run("npm run build");

			expect(result.code).toBe(1);
		}));

	it("should fail build when linting issues exist", () =>
		withTempProject((project) => {
			project.writeFile("src/lint-issue.ts", "const unused = 1;\nexport const value = 2;\n");

			const result = project.run("npm run build");

			expect(result.code).toBe(1);
		}));
});
