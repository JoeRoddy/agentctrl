# Data Model: Sync Agent Config

## CanonicalConfigSet
- **Description**: The authoritative collection of agent configuration files to sync.
- **Fields**:
  - `repoRoot`: string (absolute path)
  - `skillsPath`: string (absolute path, `${repoRoot}/agents/skills`)
  - `exists`: boolean
- **Validation Rules**:
  - `skillsPath` must exist and be readable.

## TargetAgent
- **Description**: A named destination that receives the canonical config.
- **Fields**:
  - `name`: enum (`codex` | `claude` | `copilot`)
  - `destinationPath`: string (absolute path)
  - `selected`: boolean
- **Validation Rules**:
  - `name` must be one of the supported target names.

## SyncRequest
- **Description**: A single invocation of the sync command.
- **Fields**:
  - `cwd`: string (absolute path)
  - `repoRoot`: string (absolute path)
  - `skip`: string[] (target names)
  - `only`: string[] (target names)
  - `jsonOutput`: boolean
  - `requestedAt`: string (ISO timestamp)
- **Validation Rules**:
  - `skip` and `only` cannot both be non-empty.
  - All names in `skip` and `only` must be supported targets.
  - After filters, at least one target must remain selected.

## SyncResult
- **Description**: Per-target outcome produced by a sync request.
- **Fields**:
  - `targetName`: enum (`codex` | `claude` | `copilot`)
  - `status`: enum (`synced` | `skipped` | `failed`)
  - `message`: string
  - `error`: string | null
- **Validation Rules**:
  - `status` must be one of `synced`, `skipped`, or `failed`.

## Relationships
- `SyncRequest` references one `CanonicalConfigSet`.
- `SyncRequest` selects many `TargetAgent` entries.
- `SyncRequest` produces many `SyncResult` entries (one per target).

## State Transitions
- **SyncRequest**: `created` -> `running` -> `completed`.
- **SyncResult**: `pending` -> `synced` | `skipped` | `failed`.
