import { describe, expect, it } from "vitest";

import { prepareHermesConfig } from "../scripts/utils/hermesConfig.js";

describe("prepareHermesConfig", () => {
  const runtimePaths = {
    projectRoot: "/project",
    distServerPath: "/project/dist/mcp/server.js",
    skillsDir: "/project/skills",
    artifactsDir: "/project/artifacts",
    incidentsDir: "/project/incidents",
    homeDir: "/home/tester",
    hermesDir: "/home/tester/.hermes",
    hermesConfigPath: "/home/tester/.hermes/config.yaml",
    defaultToolWorkspace: "/home/tester/agent-workspace"
  };

  const detectedPackage = {
    packageName: "hello-hermes",
    safeProjectId: "hello_hermes"
  };

  it("preserves existing mcp servers", () => {
    const result = prepareHermesConfig(
      {
        mcp_servers: {
          another_tool: {
            command: "node",
            args: ["/some/other/server.js"]
          }
        }
      },
      {
        detectedPackage,
        runtimePaths
      }
    );

    const servers = result.config.mcp_servers as Record<string, unknown>;
    expect(servers.another_tool).toBeDefined();
    expect(servers.hello_hermes).toBeDefined();
  });

  it("avoids duplicating skills external dirs", () => {
    const result = prepareHermesConfig(
      {
        skills: {
          external_dirs: ["/project/skills"]
        }
      },
      {
        detectedPackage,
        runtimePaths
      }
    );

    expect(result.config.skills?.external_dirs).toEqual(["/project/skills"]);
  });
});
