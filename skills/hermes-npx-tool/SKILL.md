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
