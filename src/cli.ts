#!/usr/bin/env node
import fs from "node:fs/promises";

import { healthCheck, inspectResult, runJob, unknownToolError } from "./core/index";
import { startMcpServer } from "./mcp/server";

function readFlagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function printUsage(): void {
  process.stderr.write(
    `Usage:
  npx . health
  npx . run --input examples/job.input.json
  npx . run --json '{"jobType":"demo","targets":["https://example.com"],"options":{}}'
  npx . search --query "hello hermes"
  npx . inspect --job-id <jobId>
  npx . mcp
`,
  );
}

async function runCommand(args: string[]) {
  const inputFile = readFlagValue(args, "--input");
  const jsonInput = readFlagValue(args, "--json");

  if (inputFile) {
    const raw = await fs.readFile(inputFile, "utf8");
    return runJob(JSON.parse(raw));
  }

  if (jsonInput) {
    return runJob(JSON.parse(jsonInput));
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

async function searchCommand(args: string[]) {
  const query = readFlagValue(args, "--query");
  const limit = readFlagValue(args, "--limit");
  const noOpenBrowser = args.includes("--no-open-browser");

  if (!query) {
    throw new Error("search requires --query <text>.");
  }

  return runJob({
    jobType: "browser_search",
    query,
    options: {
      openBrowser: !noOpenBrowser,
      ...(limit ? { resultLimit: Number(limit) } : {}),
    },
  });
}

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
    case "search":
      printJson(await searchCommand(args));
      return;
    case "mcp":
      await startMcpServer();
      return;
    default:
      printUsage();
      process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${JSON.stringify(unknownToolError(error), null, 2)}\n`);
  process.exitCode = 1;
});
