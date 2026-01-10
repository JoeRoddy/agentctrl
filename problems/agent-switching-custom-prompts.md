# Agent Switching: Custom Slash Commands Not Portable

## Summary
Custom slash commands/prompt packs differ between agent tools. In Codex, custom prompts are global and not stored per project, while other agents support repo-scoped prompt packs. This makes it hard to keep a consistent set of team prompts when switching agents.

## Impact
- Team workflows drift when moving between agents.
- Project-specific prompts are harder to share or version control.
- Onboarding requires manual setup for each agent.

## Notes / Context
- Codex supports global custom prompts, but not per-project prompt packs.
- Suggested workaround is to use repo-scoped skills instead of custom prompts.

## Resources
- https://github.com/Hotion13/cx-prompts
- https://github.com/openai/codex/issues/4715#issuecomment-3368447587
- https://github.com/openai/codex/issues/4734
