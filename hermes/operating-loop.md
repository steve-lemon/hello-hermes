# Hermes Operating Loop

## Objective

Use this repository as a Codex-built tool that Hermes can run repeatedly through MCP.

## Recommended Loop

1. Run `health_check` before any operational job.
2. Submit validated input through `run_job`.
3. Verify the output through `inspect_result` or `artifacts/<jobId>.json`.
4. Review `status`, `counts`, and `errors`.
5. Stop and notify Steve if the run hits a blocked condition or falls below the success threshold.
6. Record incidents with the template below when follow-up is needed.

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
