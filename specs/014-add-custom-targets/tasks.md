---

description: "Task list for Custom Agent Target Configuration"
---

# Tasks: Custom Agent Target Configuration

**Input**: Design documents from `/Users/joeroddy/Documents/dev/projects/open-source/omniagent/specs/014-add-custom-targets/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Tests**: No explicit test tasks requested in the spec; none included.
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- All file paths below are absolute per instructions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish custom-target configuration scaffolding

- [X] T001 [P] Create custom target config types in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/types.ts
- [X] T002 [P] Implement defineConfig helper in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/define-config.ts
- [X] T003 [P] Add custom-targets export barrel in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/index.ts
- [X] T004 Export defineConfig and config types from /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core configuration loading, validation, and target resolution that must be complete before any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Implement config discovery and loader in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/load-config.ts
- [X] T006 Implement config validation and error reporting in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/validate-config.ts
- [X] T007 Implement target registry merge logic in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/resolve-targets.ts
- [X] T008 [P] Implement conversion context helpers and template resolver in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/context.ts
- [X] T009 [P] Implement output writer and collision tracker in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/output-writer.ts
- [X] T010 Update dynamic target validation in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/sync-targets.ts, /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/skills/catalog.ts, /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/slash-commands/manifest.ts, /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/subagents/catalog.ts, and /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/instructions/frontmatter.ts
- [X] T011 Update supported target lists and templating validation in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/supported-targets.ts and /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/cli/commands/sync.ts
- [X] T012 Update sync result typing for custom target ids in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/sync-results.ts and /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/instructions/summary.ts
- [X] T013 Load/validate config and build resolved target list in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/cli/commands/sync.ts

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 - Add a simple custom target (Priority: P1) 🎯 MVP

**Goal**: Allow a minimal `omniagent.config.ts` to define a custom target that syncs skills, commands, subagents, and instructions while preserving built-in behavior when config is absent.

**Independent Test**: Add the minimal config from quickstart and run `omniagent sync --targets <id>`; confirm outputs land in the configured paths and built-ins behave unchanged when config is removed.

### Implementation for User Story 1

- [X] T014 [P] [US1] Implement output config resolver (short form vs object) in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/resolve-output.ts
- [X] T015 [P] [US1] Implement basic skill output generation for custom targets in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/skills.ts
- [X] T016 [P] [US1] Implement basic command output generation for custom targets in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/commands.ts
- [X] T017 [P] [US1] Implement basic subagent output generation for custom targets in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/subagents.ts
- [X] T018 [P] [US1] Implement default instruction output (AGENTS.md) and instructions:false handling in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/instructions.ts
- [X] T019 [US1] Implement custom target sync orchestrator in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/sync.ts
- [X] T020 [US1] Wire custom target sync into CLI flow in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/cli/commands/sync.ts

**Checkpoint**: User Story 1 can be run independently with a minimal config

---

## Phase 4: User Story 2 - Customize conversion and routing (Priority: P2)

**Goal**: Support advanced conversions and routing with multi-file outputs, skips, and per-target errors.

**Independent Test**: Configure converters that return multiple outputs, skip an item, and return an error; run sync and verify outputs plus per-target error reporting without stopping other targets.

### Implementation for User Story 2

- [X] T021 [P] [US2] Implement converter execution and result normalization in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/convert.ts
- [X] T022 [P] [US2] Implement hook runner utilities in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/hooks.ts
- [X] T023 [US2] Update custom writers to honor converters and callback-based settings in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/skills.ts, /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/commands.ts, /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/subagents.ts, and /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/instructions.ts
- [X] T024 [US2] Implement command scope/global path and fallback behavior in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/commands.ts
- [X] T025 [US2] Wire hooks + converter pipeline into sync and error summaries in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/sync.ts and /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/cli/commands/sync.ts

**Checkpoint**: User Story 2 behaviors work without breaking User Story 1

---

## Phase 5: User Story 3 - Place instructions in multiple directories (Priority: P3)

**Goal**: Generate instruction files in each output directory and allow group-based filtering.

**Independent Test**: Configure instruction fileName and group filter; run sync and verify instruction files appear in multiple directories and only matching groups are emitted.

### Implementation for User Story 3

- [X] T026 [P] [US3] Extend instruction frontmatter parsing to capture group in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/instructions/frontmatter.ts and /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/instructions/types.ts
- [X] T027 [US3] Implement instruction group filtering and per-output-dir fileName resolution in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/instructions.ts
- [X] T028 [P] [US3] Ensure canonical AGENTS.md consolidation with warnings in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/output-writer.ts

**Checkpoint**: User Story 3 works independently with multi-directory instruction output

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and cleanup across stories

- [X] T029 [P] Update documentation and examples in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/README.md
- [X] T030 [P] Add converter and hook usage notes in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/types.ts
- [X] T031 Validate quickstart steps and adjust examples in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/specs/014-add-custom-targets/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → **Foundational (Phase 2)** → **User Stories (Phase 3–5)** → **Polish (Phase 6)**

### User Story Dependency Graph

US1 (P1) ──► US2 (P2)
   └──────► US3 (P3)

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational only
- **User Story 2 (P2)**: Depends on User Story 1
- **User Story 3 (P3)**: Depends on User Story 1

### Within Each User Story

- Resolve configuration and validation dependencies first
- Implement writers before orchestration
- Wire orchestration into CLI after writers are stable
- Ensure each story can be run and verified independently

---

## Parallel Examples

### Parallel Example: User Story 1

```bash
Task: "Implement output config resolver in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/resolve-output.ts"
Task: "Implement basic skill output generation in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/skills.ts"
Task: "Implement basic command output generation in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/commands.ts"
Task: "Implement basic subagent output generation in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/subagents.ts"
Task: "Implement default instruction output handling in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/instructions.ts"
```

### Parallel Example: User Story 2

```bash
Task: "Implement converter execution and result normalization in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/convert.ts"
Task: "Implement hook runner utilities in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/hooks.ts"
```

### Parallel Example: User Story 3

```bash
Task: "Extend instruction frontmatter parsing to capture group in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/instructions/frontmatter.ts"
Task: "Ensure canonical AGENTS.md consolidation with warnings in /Users/joeroddy/Documents/dev/projects/open-source/omniagent/src/lib/custom-targets/output-writer.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run the US1 independent test

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 → validate → demo
3. User Story 2 → validate → demo
4. User Story 3 → validate → demo
5. Polish tasks last

### Parallel Team Strategy

- Team completes Setup + Foundational together
- Once Foundational is done:
  - Developer A: US1 tasks
  - Developer B: US2 tasks (after US1 baseline)
  - Developer C: US3 tasks (after US1 baseline)
