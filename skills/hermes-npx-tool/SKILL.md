# hermes-npx-tool

## When To Use

Use this skill when Hermes needs to run the shared demo tool through MCP as part of a recurring operating loop, validation pass, or structured reporting task.

## Required Workflow

1. Run `health_check` first.
2. If health is normal, run the actual job through `run_job`.
3. Verify the result with `inspect_result` or the saved artifact file.
4. Check `status`, `counts`, and `errors` before declaring success.

## Stop Immediately And Report To Steve

Stop the run and report immediately when any of the following occurs:

- `AUTH_REQUIRED`
- `CAPTCHA_BLOCKED`
- repeated `RATE_LIMITED`
- `SELECTOR_CHANGED`
- `DESTRUCTIVE_ACTION_BLOCKED`
- payment, deletion, bulk change, or permission change operations
- output schema mismatch
- success rate below 80%

## Reporting Format

- Job name
- Job ID
- Success count and failure count
- Failure cause
- Artifact path
- Whether retry is appropriate
- Suggested Codex fix

## Repository Update Procedure

Use this only when Steve asks to update this tool or when scheduled maintenance requires pulling the latest GitHub version.

Steps:

1. Run `update_repo`.
2. If it succeeds, run `health_check`.
3. If health_check succeeds, report the updated version and status.
4. If update_repo fails, stop and report the failed step.
5. Do not retry destructive commands.
6. Do not run git reset, git clean, git push, or checkout.
7. If the working tree is dirty, stop and notify Steve.

## Scheduled Update Policy

For scheduled updates:

1. Prefer low-traffic hours.
2. Run `update_repo`.
3. Run `health_check`.
4. Run a small demo job.
5. If any step fails, create an incident report.
6. Do not continue with production-scale jobs after a failed update.
