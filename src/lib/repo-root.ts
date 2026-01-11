import { stat } from "node:fs/promises";
import path from "node:path";

async function isDirectory(candidate: string): Promise<boolean> {
	try {
		const stats = await stat(candidate);
		return stats.isDirectory();
	} catch {
		return false;
	}
}

export async function findRepoRoot(
	startDir: string,
	markerRelativePath = path.join("agents", "skills"),
): Promise<string | null> {
	let current = path.resolve(startDir);
	let previous = "";

	while (current !== previous) {
		const markerPath = path.join(current, markerRelativePath);
		if (await isDirectory(markerPath)) {
			return current;
		}

		previous = current;
		current = path.dirname(current);
	}

	return null;
}
