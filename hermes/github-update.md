# GitHub Update

## Purpose

`update_repo` lets Hermes refresh this repository from GitHub, rebuild it, and refresh Hermes integration without using destructive git commands.

## When To Use

- Steve explicitly asks Hermes to update this tool.
- Scheduled maintenance requires pulling the latest version.
- Hermes needs to refresh the registered MCP path after a repo move or rebuild.

## When Not To Use

- The working tree has local changes that should be reviewed first.
- Steve has not approved an update window.
- A failed update has not yet been investigated.

## Dirty Working Tree Policy

If the working tree is dirty, stop and notify Steve. The default `update_repo` behavior is to halt before `git pull`.

## Allowed Git Commands

```text
git status
git remote -v
git pull
```

## Forbidden Commands

```text
git reset
git clean
git push
git checkout
rm -rf
```

## Post-Update Verification

1. Run `update_repo`.
2. Run `health_check`.
3. Run one small demo job.
4. Confirm the result artifact and counts.
5. Stop and report any failed step.

## Incident Rule

If the update or verification flow fails, write an incident with the failed step, error details, artifact path if present, and a suggested Codex follow-up.
