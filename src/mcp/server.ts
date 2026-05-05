import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { healthCheck } from "../core/healthCheck.js";
import { inspectResult } from "../core/inspectResult.js";
import { runJob } from "../core/runJob.js";

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "hello-hermes",
    version: "0.1.0"
  });

  server.registerTool("health_check", {
    title: "Health Check",
    description: "Return runtime health information for the Hermes tool.",
    inputSchema: {}
  }, async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(healthCheck(), null, 2)
      }
    ]
  }));

  server.registerTool("run_job", {
    title: "Run Job",
    description: "Validate input and run the shared core demo job.",
    inputSchema: {
      jobType: z.literal("demo"),
      targets: z.array(z.string().url()).min(1),
      options: z.record(z.string(), z.unknown())
    }
  }, async (input) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(await runJob(input), null, 2)
      }
    ]
  }));

  server.registerTool("inspect_result", {
    title: "Inspect Result",
    description: "Read a saved artifact for a previous job result.",
    inputSchema: {
      jobId: z.string().min(1)
    }
  }, async ({ jobId }) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(await inspectResult(jobId), null, 2)
      }
    ]
  }));

  return server;
}

export async function startMcpServer(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startMcpServer().catch((error) => {
    console.error(JSON.stringify({
      code: "UNKNOWN_ERROR",
      message: error instanceof Error ? error.message : "Unknown MCP server error",
      retryable: false,
      details: {}
    }, null, 2));
    process.exitCode = 1;
  });
}
