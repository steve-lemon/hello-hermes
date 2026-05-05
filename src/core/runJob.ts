import fs from "node:fs/promises";
import path from "node:path";

import { unknownToolError } from "./errors.js";
import type { JobInput, JobResult } from "./types.js";
import { validateJobInput } from "./validation.js";
import { getWorkspaceRoot, toWorkspaceRelativePath } from "./workspace.js";

function createJobId(): string {
  const timestamp = new Date().toISOString().replaceAll(/[-:.]/g, "").slice(0, 15);
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `demo-job-${timestamp}-${randomPart}`;
}

export async function runJob(input: unknown): Promise<JobResult> {
  const startedAt = new Date().toISOString();
  const workspaceRoot = getWorkspaceRoot();
  const jobId = createJobId();

  try {
    const jobInput = validateJobInput(input);
    const result = createDemoResult(jobId, startedAt, jobInput);
    const artifactPath = path.join(workspaceRoot, "artifacts", `${jobId}.json`);
    const relativeArtifactPath = toWorkspaceRelativePath(artifactPath);

    await fs.mkdir(path.dirname(artifactPath), { recursive: true });
    result.artifacts.push(relativeArtifactPath);
    await fs.writeFile(artifactPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
    return result;
  } catch (error) {
    const finishedAt = new Date().toISOString();
    const toolError = unknownToolError(error);

    return {
      jobId,
      status: "failed",
      summary: "Job failed before producing artifacts.",
      startedAt,
      finishedAt,
      counts: {
        total: 0,
        success: 0,
        failed: 0
      },
      artifacts: [],
      errors: [toolError]
    };
  }
}

function createDemoResult(jobId: string, startedAt: string, input: JobInput): JobResult {
  const total = input.targets.length;
  const finishedAt = new Date().toISOString();

  return {
    jobId,
    status: "ok",
    summary: `Demo job completed for ${total} target${total === 1 ? "" : "s"}.`,
    startedAt,
    finishedAt,
    counts: {
      total,
      success: total,
      failed: 0
    },
    artifacts: [],
    errors: []
  };
}
