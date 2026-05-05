# Cron Example

Use the following recurring prompt with Hermes:

```text
Every day at 9:00 AM, use the hermes-npx-tool skill to run the demo job.
Run health_check first, and only continue if the tool reports healthy status.
Run run_job, inspect the artifact, and report to Steve if success rate falls below 80%.
If failures occur, draft an incident markdown file in the incidents folder.
If the tool needs changes, include a suggested Codex follow-up task.
```

Scheduled GitHub update example:

```text
At 3:00 AM every day, use this tool's skill to perform a scheduled update.

Procedure:

1. Run update_repo.
2. Run health_check.
3. Run one small demo job.
4. Review the result.
5. If anything fails, write an incident and report to Steve.
6. If everything succeeds, leave a short update summary only.

Warnings:

- Stop if the working tree is dirty.
- Do not run git reset, git clean, or git push.
- Do not continue with large-scale jobs after a failed update.
```
