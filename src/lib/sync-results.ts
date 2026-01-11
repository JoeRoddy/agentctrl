import type { TargetName } from "./sync-targets.js";

export type SyncStatus = "synced" | "skipped" | "failed";

export type SyncResult = {
	targetName: TargetName;
	status: SyncStatus;
	message: string;
	error?: string | null;
};

export type SyncSummary = {
	sourcePath: string;
	results: SyncResult[];
	hadFailures: boolean;
};

export function buildSummary(sourcePath: string, results: SyncResult[]): SyncSummary {
	return {
		sourcePath,
		results,
		hadFailures: results.some((result) => result.status === "failed"),
	};
}

export function formatSummary(summary: SyncSummary, jsonOutput: boolean): string {
	if (jsonOutput) {
		return JSON.stringify(summary, null, 2);
	}

	return summary.results.map((result) => result.message).join("\n");
}
