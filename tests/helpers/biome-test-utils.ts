import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

type CommandResult = {
	code: number;
	stdout: string;
	stderr: string;
};

type TempProject = {
	dir: string;
	writeFile: (relativePath: string, contents: string) => void;
	readFile: (relativePath: string) => string;
	run: (command: string) => CommandResult;
	cleanup: () => void;
};

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const rootPackageJson = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8")) as {
	scripts?: Record<string, string>;
};
const rootNodeModules = path.join(repoRoot, "node_modules");
const rootBiomeConfig = path.join(repoRoot, "biome.json");
const rootBinDir = path.join(rootNodeModules, ".bin");

const scriptNames = [
	"build",
	"check",
	"check:write",
	"format",
	"format:check",
	"lint",
	"lint:check",
];

const getScripts = () => {
	const scripts = rootPackageJson.scripts ?? {};
	return Object.fromEntries(
		scriptNames.filter((name) => scripts[name]).map((name) => [name, scripts[name]]),
	);
};

const linkNodeModules = (targetDir: string) => {
	if (!existsSync(rootNodeModules)) {
		return;
	}

	const linkPath = path.join(targetDir, "node_modules");
	if (existsSync(linkPath)) {
		return;
	}

	try {
		symlinkSync(rootNodeModules, linkPath, "junction");
	} catch {
		try {
			symlinkSync(rootNodeModules, linkPath);
		} catch {
			// Fall back to PATH-based resolution.
		}
	}
};

export const createTempProject = (): TempProject => {
	const dir = mkdtempSync(path.join(os.tmpdir(), "agentctl-biome-"));
	const scripts = getScripts();

	writeFileSync(
		path.join(dir, "package.json"),
		JSON.stringify(
			{
				name: "agentctl-biome-temp",
				private: true,
				type: "module",
				scripts,
			},
			null,
			2,
		),
	);

	copyFileSync(rootBiomeConfig, path.join(dir, "biome.json"));
	mkdirSync(path.join(dir, "src"), { recursive: true });
	mkdirSync(path.join(dir, "tests"), { recursive: true });
	linkNodeModules(dir);

	const run = (command: string): CommandResult => {
		const result = spawnSync(command, {
			cwd: dir,
			env: {
				...process.env,
				PATH: `${rootBinDir}${path.delimiter}${process.env.PATH ?? ""}`,
			},
			encoding: "utf8",
			shell: true,
		});

		return {
			code: result.status ?? 1,
			stdout: result.stdout ?? "",
			stderr: result.stderr ?? "",
		};
	};

	const writeFile = (relativePath: string, contents: string) => {
		const filePath = path.join(dir, relativePath);
		mkdirSync(path.dirname(filePath), { recursive: true });
		writeFileSync(filePath, contents);
	};

	const readFile = (relativePath: string) => readFileSync(path.join(dir, relativePath), "utf8");

	const cleanup = () => {
		rmSync(dir, { recursive: true, force: true });
	};

	return {
		dir,
		writeFile,
		readFile,
		run,
		cleanup,
	};
};
