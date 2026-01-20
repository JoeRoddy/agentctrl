# Data Model: Custom Agent Target Configuration

## Entities

### TargetDefinition
**Purpose**: Defines a compilation target and how outputs are produced.
**Fields**:
- `id` (string, required, unique)
- `displayName` (string, optional)
- `aliases` (string[], optional)
- `extends` (string, optional; references a built-in target id)
- `outputs` (object, optional)
  - `skills` (SkillOutputConfig)
  - `commands` (CommandOutputConfig)
  - `subagents` (SubagentOutputConfig)
  - `instructions` (InstructionOutputConfig | false)
- `hooks` (object, optional)
  - `beforeSync`, `afterSync`, `beforeConvert`, `afterConvert`

**Validation rules**:
- `id` must be unique across built-ins and custom targets after overrides.
- If `extends` is set, it must reference a known built-in target.
- If `instructions` is omitted, default output behavior applies; if explicitly `false`, instructions are disabled for that target.

### OutputConfig (Skill/Command/Subagent)
**Purpose**: Defines how a specific item type is written.
**Fields**:
- `path` (string template or callback)
- `convert` (converter function, optional)
- `format` (commands only; `markdown` | `toml` or callback)
- `scopes` (commands only; `project` | `global`)
- `globalPath` (commands only; string template or callback)
- `fallback` (commands only; `skills` | `skip`)

### InstructionOutputConfig
**Purpose**: Defines how instruction items are written per output directory.
**Fields**:
- `fileName` (string or callback)
- `group` (string or callback returning string or null)
- `convert` (converter function, optional)

### Item (SkillItem, CommandItem, SubagentItem, InstructionItem)
**Common fields**:
- `sourcePath` (string)
- `sourceType` (enum: skill | command | subagent | instruction)
- `name` (string)
- `raw` (string)
- `frontmatter` (object)
- `body` (string)

**Type-specific fields**:
- `files` (skill only; array of additional file paths)
- `outputDir` (instruction only; directory path for instruction output)

### ConvertContext
**Purpose**: Provides runtime context to callbacks.
**Fields**:
- `repo` (string)
- `home` (string)
- `target` (TargetDefinition)
- `flags` (object; CLI flags)
- Helpers: `template()`, `hash()`, `resolvePath()`

### ConvertResult
**Purpose**: Represents the outcome of a conversion.
**Variants**:
- `string` content for default path
- `{ path, content }` single output
- `[{ path, content }, ...]` multiple outputs
- `{ skip: true, reason? }`
- `{ satisfy: true, reason? }`
- `{ error: string }`
- `null`

### OutputFile
**Purpose**: Concrete file written by the sync process.
**Fields**:
- `path` (string)
- `content` (string)
- `sourceItem` (reference to Item)
- `targetId` (string)

### SyncRun
**Purpose**: A single compilation/sync execution.
**Fields**:
- `targets` (TargetDefinition[])
- `outputs` (OutputFile[])
- `warnings` (string[])
- `errors` (string[])
- `status` (enum: success | partial-failure | failed)

## Relationships

- A `TargetDefinition` owns zero or more `OutputConfig` objects.
- Each `Item` is processed against zero or more `TargetDefinition` objects.
- `ConvertContext` binds the current `TargetDefinition` and `Item` to a conversion.
- `SyncRun` aggregates `OutputFile` records and diagnostics for all targets.

## Constraints & Rules

- `AGENTS.md` outputs are canonical per output directory; duplicates are consolidated.
- Non-`AGENTS.md` collisions are errors and must not overwrite existing outputs.
- Instruction outputs default to `AGENTS.md` unless explicitly disabled.
- Converter errors fail only the affected target.
