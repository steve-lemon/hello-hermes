import { describe, expect, it } from "vitest";

import { healthCheck } from "../src/core/healthCheck.js";

describe("healthCheck", () => {
  it("returns ok information", () => {
    const result = healthCheck();

    expect(result.status).toBe("ok");
    expect(result.packageName).toBe("hello-hermes");
    expect(result.cwd).toContain("<PROJECT_ROOT>");
    expect(result.toolWorkspace).toContain("<TOOL_WORKSPACE>");
  });
});
