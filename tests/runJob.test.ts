import fs from "node:fs/promises";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { inspectResult } from "../src/core/inspectResult.js";
import { runJob } from "../src/core/runJob.js";
import { getProjectRoot } from "../src/core/workspace.js";

describe("runJob", () => {
  const projectRoot = getProjectRoot();

  beforeEach(() => {
    process.env.TOOL_WORKSPACE = projectRoot;
  });

  afterEach(async () => {
    const artifactsDir = path.join(projectRoot, "artifacts");
    const files = await fs.readdir(artifactsDir);

    await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map((file) => fs.unlink(path.join(artifactsDir, file)))
    );
  });

  it("returns ok for demo input", async () => {
    const result = await runJob({
      jobType: "demo",
      targets: ["https://example.com"],
      options: {}
    });

    expect(result.status).toBe("ok");
    expect(result.counts.success).toBe(1);
    expect(result.errors).toEqual([]);
  });

  it("creates an artifact file", async () => {
    const result = await runJob({
      jobType: "demo",
      targets: ["https://example.com"],
      options: {}
    });

    expect(result.artifacts).toHaveLength(1);
    const artifactPath = path.join(projectRoot, result.artifacts[0]);
    const saved = JSON.parse(await fs.readFile(artifactPath, "utf8")) as { jobId: string };

    expect(saved.jobId).toBe(result.jobId);
  });

  it("returns a validation error for invalid input", async () => {
    const result = await runJob({
      jobType: "demo",
      targets: [],
      options: {}
    });

    expect(result.status).toBe("failed");
    expect(result.errors[0]?.code).toBe("VALIDATION_ERROR");
  });

  it("reads an existing result by jobId", async () => {
    const runResult = await runJob({
      jobType: "demo",
      targets: ["https://example.com"],
      options: {}
    });

    const inspected = await inspectResult(runResult.jobId);

    expect(inspected.found).toBe(true);
    if (inspected.found) {
      expect(inspected.result.jobId).toBe(runResult.jobId);
    }
  });

  it("returns not found when a result is missing", async () => {
    const inspected = await inspectResult("missing-job");

    expect(inspected.found).toBe(false);
    if (!inspected.found) {
      expect(inspected.error.message).toContain("missing-job");
    }
  });
});
