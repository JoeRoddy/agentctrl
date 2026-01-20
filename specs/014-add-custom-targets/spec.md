# Feature Specification: Custom Agent Target Configuration

**Feature Branch**: `014-add-custom-targets`  
**Created**: January 20, 2026  
**Status**: Draft  
**Input**: User description: "Support user-defined custom agent targets via an omniagent.config.ts configuration file so teams can sync agent definitions to any tool, keeping simple configs minimal while enabling advanced conversions, callbacks, and derived capabilities."

## Clarifications

### Session 2026-01-20

- Q: When two items resolve to the same output path, what should the sync do? → A: For any `AGENTS.md` output path, treat duplicates as expected and emit a single canonical `AGENTS.md` output (the default instruction output wins). Users should not configure `AGENTS.md` explicitly, and can disable instruction output only if the target does not support it; all other path collisions are conflicts.
- Q: When a user overrides a built-in target by id, should unspecified fields inherit from the built-in, or should the override fully replace it? → A: Unspecified fields inherit from the built-in (merge/inherit behavior).
- Q: If a converter returns an error for one item, should the sync stop or continue? → A: Fail only the affected target and continue syncing other targets.
- Q: If a target config omits `instructions` entirely, what should happen? → A: If omitted, default to `AGENTS.md` per instruction output directory; if explicitly `false`, skip instructions for that target only, while other targets that support instructions still emit them.
- Q: When multiple targets default to `AGENTS.md`, should there be one canonical file or one per target? → A: Emit a single canonical `AGENTS.md` per output directory; if agent-template outputs from multiple targets resolve to the same file, warn and skip those template outputs.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add a simple custom target (Priority: P1)

As a repo owner, I want to define a new target with a minimal configuration so I can sync existing skills, commands, subagents, and instructions to a new tool without changing core code.

**Why this priority**: This unlocks the primary user value—integrating omniagent with new tools quickly.

**Independent Test**: Can be fully tested by adding a minimal config and running a sync to confirm outputs are created in the expected locations.

**Acceptance Scenarios**:

1. **Given** a repo with existing agent items and a config that defines a target with basic outputs, **When** a sync is run for that target, **Then** output files are created for each configured item type at the expected paths with the expected content.
2. **Given** a repo without a config file, **When** a sync is run, **Then** built-in targets behave exactly as they did before this feature.

---

### User Story 2 - Customize conversion and routing (Priority: P2)

As a power user, I want to customize how items are converted and routed so I can produce tool-specific formats, conditional outputs, and multi-file results.

**Why this priority**: Advanced conversions are essential for tools that require bespoke formats or routing logic.

**Independent Test**: Can be fully tested by defining converters that output multiple files, skip items, or emit errors and verifying outcomes.

**Acceptance Scenarios**:

1. **Given** a target with a converter that produces multiple outputs for a single item, **When** a sync is run, **Then** all specified outputs are created with the correct paths and content.
2. **Given** a target with a converter that marks an item as skipped or returns an error, **When** a sync is run, **Then** skipped items create no outputs and errors are reported clearly without silently writing partial results.

---

### User Story 3 - Place instructions in multiple directories (Priority: P3)

As a repo owner, I want instruction files generated in each source output directory so that different parts of the repo receive the correct instructions.

**Why this priority**: Instructions are most useful when they live next to the relevant source paths, especially in large repos.

**Independent Test**: Can be fully tested by configuring instruction outputs and verifying files appear in multiple nested directories.

**Acceptance Scenarios**:

1. **Given** instruction sources with different output directories and a target that specifies an instruction file name, **When** a sync is run, **Then** an instruction file is generated in each output directory with that file name.
2. **Given** a target that filters instruction outputs by group, **When** a sync is run, **Then** only instruction items in the matching group are output.

---

### Edge Cases

- Two items resolve to the same output path.
- Multiple items target an `AGENTS.md` output path and are consolidated into one canonical output.
- Multiple targets emit template outputs to the same `AGENTS.md`, triggering a warning and skip of those template outputs.
- A configured path or file name resolves to an empty or invalid location.
- A converter returns a "handled without writing" outcome and no file should be produced.
- An output directory is missing or not writable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect and load an optional `omniagent.config.ts` file at the repository root.
- **FR-002**: If the config file is absent, system MUST preserve existing built-in target behavior with no changes.
- **FR-003**: Users MUST be able to define custom targets with an id and optional display name and aliases.
- **FR-004**: Users MUST be able to specify outputs for skills, commands, subagents, and instructions; the system MUST only sync categories that are configured, except for the default instruction output behavior described below.
- **FR-005**: Output configuration MUST support a short form for common cases and an expanded object form for advanced settings.
- **FR-006**: Every configurable property MUST accept either a static value or a callback that receives full item and conversion context.
- **FR-007**: Converters MUST support returning a single output, multiple outputs, a skip signal, a handled-without-writing signal, or an error; the system MUST honor each outcome.
- **FR-008**: Instruction outputs MUST use the item-specific output directory and a configurable file name, supporting multiple instruction locations within a repo.
- **FR-009**: Command outputs MUST support project scope and optional global scope with a configurable global path, and MUST honor a configured fallback behavior when commands are unsupported.
- **FR-010**: Users MUST be able to extend or override built-in targets by id; overrides MUST inherit unspecified fields from the built-in target, and users MUST be able to disable selected built-ins via configuration.
- **FR-011**: The system MUST provide pre- and post-sync hooks and pre/post-convert hooks for custom processing.
- **FR-012**: Configuration MUST be validated and errors MUST be reported with actionable details (target id, item type, and setting).
- **FR-013**: The system MUST not silently overwrite outputs when two items resolve to the same path and MUST surface a conflict, except for `AGENTS.md` outputs.
- **FR-014**: When multiple items target an `AGENTS.md` output path, the system MUST allow it and produce a single canonical `AGENTS.md` output.
- **FR-015**: Instruction outputs MUST default to `AGENTS.md` (using each instruction item’s output directory) when no instruction output is configured for a target, and users MUST be able to explicitly disable instruction output for targets that do not support it.
- **FR-016**: If a converter returns an error for an item, the system MUST fail that target’s sync while allowing other targets to continue, and MUST report the error clearly.
- **FR-017**: If a target explicitly sets instructions to `false`, the system MUST skip instruction outputs for that target only and MUST NOT suppress instruction outputs for other targets.
- **FR-018**: When multiple targets or template outputs resolve to the same `AGENTS.md`, the system MUST emit a single canonical `AGENTS.md` per output directory, warn, and skip the colliding template outputs.

### Key Entities *(include if feature involves data)*

- **Target Definition**: A user-defined configuration that describes a target’s identity, optional inheritance, and output rules.
- **Output Configuration**: Per-item-type settings for where and how outputs are generated, including optional conversion behavior.
- **Item**: A source artifact (skill, command, subagent, instruction) with content, metadata, and an output directory (for instructions).
- **Conversion Result**: The explicit outcome of a conversion (content, paths, skip, handled-without-writing, or error).
- **Sync Run**: A single execution that applies target configurations to items and records results.

## Scope & Non-Goals

**In scope**:
- Defining custom targets and output rules through a repo-level configuration file.
- Converting and routing skills, commands, subagents, and instructions to tool-specific outputs.
- Optional hooks to adjust behavior before or after sync/conversion.

**Out of scope**:
- Creating or editing the underlying agent content itself.
- Building a graphical interface for target configuration.
- Shipping new built-in target formats as part of this feature.

## Dependencies

- Existing agent sources (skills, commands, subagents, instructions) are already available in the repo.
- The sync process has write access to the configured output locations.

## Assumptions

- The configuration file is stored at the repository root and is optional.
- Instruction sources already define their output directories, which the system can use to place files.
- If a callback depends on missing context, it fails validation and produces a clear error.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a usability test, at least 90% of users can add a simple custom target and successfully generate outputs without modifying core code within 10 minutes.
- **SC-002**: In a repo with at least 200 items across all item types, a sync run with custom targets completes with 0 missing outputs and 0 silent overwrites.
- **SC-003**: When configuration errors are introduced, at least 80% of users can identify and fix the issue within 15 minutes using the provided error details.
- **SC-004**: Mixed usage works reliably: disabling a built-in target reduces only that target’s outputs while custom targets continue to sync in 100% of acceptance tests.
