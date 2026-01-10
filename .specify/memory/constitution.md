<!--
SYNC IMPACT REPORT
==================
Version change: N/A (initial) → 1.0.0
Modified principles: N/A (initial creation)
Added sections:
  - Core Principles (5 principles)
  - Performance Standards
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md: ✅ compatible (Requirements section aligns)
  - .specify/templates/tasks-template.md: ✅ compatible (phase structure aligns)
Follow-up TODOs: None
-->

# agentctl Constitution

## Core Principles

### I. CLI-First Compiler Design

agentctl is a **compiler/adapter**, not a runtime or agent framework. Every feature
MUST adhere to this boundary:

- MUST validate canonical agent configuration
- MUST resolve global vs project-level overrides deterministically
- MUST generate target-specific outputs without runtime dependencies
- MUST handle lossy mappings explicitly and visibly to users
- MUST NOT run agents, orchestrate workflows, or host models

**Rationale**: Clear separation of concerns prevents scope creep and ensures the tool
remains focused on its core value proposition: unified configuration compilation.

### II. Markdown-First, Human-Readable Output

All canonical configuration MUST be markdown-first:

- Configuration files MUST be human-readable and diffable
- Structured data (frontmatter) MUST use YAML or TOML, never proprietary formats
- CLI output MUST support both JSON and human-readable formats
- Error messages MUST be actionable with clear remediation steps
- Generated target files MUST include provenance comments indicating source

**Rationale**: Developer tools succeed when they integrate seamlessly with existing
workflows. Git diffability and human readability reduce friction and build trust.

### III. Explicit Lossy Mapping Transparency

Not all agent features map cleanly across targets. agentctl MUST surface this:

- MUST warn when source features have no target equivalent
- MUST document which features are fully supported, partially supported, or unsupported per target
- MUST NOT silently drop configuration during compilation
- SHOULD provide suggestions for target-specific alternatives when features cannot map

**Rationale**: Users deserve to know what they're getting. Hidden incompatibilities
erode trust and cause debugging nightmares in production.

### IV. Test-Driven Validation

All compilation and validation logic MUST be thoroughly tested:

- Schema validation MUST have comprehensive test coverage
- Each target compiler MUST have contract tests verifying output format
- Integration tests MUST verify round-trip consistency where applicable
- Edge cases (empty configs, malformed input, missing fields) MUST be tested
- New targets MUST include a test suite before merge

**Rationale**: As a configuration compiler, correctness is paramount. Users trust
agentctl to produce valid output; broken compilation breaks their entire workflow.

### V. Predictable Resolution Order

Configuration resolution MUST follow a deterministic, documented order:

1. Project-level overrides (repo `.agents/` directory)
2. Global user configuration (`~/.config/agentctl/` or equivalent)
3. Canonical defaults (built into agentctl)

This order MUST be:
- Documented in user-facing help and documentation
- Consistent across all commands and targets
- Debuggable via a `--verbose` or `--debug` flag showing resolution steps

**Rationale**: Mirroring established patterns (Git, Terraform, ESLint) reduces
learning curve and makes behavior predictable for power users.

## Performance Standards

agentctl MUST maintain responsive CLI performance:

- `agentctl validate` MUST complete in under 500ms for typical project configs
- `agentctl compile` MUST complete in under 2 seconds for all targets combined
- Memory usage MUST stay under 100MB for standard operations
- File I/O MUST be minimized; prefer streaming over loading entire directories
- Cold start (first run) MAY be slower but MUST NOT exceed 5 seconds

**Measurement**: Performance benchmarks SHOULD be included in CI and regression
tested against these thresholds.

**Rationale**: CLI tools that feel slow get abandoned. Fast feedback loops
encourage iterative configuration refinement.

## Development Workflow

### Code Quality Gates

All contributions MUST pass:

- Linting (language-appropriate tooling configured in project)
- Type checking where applicable
- Unit test suite with >80% coverage on core compilation logic
- Integration tests for each supported target
- Documentation updates for user-facing changes

### Commit Standards

- Commits MUST follow conventional commit format
- Breaking changes MUST be clearly marked and documented
- Each PR MUST include test coverage for new functionality

### Target Addition Process

Adding a new compilation target requires:

1. Research document outlining target's configuration format
2. Mapping document showing canonical → target field translations
3. Explicit list of unsupported/lossy features
4. Complete test suite for the new target
5. Documentation updates (README, help text)

## Governance

This constitution is the authoritative source for agentctl development practices.
All PRs and code reviews MUST verify compliance with these principles.

### Amendment Process

1. Propose changes via PR to this file
2. Changes require review and approval
3. MAJOR changes (principle removal/redefinition) require explicit justification
4. Version number MUST be updated per semantic versioning:
   - MAJOR: Backward-incompatible governance changes
   - MINOR: New principles or materially expanded guidance
   - PATCH: Clarifications, wording fixes

### Compliance

- Use `.specify/memory/constitution.md` as reference during development
- Constitution Check section in plan templates MUST verify alignment
- Complexity beyond these principles MUST be justified in Complexity Tracking

**Version**: 1.0.0 | **Ratified**: 2026-01-10 | **Last Amended**: 2026-01-10
