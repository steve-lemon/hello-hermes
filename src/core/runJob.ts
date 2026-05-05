import fs from "node:fs/promises";
import path from "node:path";

import { executeBrowserSearch } from "./browserSearch";
import { unknownToolError } from "./errors";
import type { BrowserSearchJobInput, DemoJobInput, JobResult } from "./types";
import { validateJobInput } from "./validation";
import { getWorkspaceRoot, toWorkspaceRelativePath } from "./workspace";

function createJobId(): string {
  const timestamp = new Date().toISOString().replaceAll(/[-:.]/g, "").slice(0, 15);
  const randomPart = Math.random().toString(36).slice(2, 8);

  return `demo-job-${timestamp}-${randomPart}`;
}

function createDemoResult(jobId: string, startedAt: string, input: DemoJobInput): JobResult {
  const total = input.targets.length;

  return {
    jobId,
    status: "ok",
    summary: `Demo job completed for ${total} target${total === 1 ? "" : "s"}.`,
    startedAt,
    finishedAt: new Date().toISOString(),
    counts: {
      total,
      success: total,
      failed: 0,
    },
    artifacts: [],
    errors: [],
  };
}

async function createBrowserSearchResult(
  jobId: string,
  startedAt: string,
  input: BrowserSearchJobInput,
): Promise<JobResult> {
  const search = await executeBrowserSearch(input);
  const topResult = search.results[0];

  return {
    jobId,
    status: "ok",
    summary: topResult
      ? `Browser search completed for "${input.query}". Top result: ${topResult.title}.`
      : `Browser search completed for "${input.query}".`,
    startedAt,
    finishedAt: new Date().toISOString(),
    counts: {
      total: search.results.length,
      success: search.results.length,
      failed: 0,
    },
    artifacts: [],
    errors: [],
    details: {
      query: search.query,
      searchUrl: search.searchUrl,
      browserOpened: search.browserOpened,
      browserOpenAttempted: search.browserOpenAttempted,
      warnings: search.warnings,
      results: search.results,
    },
  };
}

export async function runJob(input: unknown): Promise<JobResult> {
  const startedAt = new Date().toISOString();
  const workspaceRoot = getWorkspaceRoot();
  const jobId = createJobId();

  try {
    const jobInput = validateJobInput(input);
    const result =
      jobInput.jobType === "browser_search"
        ? await createBrowserSearchResult(jobId, startedAt, jobInput)
        : createDemoResult(jobId, startedAt, jobInput);
    const artifactPath = path.join(workspaceRoot, "artifacts", `${jobId}.json`);
    const relativeArtifactPath = toWorkspaceRelativePath(artifactPath);

    await fs.mkdir(path.dirname(artifactPath), { recursive: true });
    result.artifacts.push(relativeArtifactPath);
    await fs.writeFile(`${artifactPath}`, `${JSON.stringify(result, null, 2)}\n`, "utf8");

    return result;
  } catch (error) {
    return {
      jobId,
      status: "failed",
      summary: "Job failed before producing artifacts.",
      startedAt,
      finishedAt: new Date().toISOString(),
      counts: {
        total: 0,
        success: 0,
        failed: 0,
      },
      artifacts: [],
      errors: [unknownToolError(error)],
    };
  }
}
