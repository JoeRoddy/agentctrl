# Feature Specification: CLI Shim Surface

**Feature Branch**: `015-cli-shim-flags`  
**Created**: 2026-01-23  
**Status**: Draft  
**Input**: User description: "Define the initial CLI shim surface with shared flags for interactive and one-shot modes, including approval policy, sandboxing, output format, model selection, and web search enablement. - Support interactive REPL and one-shot prompts with shared flags. - Provide approval policy controls suitable for automation. - Provide output formats for scripting. - Allow model selection via `--model`. - Allow enabling web search via a flag. - Allow a pass through mechanism / proxy mechanism to pass arbitrary args through to the vendor cli - Subcommands beyond a simple one-shot flag (e.g., `exec`). - Vendor-specific advanced flags (session forks, MCP config, etc.). - Persisted config files (can be added later). - `omniagent` -> interactive REPL (default). - `-p, --prompt <text>` -> one-shot (non-interactive). - stdin piped -> one-shot (acts like `--prompt`). - `--approval <prompt|auto-edit|yolo>` (default: `prompt`) - `--auto-edit` (alias for `--approval auto-edit`) - `--yolo` (alias for `--approval yolo`) - If `--yolo` is set and `--sandbox` is not explicitly provided, sandbox defaults to `off`. - `--sandbox <workspace-write|off>` (default: `workspace-write`) - `--output <text|json|stream-json>` (default: `text`) - `--json` (alias for `--output json`) - `--stream-json` (alias for `--output stream-json`) - `-m, --model <name>` (selects model) - `--web <on|off|true|false|1|0>` (enable web search; default: `off`; bare `--web` equals `--web=on`) - `--help`, `--version` - Support delimiter-based passthrough for vendor CLI flags. - Syntax: `omniagent [shim flags] --vendor <claude|codex|gemini|copilot> -- [vendor flags...]` - Everything after `--` is passed verbatim to the vendor CLI. - Unknown flags before `--` should error (no silent passthrough). - Shim flags always parse before `--` and take precedence. Example: `omniagent -p … --vendor codex -- --some-vendor-flag --model gpt-5` - 0 success - 1 execution error (tool/model failure) - 2 invalid usage - 3 blocked by approval policy - `--prompt` and piped stdin must always run non-interactively. - Shared flags must be accepted in both modes (interactive + one-shot). - `--yolo` should not automatically disable the sandbox if `--sandbox` is explicitly set. - `--web` only enables access; the agent may still choose not to use it. - CLI parsing accepts the flags exactly as specified above. - One-shot and interactive modes both honor shared flags. - `--yolo` defaults sandbox to `off` unless user explicitly sets `--sandbox`. - `--model` and `--web` are plumbed through the runtime configuration. - Output format flags render correct output or structured JSON modes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start interactive REPL with shared flags (Priority: P1)

As a user, I want `omniagent` to start an interactive session by default so I can chat iteratively, while still using the same flags that are available in one-shot mode.

**Why this priority**: This is the default entry point and must work reliably for all users.

**Independent Test**: Can be fully tested by launching `omniagent` with shared flags and confirming the session starts in interactive mode with the expected configuration.

**Acceptance Scenarios**:

1. **Given** a terminal with no piped stdin and no `--prompt`, **When** the user runs `omniagent`, **Then** the system starts an interactive session and uses default flag values.
2. **Given** a terminal with no piped stdin, **When** the user runs `omniagent --model <name> --output json --approval prompt`, **Then** the session starts interactively and those shared flags are applied.

---

### User Story 2 - Run a one-shot prompt reliably (Priority: P2)

As a user or automation script, I want a non-interactive one-shot mode driven by `--prompt`, stdin, or `exec` so I can run a single request without entering the REPL.

**Why this priority**: One-shot execution enables scripting and automation workflows.

**Independent Test**: Can be fully tested by running one-shot invocations with `--prompt`, piped stdin, and `exec`, and verifying outputs and exit codes.

**Acceptance Scenarios**:

1. **Given** a `--prompt` value, **When** the user runs `omniagent -p "..."`, **Then** the system runs one-shot mode and exits without entering interactive mode.
2. **Given** stdin is piped and `--prompt` is not provided, **When** the user runs `omniagent`, **Then** the system treats piped stdin as the prompt and runs one-shot mode.
3. **Given** the user runs `omniagent exec` with a prompt provided via `--prompt` or stdin, **When** the command executes, **Then** it runs non-interactively and exits after the response.

---

### User Story 3 - Pass vendor-specific flags through safely (Priority: P3)

As a user integrating with a vendor CLI, I want to pass vendor-specific flags through the shim without the shim silently accepting unknown flags, so I can use advanced vendor options while keeping the shim reliable.

**Why this priority**: Vendor passthrough is required to access advanced vendor features without expanding the shim surface.

**Independent Test**: Can be fully tested by invoking the shim with `--vendor ... -- [vendor flags]` and verifying that only post-`--` flags are passed through.

**Acceptance Scenarios**:

1. **Given** a vendor selection and a passthrough delimiter, **When** the user runs `omniagent --vendor codex -- --some-vendor-flag`, **Then** the shim accepts the invocation and passes the vendor flags through verbatim.
2. **Given** an unknown flag before the passthrough delimiter, **When** the user runs `omniagent --unknown-flag --vendor codex -- --some-vendor-flag`, **Then** the system rejects the invocation with an invalid-usage exit code.

---

### Edge Cases

- `--yolo` is set while `--sandbox` is explicitly provided: sandbox remains the explicitly provided value.
- `--web` is provided with an unsupported value: invocation fails with invalid-usage exit code.
- `--` is used without `--vendor`: invocation fails with invalid-usage exit code.
- Both `--prompt` and piped stdin are present: the explicit `--prompt` is used.
- Conflicting output flags (e.g., `--output text` and `--json`) are both provided: the last-specified output flag wins.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The default invocation `omniagent` MUST start an interactive REPL when stdin is a TTY and no one-shot trigger is present.
- **FR-002**: The system MUST run non-interactively when `--prompt` is provided, when stdin is piped, or when the `exec` subcommand is used.
- **FR-003**: Shared flags MUST be accepted in both interactive and one-shot modes and apply consistently to the session configuration.
- **FR-004**: The `--approval` flag MUST accept `prompt`, `auto-edit`, and `yolo`, and default to `prompt`.
- **FR-005**: `--auto-edit` MUST behave as `--approval auto-edit`, and `--yolo` MUST behave as `--approval yolo`.
- **FR-006**: If `--yolo` is set and `--sandbox` is not explicitly provided, sandbox MUST default to `off`.
- **FR-007**: If `--sandbox` is explicitly provided, `--yolo` MUST NOT override it.
- **FR-008**: The `--sandbox` flag MUST accept `workspace-write` and `off`, and default to `workspace-write` unless overridden by FR-006.
- **FR-009**: The `--output` flag MUST accept `text`, `json`, and `stream-json`, and default to `text`.
- **FR-010**: `--json` MUST behave as `--output json`, and `--stream-json` MUST behave as `--output stream-json`.
- **FR-011**: The `--model` flag MUST select the model for the session configuration.
- **FR-012**: The `--web` flag MUST accept `on`, `off`, `true`, `false`, `1`, and `0`, default to `off`, and treat bare `--web` as `on`.
- **FR-013**: Enabling `--web` MUST only grant permission for web search; the agent MAY still choose not to use it.
- **FR-014**: `--help` and `--version` MUST display their information and exit successfully without starting a session.
- **FR-015**: The shim MUST support delimiter-based passthrough using `--vendor <claude|codex|gemini|copilot> -- [vendor flags...]`.
- **FR-016**: All arguments after `--` MUST be passed to the vendor CLI verbatim and MAY include advanced vendor flags.
- **FR-017**: Unknown flags before `--` MUST cause invalid usage; no silent passthrough is allowed.
- **FR-018**: Shim flags MUST be parsed before the passthrough delimiter and MUST take precedence in effective behavior if they overlap with vendor flags.
- **FR-019**: Using `--` without `--vendor` MUST be treated as invalid usage.
- **FR-020**: Output formats MUST render as follows: `text` is human-readable, `json` is a single structured JSON result, and `stream-json` is a stream of structured JSON records suitable for scripting.
- **FR-021**: Exit codes MUST be: `0` success, `1` execution error, `2` invalid usage, `3` blocked by approval policy.

### Key Entities *(include if feature involves data)*

- **Invocation**: A single CLI run including mode (interactive/one-shot), shared flags, and input source.
- **Session Configuration**: The resolved set of shared settings (approval, sandbox, output, model, web permission) applied to a run.
- **Vendor Passthrough**: The vendor selection plus any arguments supplied after `--` that are forwarded verbatim.
- **Output Envelope**: The user-visible output shape selected by `--output` (text, json, stream-json).

## Assumptions

- If multiple output-related flags are provided, the last occurrence determines the effective output format.
- `exec` is a supported subcommand that only changes mode (forces one-shot) and does not add new flags.
- If `--vendor` is omitted, the system uses its existing default vendor selection when available; this spec does not define how defaults are chosen.
- Persisted configuration files are out of scope for this feature and may be introduced later.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can start an interactive session with the default command in under 2 seconds on a standard workstation.
- **SC-002**: 100% of valid flag combinations in automated tests produce the expected mode (interactive vs one-shot), output format, and exit code.
- **SC-003**: 100% of invalid-usage scenarios (unknown flags, invalid values, missing `--vendor` with `--`) return exit code `2` with a clear error message.
- **SC-004**: Automation workflows using `--approval auto-edit` or `--approval yolo` run without manual approval prompts in 100% of tests.
