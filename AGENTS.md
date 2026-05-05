# AGENTS

## Roles

- Steve defines requirements, approves risky operations, and makes final operating decisions.
- Codex develops and maintains the tool.
- Hermes operates the tool through MCP and follows the skill instructions.

## Engineering Rules

- Keep the shared core logic in `src/core`.
- CLI and MCP must call the same core functions rather than duplicating logic.
- Preserve the output schema contract unless the spec, tests, and consumers are updated together.
- Do not rename or remove existing structured error codes casually.
- New features must update tests and `TOOL_SPEC.md`.
- Destructive actions are blocked by default and require explicit approval and documentation.
- Keep the assumption that Hermes is an operator, not a developer.

## Path Rules

- Never commit absolute paths into the repository.
- Use relative paths or `<PROJECT_ROOT>` placeholders.
- Only installer scripts may resolve absolute paths at runtime.
- Never hardcode `/Users/...`, `/home/...`, or `C:\Users\...`.
