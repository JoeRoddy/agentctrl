# Implementation Plan: Custom Agent Target Configuration

**Branch**: `014-add-custom-targets` | **Date**: January 20, 2026 | **Spec**: /Users/joeroddy/Documents/dev/projects/open-source/omniagent/specs/014-add-custom-targets/spec.md
**Input**: Feature specification from /Users/joeroddy/Documents/dev/projects/open-source/omniagent/specs/014-add-custom-targets/spec.md

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable repo-root `omniagent.config.ts` to define custom targets with path templates, converters, hooks, and derived capabilities while preserving built-in behavior. Implement default instruction output to `AGENTS.md`, explicit disablement per target, collision handling (canonical `AGENTS.md` with warnings for template collisions), and deterministic override behavior, all within the existing CLI compiler model.

## Technical Context

**Language/Version**: TypeScript 5.9 (ES2022) on Node.js 18+  
**Primary Dependencies**: yargs, @typescript/native-preview (tsgo), Vite, Vitest, Biome  
**Storage**: Filesystem (repo-local and user home directories)  
**Testing**: Vitest  
**Target Platform**: Node.js 18+ CLI (macOS/Linux/Windows)  
**Project Type**: Single CLI project  
**Performance Goals**: Validate under 500ms and compile/sync under 2s for typical repos; memory under 100MB  
**Constraints**: CLI-first compiler (no runtime agent execution); markdown-first outputs; generated outputs include provenance comments; explicit lossy mapping warnings; deterministic resolution order; no silent overwrites (except canonical `AGENTS.md`)  
**Scale/Scope**: 200+ items across skills/commands/subagents/instructions; multiple targets per sync

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| CLI-First Compiler Design | PASS | Adds config parsing and compilation only; no runtime agent execution. |
| Markdown-First, Human-Readable Output | PASS | Outputs remain markdown/TOML/JSON; config stays human-readable. |
| Explicit Lossy Mapping Transparency | PASS | Collisions and unsupported mappings surface warnings/errors. |
| Test-Driven Validation | PASS | Plan includes schema, unit, and integration tests for new config paths. |
| Predictable Resolution Order | PASS | Overrides inherit from built-ins; deterministic target selection. |
| Performance Standards | PASS | No new heavy runtime; targets align to existing thresholds. |

## Project Structure

### Documentation (this feature)

```text
/Users/joeroddy/Documents/dev/projects/open-source/omniagent/specs/014-add-custom-targets/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
/Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/
├── cli/
│   └── commands/
├── index.ts
└── lib/
    ├── custom-agents/
    ├── instructions/
    ├── skills/
    ├── slash-commands/
    └── subagents/

/Users/joeroddy/Documents/dev/projects/open-source/omniagent/tests/
├── commands/
├── docs/
├── lib/
└── subagents/
```

**Structure Decision**: Single CLI project; implementation lives under `/Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/` with tests in `/Users/joeroddy/Documents/dev/projects/open-source/omniagent/tests/`.

## Phase 0: Outline & Research

**Objectives**:
- Confirm the config loading approach for `omniagent.config.ts` and how overrides merge with built-ins.
- Define canonical collision handling for `AGENTS.md` vs other outputs and how warnings/errors are surfaced.
- Align error propagation (per-target failure) with CLI reporting and constitutional principles.

**Deliverable**: /Users/joeroddy/Documents/dev/projects/open-source/omniagent/specs/014-add-custom-targets/research.md

## Phase 1: Design & Contracts

**Deliverables**:
- Data model: /Users/joeroddy/Documents/dev/projects/open-source/omniagent/specs/014-add-custom-targets/data-model.md
- Contracts: /Users/joeroddy/Documents/dev/projects/open-source/omniagent/specs/014-add-custom-targets/contracts/omniagent-sync.openapi.yaml
- Quickstart: /Users/joeroddy/Documents/dev/projects/open-source/omniagent/specs/014-add-custom-targets/quickstart.md

**Agent Context Update**:
- Run `/Users/joeroddy/Documents/dev/projects/open-source/omniagent/.specify/scripts/bash/update-agent-context.sh codex`

## Phase 2: Implementation Plan (Outline)

- Add repo-root config discovery, validation, and load path for `omniagent.config.ts`.
- Introduce target registry that merges built-ins with overrides and disables.
- Implement output resolution with templated paths and callback support for skills/commands/subagents.
- Implement instruction defaulting to `AGENTS.md` per output directory and explicit disablement.
- Add collision detection with canonical `AGENTS.md` consolidation and warning behavior.
- Ensure generated outputs include provenance comments (or wrap converter output with provenance) for all target types.
- Wire converter outcomes (single, multi, skip, satisfy, error) into sync results and CLI reporting.
- Add hook execution points (pre/post sync and pre/post convert) with validated signatures.
- Extend tests for config validation, conversion behaviors, collisions, and error propagation.

## Constitution Check (Post-Design)

| Gate | Status | Notes |
|------|--------|-------|
| CLI-First Compiler Design | PASS | Design keeps outputs as compile-time artifacts. |
| Markdown-First, Human-Readable Output | PASS | Output formats remain human-readable. |
| Explicit Lossy Mapping Transparency | PASS | Design includes warnings for lossy mapping and collisions. |
| Test-Driven Validation | PASS | Contracts, unit tests, and integration tests planned. |
| Predictable Resolution Order | PASS | Documented precedence and merging rules. |
| Performance Standards | PASS | No additional runtime overhead beyond config evaluation. |
