# Implementation Plan: CLI Foundation

**Branch**: `001-cli-foundation` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-cli-foundation/spec.md`

## Summary

Set up a minimal TypeScript CLI project using Vite for bundling and yargs for argument parsing. The goal is a working "hello world" CLI that validates the build pipeline works end-to-end.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+
**Primary Dependencies**: yargs (CLI parsing only)
**Storage**: N/A
**Testing**: Vitest (included with Vite)
**Target Platform**: Node.js CLI (cross-platform)
**Project Type**: Single project
**Performance Goals**: N/A (hello world)
**Constraints**: Minimal dependencies - only yargs for runtime
**Scale/Scope**: Single CLI entry point with hello world output

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. CLI-First Compiler Design | ✅ Pass | Foundation sets up CLI infrastructure only, no runtime behavior |
| II. Markdown-First Output | ✅ Pass | Not applicable to hello world; future commands will follow |
| III. Lossy Mapping Transparency | ✅ Pass | Not applicable to foundation |
| IV. Test-Driven Validation | ✅ Pass | Vitest included for future tests |
| V. Predictable Resolution Order | ✅ Pass | Not applicable to hello world |

**Gate Result**: PASS - No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-cli-foundation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # N/A for CLI foundation
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── cli/
│   └── index.ts         # CLI entry point with yargs setup
└── index.ts             # Main export

tests/
└── cli.test.ts          # Basic CLI tests

dist/                    # Vite build output
```

**Structure Decision**: Single project structure. Minimal `src/cli/` for CLI entry point. Tests co-located in `tests/` directory.

## Complexity Tracking

> No violations - table not needed.
