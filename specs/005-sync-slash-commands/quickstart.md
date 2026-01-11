# Quickstart: Sync Custom Slash Commands

## Prerequisites
- Create canonical commands in `agents/commands/` using Claude Code's command
  definition format (Markdown file per command, filename = command name,
  optional YAML frontmatter for description).
- Build the CLI (if running from source):

```bash
cd /Users/joeroddy/Documents/dev/projects/open-source/agentctl
npm install
npm run build
```

## Create a Command

```bash
mkdir -p /Users/joeroddy/Documents/dev/projects/open-source/agentctl/agents/commands
cat <<'CMD' > /Users/joeroddy/Documents/dev/projects/open-source/agentctl/agents/commands/plan-release.md
---
description: "Draft a release plan"
---
Summarize the release steps, owners, and timeline.
CMD
```

## Sync Commands (Interactive)

```bash
node /Users/joeroddy/Documents/dev/projects/open-source/agentctl/dist/cli.js sync-commands
```

Expected: prompts for target selection, per-target scope (project/global where
available), and conflict handling, followed by a per-target summary.

## Sync Commands with Defaults

```bash
node /Users/joeroddy/Documents/dev/projects/open-source/agentctl/dist/cli.js sync-commands --yes
```

Expected: defaults are applied (project scope for Gemini/Claude, global for
Codex conversions, skip for unsupported targets) and a summary is printed.

## Limit Targets

```bash
node /Users/joeroddy/Documents/dev/projects/open-source/agentctl/dist/cli.js sync-commands --only claude,gemini
node /Users/joeroddy/Documents/dev/projects/open-source/agentctl/dist/cli.js sync-commands --skip codex
```

## JSON Output

```bash
node /Users/joeroddy/Documents/dev/projects/open-source/agentctl/dist/cli.js sync-commands --json
```
