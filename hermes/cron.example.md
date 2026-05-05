# Cron Example

Use the following recurring prompt with Hermes:

```text
Every day at 9:00 AM, use the hermes-npx-tool skill to run the demo job.
Run health_check first, and only continue if the tool reports healthy status.
Run run_job, inspect the artifact, and report to Steve if success rate falls below 80%.
If failures occur, draft an incident markdown file in the incidents folder.
If the tool needs changes, include a suggested Codex follow-up task.
```
