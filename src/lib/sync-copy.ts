import { cp, mkdir } from "node:fs/promises";

export async function copyDirectory(source: string, destination: string): Promise<void> {
	await mkdir(destination, { recursive: true });
	await cp(source, destination, { recursive: true, force: true });
}
