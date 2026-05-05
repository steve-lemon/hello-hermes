import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { runJob } from "../src/core/runJob";

const temporaryRoots: string[] = [];

afterEach(async () => {
  delete process.env.TOOL_WORKSPACE;

  await Promise.all(
    temporaryRoots.splice(0).map(async (root) => {
      await fs.rm(root, { recursive: true, force: true });
    }),
  );
});

describe("runJob", () => {
  it("writes an artifact and returns a successful result", async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "hello-hermes-"));
    temporaryRoots.push(workspaceRoot);
    process.env.TOOL_WORKSPACE = workspaceRoot;

    const result = await runJob({
      jobType: "demo",
      targets: ["https://example.com"],
      options: {},
    });

    expect(result.status).toBe("ok");
    expect(result.counts.total).toBe(1);
    expect(result.artifacts).toHaveLength(1);

    const artifactPath = path.join(workspaceRoot, result.artifacts[0]);
    const artifact = JSON.parse(await fs.readFile(artifactPath, "utf8"));
    expect(artifact.jobId).toBe(result.jobId);
  });
});
