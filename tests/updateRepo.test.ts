import { describe, expect, it } from "vitest";

import {
  getAllowedUpdateRepoCommands,
  type CommandExecutionResult,
  type UpdateRepoCommandRunner,
  updateRepo
} from "../src/core/updateRepo.js";

class MockRunner implements UpdateRepoCommandRunner {
  public readonly calls: string[] = [];

  public constructor(private readonly results: Record<string, CommandExecutionResult>) {}

  public async run(command: string, args: string[]): Promise<CommandExecutionResult> {
    const key = [command, ...args].join(" ");
    this.calls.push(key);
    return this.results[key] ?? { exitCode: 0, stdout: "", stderr: "" };
  }
}

describe("updateRepo", () => {
  it("stops when the working tree is dirty", async () => {
    const runner = new MockRunner({
      "git status --short": {
        exitCode: 0,
        stdout: " M README.md",
        stderr: ""
      }
    });

    const result = await updateRepo({}, runner);

    expect(result.status).toBe("failed");
    expect(result.errors[0]?.code).toBe("WORKING_TREE_DIRTY");
    expect(runner.calls).toEqual(["git status --short"]);
  });

  it("continues through the allowed update flow", async () => {
    const runner = new MockRunner({
      "git status --short": { exitCode: 0, stdout: "", stderr: "" },
      "git pull": { exitCode: 0, stdout: "Already up to date.", stderr: "" },
      "npm install": { exitCode: 0, stdout: "added 0 packages", stderr: "" },
      "npm run build": { exitCode: 0, stdout: "build ok", stderr: "" },
      "npm run hermes:update": { exitCode: 0, stdout: "update ok", stderr: "" }
    });

    const result = await updateRepo({}, runner);

    expect(result.status).toBe("ok");
    expect(result.steps).toHaveLength(5);
    expect(runner.calls).toEqual(getAllowedUpdateRepoCommands());
  });

  it("exposes the command allowlist", () => {
    expect(getAllowedUpdateRepoCommands()).toEqual([
      "git status --short",
      "git pull",
      "npm install",
      "npm run build",
      "npm run hermes:update"
    ]);
  });
});
