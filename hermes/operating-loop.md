# Hermes Operating Loop

## Roles

- Steve defines goals, approves risky operational decisions, and reviews incidents.
- Codex develops the tool, tests it, and updates the code and docs.
- Hermes operates the installed tool through MCP and follows the skill policy.

## Development Machine Flow

1. Steve creates or updates tool requirements.
2. Codex implements the tool locally.
3. Tests and CLI checks pass.
4. Steve pushes to GitHub.

## Hermes Machine Flow

1. Hermes machine pulls the repo manually or through `update_repo`.
2. `npm run hermes:update` refreshes local Hermes integration.
3. Hermes uses MCP tools through the registered skill.
4. Failures are captured as incidents.
5. Steve gives incident context back to Codex for fixes.

## First Install

1. Clone the repository on the Hermes machine.
2. Run `npm install`.
3. Run `npm run build`.
4. Run `npm run hermes:install`.
5. Run `npm run hermes:doctor`.

## Update

1. Pull the latest repo changes manually or through `update_repo`.
2. Run `npm install` when dependencies changed.
3. Run `npm run hermes:update`.
4. Run `npm run hermes:doctor`.
5. Run `health_check` and one small demo job before larger work.

## Doctor Checks

Use `npm run hermes:doctor` to review build output, skills registration, Hermes config wiring, git state, and writable operational directories.

## GitHub Pull Based Automatic Update

Use `update_repo` when Steve requests an update or during scheduled maintenance. The tool only uses `git status`, `git pull`, `npm install`, `npm run build`, and `npm run hermes:update`. It stops on dirty working trees unless explicitly allowed.

## Incident Workflow

When a run fails, record the incident in `incidents/<date>-<jobId>.md` using the standard template. Include the failed step, artifact path, suspected cause, and next action.

## Codex Follow-Up Guidance

When handing an issue back to Codex, include the job name, job ID, failed step, error code, artifact path, environment notes, and the smallest reproducible description you can provide.

## Incident Template

```md
# Incident

- Job:
- Job ID:
- Tool:
- Tool version:
- Started at:
- Finished at:
- Status:
- Success count:
- Failure count:
- Error code:
- Error message:
- Retryable:
- Artifact:
- Suspected cause:
- Suggested Codex fix:
- Recommended next action:
```
