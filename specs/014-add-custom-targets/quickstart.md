# Quickstart: Custom Agent Target Configuration

## 1) Add a minimal custom target

Create `/Users/joeroddy/Documents/dev/projects/open-source/omniagent/omniagent.config.ts`:

```ts
import { defineConfig } from "omniagent";

export default defineConfig({
	targets: [
		{
			id: "cursor",
			outputs: {
				skills: "{repo}/.cursor/skills",
				commands: "{repo}/.cursor/commands",
				subagents: "{repo}/.cursor/agents",
				// instructions omitted -> defaults to AGENTS.md per output directory
			},
		},
	],
});
```

`{repo}` resolves to the repository root; `{home}` is also supported for user-level destinations.

Run from repo root:

```bash
omniagent sync --targets cursor
```

Expected outputs (example):
- `/Users/joeroddy/Documents/dev/projects/open-source/omniagent/.cursor/skills/<name>/skill.md`
- `/Users/joeroddy/Documents/dev/projects/open-source/omniagent/.cursor/commands/<name>.md`
- `/Users/joeroddy/Documents/dev/projects/open-source/omniagent/.cursor/agents/<name>.md`
- `/Users/joeroddy/Documents/dev/projects/open-source/omniagent/AGENTS.md`

## 2) Disable instructions for a target (explicit)

If a tool does not support instructions, set `instructions: false`:

```ts
export default defineConfig({
	targets: [
		{
			id: "legacy-cli",
			outputs: {
				skills: "{repo}/.legacy/skills",
				instructions: false,
			},
		},
	],
});
```

This skips instruction outputs only for `legacy-cli`. Other targets that support instructions still emit `AGENTS.md`.

## 3) Real-world collision example: multiple targets and AGENTS.md

Two teams add Cursor and Windsurf outputs for the same repo. They do **not** configure instructions explicitly:

```ts
export default defineConfig({
	targets: [
		{
			id: "cursor",
			outputs: {
				skills: "{repo}/.cursor/skills",
				commands: "{repo}/.cursor/commands",
				subagents: "{repo}/.cursor/agents",
			},
		},
		{
			id: "windsurf",
			outputs: {
				skills: "{repo}/.windsurf/skills",
				commands: "{repo}/.windsurf/commands",
			},
		},
	],
});
```

Result: both targets default to a **single** canonical `AGENTS.md` in the repo root. If a custom template output tries to write to the same `AGENTS.md`, the sync warns and skips that template output (the canonical file remains).
