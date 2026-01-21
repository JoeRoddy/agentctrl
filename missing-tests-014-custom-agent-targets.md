# Requirements Test Matrix (2026-01-21): 014-custom-agent-targets

Legend:
- OK = covered by automated tests
- PARTIAL = indirect or incomplete coverage
- MISSING = no automated test found
- DOC = documentation/process requirement (not test-based)

## 014-custom-agent-targets
- FR-001 Auto-discover config in agents dir only: OK
- FR-002 Validate config with actionable errors: OK
- FR-003 Define custom targets (id/aliases/optional inheritance): OK
- FR-004 Merge built-ins with custom targets: OK
- FR-005 Disable built-ins: OK
- FR-006 Override built-ins with merge: OK
- FR-006a Collisions require explicit override/inherit: OK
- FR-007 Infer supported features from outputs: OK
- FR-008 Short-form + long-form outputs: OK
- FR-009 Output path templates for skills/commands/subagents: OK
- FR-010 Resolve placeholders: OK
- FR-010a Unknown placeholders fail fast: OK
- FR-011 Dynamic output rules (functions): OK
- FR-012 Command outputs per target (project + user): OK
- FR-013 Fallback behavior for unsupported features: OK
- FR-014 Conversion rules support multiple outputs/skip/error: OK
- FR-014a Converter errors continue + non-zero exit: OK
- FR-015 Instruction grouping shared outputs: OK
- FR-015a Collision handling + default writers: OK
- FR-015b Default writers exported, target-agnostic: OK
- FR-015c Command collisions are errors: OK
- FR-016 Instruction targeting + output dirs: OK
- FR-016a Default output dir rules: OK
- FR-016b Template rendering + frontmatter for agentsDir sources: OK
- FR-017 Managed outputs tracked + safe removal: OK
- FR-018 Pre/post hooks: OK
- FR-019 Backward compatibility without config: OK
