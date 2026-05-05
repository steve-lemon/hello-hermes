import { describe, expect, it } from "vitest";

import { updateRepo, type CommandRunner } from "../src/core/updateRepo";

class FakeRunner implements CommandRunner {
  constructor(private readonly responses: Array<{ exitCode: number | null; stdout: string; stderr: string }>) {}

  async run() {
    const next = this.responses.shift();
    if (!next) {
      throw new Error("No fake response configured.");
    }
    return next;
  }
}

describe("updateRepo", () => {
  it("stops when the working tree is dirty by default", async () => {
    const result = await updateRepo(
      {},
      new FakeRunner([{ exitCode: 0, stdout: " M README.md", stderr: "" }]),
    );

    expect(result.status).toBe("failed");
    expect(result.errors[0]?.code).toBe("WORKING_TREE_DIRTY");
  });

  it("runs the full update flow when commands succeed", async () => {
    const result = await updateRepo(
      {},
      new FakeRunner([
        { exitCode: 0, stdout: "", stderr: "" },
        { exitCode: 0, stdout: "Already up to date.", stderr: "" },
        { exitCode: 0, stdout: "installed", stderr: "" },
        { exitCode: 0, stdout: "built", stderr: "" },
        { exitCode: 0, stdout: "updated", stderr: "" },
      ]),
    );

    expect(result.status).toBe("ok");
    expect(result.steps).toHaveLength(5);
    expect(result.health?.status).toBe("ok");
  });
});
