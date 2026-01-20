# Research: Custom Agent Target Configuration

## Decision 1: Load `omniagent.config.ts` via runtime TypeScript import
**Decision**: Treat `omniagent.config.ts` as an optional repo-root module with a default export and load it at sync time using the existing Node/TypeScript toolchain in this repo.
**Rationale**: Keeps configuration in a single, human-readable file with TypeScript inference and aligns with existing tooling (tsgo) without introducing a new runtime or service.
**Alternatives considered**:
- JSON-only config (simpler loader, weaker type-safety)
- Precompiled config (adds build step friction)

## Decision 2: Deterministic target resolution order
**Decision**: Resolve targets in a deterministic order: built-ins first, then apply overrides by id (inherit unspecified fields), then append custom targets in config order, finally remove any disabled targets by id.
**Rationale**: Predictable behavior improves user trust and aligns with the constitution’s resolution-order principle.
**Alternatives considered**:
- Full replacement of built-ins (breaks compatibility)
- Last-write-wins with no inheritance (less predictable)

## Decision 3: Output collision handling with canonical `AGENTS.md`
**Decision**: Treat `AGENTS.md` collisions as expected, emitting one canonical file per output directory and warning on template collisions; treat all other path collisions as errors.
**Rationale**: Matches clarified behavior (default instructions) while preventing accidental overwrites.
**Alternatives considered**:
- Last-write-wins for all collisions (silent data loss)
- Fail fast on any collision including `AGENTS.md` (breaks intended default)

## Decision 4: Error propagation
**Decision**: A converter error fails only the affected target; other targets continue to sync with clear error reporting.
**Rationale**: Keeps multi-target sync productive and aligns with user expectations.
**Alternatives considered**:
- Abort entire sync on any error (too disruptive for multi-target flows)

## Decision 5: Contracts are documentation-only
**Decision**: Treat generated OpenAPI contracts as internal documentation for CLI boundaries, not a network service.
**Rationale**: Preserves CLI-first compiler boundaries while still providing a testable contract format.
**Alternatives considered**:
- Implement a live HTTP API (violates CLI-first scope)
