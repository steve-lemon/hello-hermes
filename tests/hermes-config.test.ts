import { describe, expect, it } from "vitest";

import { syncHermesConfig } from "../scripts/utils/hermesConfig";

describe("syncHermesConfig", () => {
  it("adds or updates the managed MCP server and skills directory", () => {
    const nextConfig = syncHermesConfig({
      config: {
        mcp_servers: {
          existing_tool: {
            command: "node",
            args: ["existing.js"],
          },
        },
        skills: {
          external_dirs: ["/tmp/skills-a"],
        },
      },
      projectId: "hello_hermes",
      mcpServerPath: "/tmp/project/dist/mcp/server.js",
      skillsDirectory: "/tmp/project/skills",
      toolWorkspace: "/tmp/workspace",
    });

    expect(nextConfig.mcp_servers?.existing_tool?.args).toEqual(["existing.js"]);
    expect(nextConfig.mcp_servers?.hello_hermes?.args).toEqual(["/tmp/project/dist/mcp/server.js"]);
    expect(nextConfig.skills?.external_dirs).toContain("/tmp/project/skills");
  });
});
