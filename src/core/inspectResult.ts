import fs from "node:fs/promises";
import path from "node:path";

import { createToolError } from "./errors.js";
import type { InspectResult, JobResult } from "./types.js";
import { getWorkspaceRoot, toWorkspaceRelativePath } from "./workspace.js";

export async function inspectResult(jobId: string): Promise<InspectResult> {
  const artifactPath = path.join(getWorkspaceRoot(), "artifacts", `${jobId}.json`);
  const relativeArtifactPath = toWorkspaceRelativePath(artifactPath);

  try {
    const raw = await fs.readFile(artifactPath, "utf8");
    const result = JSON.parse(raw) as JobResult;

    return {
      jobId,
      found: true,
      artifactPath: relativeArtifactPath,
      result
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {
        jobId,
        found: false,
        artifactPath: relativeArtifactPath,
        error: createToolError("UNKNOWN_ERROR", `Result artifact not found for jobId ${jobId}.`, false, {
          jobId
        })
      };
    }

    throw error;
  }
}
