import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import { detectPackage } from "./utils/detectPackage.js";
import { getRequiredHermesTools, loadHermesConfig } from "./utils/hermesConfig.js";
import { Logger } from "./utils/logger.js";
import { getRuntimePaths } from "./utils/paths.js";

const execFileAsync = promisify(execFile);

async function main(): Promise<void> {
  const verbose = process.argv.includes("--verbose");
  const runtimePaths = getRuntimePaths();
  const detectedPackage = detectPackage();
  const logger = new Logger({
    projectRoot: runtimePaths.projectRoot,
    homeDir: runtimePaths.homeDir,
    verbose
  });

  logger.info("Hermes Integration Doctor");
  logger.info("");

  ok(logger, `package name: ${detectedPackage.packageName}`);
  ok(logger, `project path: ${logger.maskPath(runtimePaths.projectRoot)}`);

  await reportPathExists(logger, runtimePaths.distServerPath, "build output", "dist/mcp/server.js is missing");
  await reportPathExists(logger, runtimePaths.skillsDir, "skills directory", "skills directory is missing");
  await reportPathExists(
    logger,
    path.join(runtimePaths.skillsDir, "hermes-npx-tool", "SKILL.md"),
    "skill file",
    "SKILL.md is missing"
  );

  const hermesConfigLoaded = await loadHermesConfig(runtimePaths.hermesConfigPath);
  if (hermesConfigLoaded.created) {
    warn(logger, `Hermes config not found: ${logger.maskPath(runtimePaths.hermesConfigPath)}`);
  } else {
    ok(logger, `Hermes config: ${logger.maskPath(runtimePaths.hermesConfigPath)}`);
  }

  const config = hermesConfigLoaded.config;
  const registeredServer = (config.mcp_servers as Record<string, unknown> | undefined)?.[detectedPackage.safeProjectId] as
    | Record<string, unknown>
    | undefined;

  if (registeredServer) {
    ok(logger, `MCP server registered: ${detectedPackage.safeProjectId}`);
    report(
      logger,
      registeredServer.command === "node" ? "OK" : "WARN",
      registeredServer.command === "node" ? "registered command: node" : "registered command is not node"
    );
    const args = Array.isArray(registeredServer.args) ? registeredServer.args : [];
    const hasCurrentServerPath = args.includes(runtimePaths.distServerPath);
    report(logger, hasCurrentServerPath ? "OK" : "WARN", hasCurrentServerPath
      ? "registered args point to the current project"
      : "registered args do not point to the current project");

    const includeTools = Array.isArray((registeredServer.tools as { include?: unknown[] } | undefined)?.include)
      ? ((registeredServer.tools as { include?: unknown[] }).include?.filter((value): value is string => typeof value === "string") ?? [])
      : [];

    for (const toolName of getRequiredHermesTools()) {
      report(logger, includeTools.includes(toolName) ? "OK" : "WARN", `${toolName} tool ${includeTools.includes(toolName) ? "included" : "missing"}`);
    }
  } else {
    warn(logger, `MCP server not registered: ${detectedPackage.safeProjectId}`);
  }

  const externalDirs = Array.isArray(config.skills?.external_dirs)
    ? config.skills?.external_dirs.filter((value): value is string => typeof value === "string")
    : [];
  report(
    logger,
    externalDirs.includes(runtimePaths.skillsDir) ? "OK" : "WARN",
    externalDirs.includes(runtimePaths.skillsDir) ? "skills path registered" : "skills path not registered"
  );

  await reportCommand(logger, "node", ["--version"], "node executable available");
  await reportCommand(logger, "git", ["--version"], "git executable available");

  const gitRemote = await runOptionalCommand("git", ["remote", "get-url", "origin"], runtimePaths.projectRoot);
  report(logger, gitRemote.ok ? "OK" : "WARN", gitRemote.ok ? "git remote origin found" : "git remote origin not found");

  const gitBranch = await runOptionalCommand("git", ["branch", "--show-current"], runtimePaths.projectRoot);
  report(logger, gitBranch.ok ? "OK" : "WARN", gitBranch.ok ? `current branch: ${gitBranch.stdout.trim() || "(detached)"}` : "current branch unavailable");

  const gitStatus = await runOptionalCommand("git", ["status", "--short"], runtimePaths.projectRoot);
  if (gitStatus.ok && gitStatus.stdout.trim()) {
    warn(logger, "working tree has uncommitted changes");
  } else if (gitStatus.ok) {
    ok(logger, "working tree clean");
  } else {
    warn(logger, "working tree status unavailable");
  }

  await reportWritable(logger, runtimePaths.artifactsDir, "artifacts");
  await reportWritable(logger, runtimePaths.incidentsDir, "incidents");

  const health = await runOptionalCommand("node", ["dist/cli.js", "health"], runtimePaths.projectRoot);
  report(logger, health.ok ? "OK" : "WARN", health.ok ? "CLI health check succeeded" : "CLI health check unavailable");

  warn(logger, "Hermes restart may be required");
}

function ok(logger: Logger, message: string): void {
  logger.info(`[OK] ${message}`);
}

function warn(logger: Logger, message: string): void {
  logger.info(`[WARN] ${message}`);
}

function report(logger: Logger, level: "OK" | "WARN", message: string): void {
  logger.info(`[${level}] ${message}`);
}

async function reportPathExists(logger: Logger, targetPath: string, label: string, failure: string): Promise<void> {
  try {
    await fs.access(targetPath);
    ok(logger, `${label}: ${logger.maskPath(targetPath)}`);
  } catch {
    warn(logger, failure);
  }
}

async function reportCommand(logger: Logger, command: string, args: string[], successMessage: string): Promise<void> {
  const result = await runOptionalCommand(command, args, process.cwd());
  report(logger, result.ok ? "OK" : "WARN", result.ok ? successMessage : `${command} command unavailable`);
}

async function reportWritable(logger: Logger, targetDir: string, label: string): Promise<void> {
  try {
    await fs.mkdir(targetDir, { recursive: true });
    const probe = path.join(targetDir, ".doctor-write-check");
    await fs.writeFile(probe, "ok\n", "utf8");
    await fs.unlink(probe);
    ok(logger, `${label} writable`);
  } catch {
    warn(logger, `${label} not writable`);
  }
}

async function runOptionalCommand(command: string, args: string[], cwd: string): Promise<{ ok: boolean; stdout: string; stderr: string }> {
  try {
    const result = await execFileAsync(command, args, { cwd });
    return {
      ok: true,
      stdout: result.stdout,
      stderr: result.stderr
    };
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string };
    return {
      ok: false,
      stdout: execError.stdout ?? "",
      stderr: execError.stderr ?? ""
    };
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown Hermes doctor error";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
