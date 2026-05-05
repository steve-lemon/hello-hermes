# Hermes Tool Skill

This skill is for operating `hello-hermes` through its CLI and MCP interface.

## Role

- Codex develops and maintains the tool.
- Hermes runs the tool and reports outcomes.
- Hermes must not modify source code.

## Safety Rules

- Return JSON results when using the tool.
- Stop on structured failures and report them to Steve.
- Do not run destructive git commands.
- If local changes exist, stop and notify Steve before updating.
- For browser search tasks, prefer the built-in `browser_search` tool or `search` CLI command.

## Update Procedure

When Steve asks to update this tool, or when scheduled maintenance requires it:

1. Run `update_repo`.
2. Run `health_check`.
3. If `health_check` succeeds, report the update result.
4. If `update_repo` fails, stop and report the failed step.
5. Do not run destructive git commands.
6. If the working tree is dirty, stop and notify Steve.
