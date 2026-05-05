import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { healthCheck, inspectResult, runJob, updateRepo } from "../core/index";

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "hello-hermes",
    version: "0.1.0",
  });

  server.registerTool(
    "health_check",
    {
      title: "Health Check",
      description: "Return runtime health information for the Hermes tool.",
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(healthCheck(), null, 2),
        },
      ],
    }),
  );

  server.registerTool(
    "run_job",
    {
      title: "Run Job",
      description: "Validate input and run the shared core job.",
      inputSchema: {
        jobType: z.enum(["demo", "browser_search"]),
        targets: z.array(z.string()).optional(),
        query: z.string().optional(),
        options: z.record(z.string(), z.unknown()).optional(),
      },
    },
    async (input) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(await runJob(input), null, 2),
        },
      ],
    }),
  );

  server.registerTool(
    "browser_search",
    {
      title: "Browser Search",
      description: "Open a browser search for a query and report top parsed search results.",
      inputSchema: {
        query: z.string().min(1),
        openBrowser: z.boolean().optional(),
        resultLimit: z.number().int().min(1).max(10).optional(),
      },
    },
    async ({ query, openBrowser, resultLimit }) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            await runJob({
              jobType: "browser_search",
              query,
              options: {
                ...(openBrowser === undefined ? {} : { openBrowser }),
                ...(resultLimit === undefined ? {} : { resultLimit }),
              },
            }),
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.registerTool(
    "inspect_result",
    {
      title: "Inspect Result",
      description: "Read a saved artifact for a previous job result.",
      inputSchema: {
        jobId: z.string().min(1),
      },
    },
    async ({ jobId }) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(await inspectResult(jobId), null, 2),
        },
      ],
    }),
  );

  server.registerTool(
    "update_repo",
    {
      title: "Update Repository",
      description: "Pull latest GitHub changes, install dependencies, rebuild the project, and refresh Hermes integration.",
      inputSchema: {
        allowDirty: z.boolean().optional(),
        runInstall: z.boolean().optional(),
        runBuild: z.boolean().optional(),
        runHermesUpdate: z.boolean().optional(),
      },
    },
    async (input) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(await updateRepo(input), null, 2),
        },
      ],
    }),
  );

  return server;
}

export async function startMcpServer(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startMcpServer().catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown MCP server error";
    process.stderr.write(
      `${JSON.stringify(
        {
          code: "UNKNOWN_ERROR",
          message,
          retryable: false,
          details: {},
        },
        null,
        2,
      )}\n`,
    );
    process.exitCode = 1;
  });
}
