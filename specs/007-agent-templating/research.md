# Research: Agent-Specific Templating

## Decisions

- **Decision**: Use single-brace inline block syntax `{selector-list content }` with include/exclude selectors.
  - **Rationale**: Matches the user-provided examples, keeps markup minimal, and supports placement anywhere in files.
  - **Alternatives considered**: Explicit start/end tags, double-bracket tags, line-based tags.

- **Decision**: Use `not:` prefix for exclusions inside the selector list (e.g., `{not:claude,gemini ... }`).
  - **Rationale**: Clear and readable exclusion marker that aligns with the example.
  - **Alternatives considered**: `!` prefix, `exclude:` keyword.

- **Decision**: Block ends at the first unescaped `}`; `\}` is treated as literal text.
  - **Rationale**: Avoids nested block ambiguity while allowing literal braces in content.
  - **Alternatives considered**: single-line blocks only, explicit end tokens.

- **Decision**: Block content may span multiple lines until the closing `}`.
  - **Rationale**: Supports realistic config blocks without forcing inline-only content.
  - **Alternatives considered**: single-line-only blocks.

- **Decision**: Invalid selectors (unknown agents, empty lists, nested blocks, include+exclude conflicts) fail the entire sync run and list valid identifiers.
  - **Rationale**: Fail-fast behavior prevents silent corruption and provides clear remediation.
  - **Alternatives considered**: warnings or partial-file failure.

- **Decision**: Agent identifier matching is case-insensitive and limited to configured agents.
  - **Rationale**: Reduces user error while keeping selector scope explicit.
  - **Alternatives considered**: case-sensitive matching or unrestricted identifiers.
