import fs from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getProjectRoot } from "../src/core/workspace.js";
import { validateJobInput } from "../src/core/validation.js";

const ABSOLUTE_PATH_PATTERN = /(?:\/Users\/[A-Za-z0-9._-]+\/|\/home\/[A-Za-z0-9._-]+\/|[A-Za-z]:\\Users\\[A-Za-z0-9._-]+\\)/m;

describe("validation", () => {
  it("accepts valid input", () => {
    const input = validateJobInput({
      jobType: "demo",
      targets: ["https://example.com"],
      options: {}
    });

    expect(input.jobType).toBe("demo");
  });

  it("repository docs do not contain absolute local paths", async () => {
    const projectRoot = getProjectRoot();
    const filesToCheck = [
      "README.md",
      "TOOL_SPEC.md",
      "AGENTS.md",
      "hermes/config.example.yaml",
      "hermes/config.fragment.yaml",
      "hermes/install-and-connect.md",
      "hermes/github-update.md",
      "hermes/cron.example.md",
      "hermes/operating-loop.md",
      "skills/hermes-npx-tool/SKILL.md"
    ];

    for (const relativePath of filesToCheck) {
      const content = await fs.readFile(path.join(projectRoot, relativePath), "utf8");
      expect(content, relativePath).not.toMatch(ABSOLUTE_PATH_PATTERN);
    }
  });
});
