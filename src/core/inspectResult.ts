import fs from "node:fs/promises";
import path from "node:path";

import { createToolError } from "./errors";
import { getWorkspaceRoot, toWorkspaceRelativePath } from "./workspace";

export async function inspectResult(jobId: string) {
  const artifactPath = path.join(getWorkspaceRoot(), "artifacts", `${jobId}.json`);
  const relativeArtifactPath = toWorkspaceRelativePath(artifactPath);

  try {
    const raw = await fs.readFile(artifactPath, "utf8");

    return {
      jobId,
      found: true,
      artifactPath: relativeArtifactPath,
      result: JSON.parse(raw),
    };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return {
        jobId,
        found: false,
        artifactPath: relativeArtifactPath,
        error: createToolError(
          "RESULT_NOT_FOUND",
          `Result artifact not found for jobId ${jobId}.`,
          false,
          { jobId },
        ),
      };
    }

    throw error;
  }
}
