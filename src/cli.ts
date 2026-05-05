#!/usr/bin/env node
import fs from "node:fs/promises";

import { healthCheck } from "./core/healthCheck.js";
import { inspectResult } from "./core/inspectResult.js";
import { runJob } from "./core/runJob.js";
import { startMcpServer } from "./mcp/server.js";

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case "health":
      printJson(healthCheck());
      return;
    case "run":
      printJson(await runCommand(args));
      return;
    case "inspect":
      printJson(await inspectCommand(args));
      return;
    case "mcp":
      await startMcpServer();
      return;
    default:
      printUsage();
      process.exitCode = 1;
  }
}

async function runCommand(args: string[]) {
  const inputFile = readFlagValue(args, "--input");
  const jsonInput = readFlagValue(args, "--json");

  if (inputFile) {
    const raw = await fs.readFile(inputFile, "utf8");
    return runJob(JSON.parse(raw) as unknown);
  }

  if (jsonInput) {
    return runJob(JSON.parse(jsonInput) as unknown);
  }

  throw new Error("run requires either --input <file> or --json '<json>'.");
}

async function inspectCommand(args: string[]) {
  const jobId = readFlagValue(args, "--job-id");

  if (!jobId) {
    throw new Error("inspect requires --job-id <jobId>.");
  }

  return inspectResult(jobId);
}

function readFlagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function printUsage(): void {
  process.stderr.write(
    "Usage:\n" +
      "  npx . health\n" +
      "  npx . run --input examples/job.input.json\n" +
      "  npx . run --json '{\"jobType\":\"demo\",\"targets\":[\"https://example.com\"],\"options\":{}}'\n" +
      "  npx . inspect --job-id <jobId>\n" +
      "  npx . mcp\n"
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown CLI error";
  process.stderr.write(`${JSON.stringify({
    code: "UNKNOWN_ERROR",
    message,
    retryable: false,
    details: {}
  }, null, 2)}\n`);
  process.exitCode = 1;
});
