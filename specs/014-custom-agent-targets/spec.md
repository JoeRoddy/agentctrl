# Feature Specification: Custom Agent Targets

**Feature Branch**: `014-custom-agent-targets`  
**Created**: 2026-01-21  
**Status**: Draft  
**Input**: User description: "Add support for user-defined custom agent targets via an omniagent.config.ts configuration file, migrate built-in targets to this API, and merge built-ins with custom targets at runtime."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register a simple custom target (Priority: P1)

As a repo maintainer, I can define a custom target in a config file with minimal
settings so my agents sync to a new tool without modifying omniagent core.

**Why this priority**: This is the core promise of the feature and enables the broadest
set of users to adopt new tools quickly.

**Independent Test**: Can be fully tested by adding a minimal target config, running a
sync, and verifying outputs are written in the expected locations.

**Acceptance Scenarios**:

1. **Given** a repo with a config that defines a custom target using short-form settings for
   skills, commands, subagents, and instructions, **When** the user runs sync for that
   target, **Then** outputs are generated in the expected directories and instruction
   files are written to each source-defined output directory.
2. **Given** instruction sources that specify different output directories, **When** sync
   runs for a target with an instruction filename configured, **Then** instruction files
   appear in each specified directory with the correct filename.

---

### User Story 2 - Override and manage built-in targets (Priority: P2)

As a maintainer, I can use the same configuration model for built-in targets and
optionally override or disable them to tailor outputs without losing defaults.

**Why this priority**: Ensures backward compatibility while enabling customization of
first-party targets.

**Independent Test**: Can be fully tested by overriding one built-in target and disabling
another, then validating outputs and target availability.

**Acceptance Scenarios**:

1. **Given** a config that overrides a built-in target's instruction filename, **When**
   sync runs, **Then** that target's instructions use the overridden filename while other
   outputs remain unchanged.
2. **Given** a config that disables a built-in target, **When** sync runs without explicitly
   selecting targets, **Then** no outputs are produced for the disabled target.

---

### User Story 3 - Advanced conversion and routing (Priority: P3)

As an advanced user, I can provide dynamic routing and conversion logic to transform
skills, commands, subagents, or instructions into custom formats or multi-file outputs.

**Why this priority**: Enables complex tools and enterprise workflows without forcing all
users into advanced configuration.

**Independent Test**: Can be fully tested by defining a converter that routes items based
on metadata and produces multiple files from one source.

**Acceptance Scenarios**:

1. **Given** a target with a converter that routes outputs based on source metadata,
   **When** sync runs, **Then** each item is written to the computed location with the
   expected content.
2. **Given** a converter that emits multiple outputs from a single source, **When** sync
   runs, **Then** all expected outputs are created and tracked as managed files.

---

### Edge Cases

- What happens when the config file is invalid or contains duplicate target IDs or aliases?
- What happens when a custom target ID collides with a built-in target but no override is
  specified?
- How does the system handle missing or unknown template variables in output definitions?
- How does the system handle converter errors or converters that intentionally skip items?
- How does the system behave when multiple targets share the same instruction group?
- What happens when an instruction source omits an output directory (defaults to repo root)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load configuration from an explicit CLI path when provided;
  otherwise it MUST search standard locations in precedence order and use the first match.
- **FR-002**: System MUST validate configuration and provide actionable errors for invalid
  schemas, duplicate IDs/aliases, or conflicting definitions, and MUST avoid writing
  outputs when validation fails.
- **FR-003**: System MUST allow users to define custom targets with a unique ID, optional
  display name, optional aliases, and optional inheritance from a built-in target.
- **FR-004**: System MUST combine built-in targets with custom targets at runtime, with
  built-ins enabled by default.
- **FR-005**: System MUST allow users to disable built-in targets by ID, removing them
  from the active target set.
- **FR-006**: System MUST allow users to override built-in targets, merging overrides with
  defaults so unspecified settings remain unchanged.
- **FR-007**: System MUST infer a target's supported features based on which output
  configurations are provided; omitted outputs MUST disable syncing for that feature.
- **FR-008**: System MUST support short-form output configuration for common cases and
  long-form configuration for advanced behavior across all feature types.
- **FR-009**: For skills, commands, and subagents, the system MUST treat the configured
  value as a full output path template; for instructions, it MUST treat the configured
  value as a filename combined with each source's output directory, supporting deep
  nesting.
- **FR-010**: System MUST resolve placeholders in output definitions for repository root,
  user home, agents source, target ID, item name, and command location.
- **FR-011**: System MUST allow output configuration values to be static or computed per
  item via dynamic rules (functions) that receive item and context information.
- **FR-012**: System MUST support command output formats and locations per target (project
  and user-level) and place outputs in the correct location.
- **FR-013**: System MUST support fallback behavior for commands and subagents when a
  target does not natively support them (convert to another supported output or skip), as
  configured.
- **FR-014**: System MUST allow conversion rules to return a single output, multiple
  outputs, a skip/handled decision, or a clear error that stops processing for that item.
- **FR-015**: System MUST support instruction grouping so multiple targets can share a
  single output file, with only one target writing and others marked as satisfied.
- **FR-016**: System MUST honor per-source instruction targeting and output directories so
  a single repo can emit instruction files to multiple locations.
- **FR-017**: System MUST track managed outputs per target and remove outputs only when
  removal is requested, the source is missing, and the output is unchanged since the last
  sync.
- **FR-018**: System MUST provide pre- and post-processing hooks for sync and conversion
  steps to enable custom behavior.
- **FR-019**: System MUST preserve backward compatibility so repos without a configuration
  continue to sync built-in targets with existing behavior.

### Key Entities *(include if feature involves data)*

- **Configuration File**: Captures target definitions, built-in overrides, disabled
  built-ins, and global hooks.
- **Target**: A named destination with outputs for skills, commands, subagents, and/or
  instructions plus optional aliases and inheritance.
- **Output Definition**: Rules that map a source item to a destination path/filename,
  format, location, grouping, fallback, and conversion behavior.
- **Source Item**: A parsed skill, command, subagent, or instruction with name, content,
  targets, and (for instructions) a designated output directory.
- **Managed Output Record**: Tracks files created by sync with their source and last
  known content fingerprint to support safe removal.

## Scope Boundaries

**In scope**:
- Config-based definition of custom targets and their outputs.
- Built-in targets expressed through the same model, including overrides and disabling.
- Per-item routing and conversion rules, including instruction grouping and deep nesting.
- Tracking and safe removal of managed outputs for custom targets.

**Out of scope**:
- Creating new agent source content (skills/commands/subagents/instructions) as part of
  this feature.
- Introducing a new UI for configuration beyond file-based configuration.
- Adding new external integrations beyond output file generation.

## Assumptions & Dependencies

- The existing sync command remains the primary entry point for running target syncs.
- Current agent source catalogs (skills, commands, subagents, instructions) remain
  available and are used as inputs to the new target system.
- Users have write access to configured output locations in their repo or home directory.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A maintainer can configure and successfully sync a simple custom target in
  15 minutes or less, using 10 lines of configuration or fewer.
- **SC-002**: For a representative sample repo, 100% of expected outputs are generated for
  built-in and custom targets, with 0 unexpected files created.
- **SC-003**: When removal of missing outputs is enabled, 100% of removed files are
  confirmed to be managed outputs whose sources no longer exist and were unchanged by the
  user.
- **SC-004**: At least 90% of advanced configuration scenarios (conditional routing,
  multi-file outputs, instruction grouping) succeed in acceptance testing without manual
  post-editing.
