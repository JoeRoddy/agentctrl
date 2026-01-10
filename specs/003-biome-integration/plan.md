# Implementation Plan: Biome Integration for Code Quality

**Branch**: `003-biome-integration` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-biome-integration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Install and configure Biome as the project's formatting and linting tool, integrating it into the build script to ensure automated code quality checks. This feature provides developers with immediate feedback on code quality issues during builds while enabling manual formatting and validation commands for development workflows.

## Technical Context

**Language/Version**: TypeScript 5.x, ES2022 target
**Primary Dependencies**: yargs (CLI parsing), Vitest (testing), Vite (build), Biome (new - formatting/linting)
**Storage**: N/A (tooling integration)
**Testing**: Vitest with coverage support
**Target Platform**: Node.js 18+ (CLI tool)
**Project Type**: Single project (CLI tool)
**Performance Goals**: Code quality checks complete in under 5 seconds for typical changes
**Constraints**: Build integration must not significantly increase build time; tool must work offline
**Scale/Scope**: ~100-1000 TypeScript files in src/ and tests/ directories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. CLI-First Compiler Design ✅
**Status**: PASS - Not applicable to this feature
**Rationale**: Biome integration is a development tooling feature, not a runtime or agent framework component. It supports the development of the CLI compiler but doesn't affect its core design principles.

### II. Markdown-First, Human-Readable Output ✅
**Status**: PASS
**Rationale**: Biome configuration (biome.json) is human-readable JSON. CLI output from Biome commands is actionable and clear with error messages showing file/line numbers and specific issues.

### III. Explicit Lossy Mapping Transparency ✅
**Status**: PASS - Not applicable to this feature
**Rationale**: This feature doesn't involve configuration mapping or compilation between formats.

### IV. Test-Driven Validation ✅
**Status**: PASS
**Rationale**: Feature includes integration tests to verify Biome executes correctly during builds and produces expected output. Existing Vitest infrastructure supports this.

### V. Predictable Resolution Order ✅
**Status**: PASS - Not applicable to this feature
**Rationale**: Biome configuration follows standard tooling patterns (project-level biome.json takes precedence). No custom resolution logic needed.

### Performance Standards ✅
**Status**: PASS
**Rationale**:
- Biome is known for being fast (written in Rust)
- Target of <5s for code quality checks aligns with constitution's <500ms validate and <2s compile requirements
- Build integration will be tested to ensure it doesn't exceed performance budgets

### Development Workflow ✅
**Status**: PASS
**Rationale**: This feature establishes the linting/formatting infrastructure required by the constitution's Code Quality Gates. Once implemented, all future code must pass Biome checks.

---

## Re-evaluation After Phase 1 Design

**Date**: 2026-01-10
**Status**: ALL CHECKS STILL PASS ✅

**Design Review**:
- Phase 0 research confirmed Biome as appropriate choice (performance, TypeScript support)
- Phase 1 contracts define clear interfaces (npm scripts, configuration schema)
- Data model documents configuration structure and command execution flow
- Quickstart guide provides developer-friendly documentation

**No New Risks Identified**:
- Configuration is human-readable JSON (aligns with Principle II)
- Tests will verify Biome integration works correctly (aligns with Principle IV)
- Performance remains within budget (<5s, aligns with Performance Standards)
- Build integration enforces quality gates (aligns with Development Workflow requirements)

**Constitution compliance confirmed** - Ready for Phase 2 (task generation via `/speckit.tasks`)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── cli/
└── index.ts

tests/
└── (integration tests for Biome)

biome.json              # Biome configuration (new)
package.json            # Updated with Biome scripts
```

**Structure Decision**: Single project structure. Biome integration requires:
1. A `biome.json` configuration file at the repository root
2. Updated npm scripts in `package.json` for format, lint, and check commands
3. Integration into the existing `build` script
4. New integration tests to verify Biome execution

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitution violations. This feature aligns with development workflow requirements.
