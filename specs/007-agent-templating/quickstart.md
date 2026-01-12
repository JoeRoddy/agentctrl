# Quickstart: Agent-Specific Templating

## Use a scoped block

Use a single-brace inline block with a selector list followed by content:

```text
Regular text
{claude,codex This text is only for Claude and Codex }
More text
```

## Exclude specific agents

Use the `not:` prefix to exclude agents:

```text
{not:claude,gemini This text is for all agents except Claude and Gemini }
```

## Multi-line blocks

Blocks can span multiple lines until the closing `}`:

```text
{claude,codex
Line 1
Line 2
}
```

## Escaping closing braces

Use `\}` for literal closing braces inside content:

```text
{codex This is a literal brace: \} }
```

## Error behavior

If any selector is invalid (unknown agent, empty list, nested block, or conflicting
include/exclude), the entire sync run fails, no outputs are changed, and the error
lists valid agent identifiers.
