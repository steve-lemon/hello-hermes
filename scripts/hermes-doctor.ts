import fs from "node:fs";
import { execFileSync } from "node:child_process";

import { detectPackage } from "./utils/detectPackage";
import { readHermesConfig } from "./utils/hermesConfig";
import { getDefaultToolWorkspace, getHermesConfigPath, getMcpServerBuildPath, getProjectRoot, getSkillsDirectory } from "./utils/paths";

type CheckLevel = "OK" | "WARN" | "FAIL";

type CheckResult = {
  level: CheckLevel;
  message: string;
};

function printCheck(result: CheckResult): void {
  process.stdout.write(`[${result.level}] ${result.message}\n`);
}

function hasGitRemote(projectRoot: string): boolean {
  try {
    const output = execFileSync("git", ["remote", "-v"], {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return output.trim().length > 0;
  } catch {
    return false;
  }
}

function canRunNode(): boolean {
  try {
    execFileSync(process.execPath, ["--version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const projectRoot = getProjectRoot();
  const hermesConfigPath = getHermesConfigPath();
  const mcpServerPath = getMcpServerBuildPath(projectRoot);
  const skillsDirectory = getSkillsDirectory(projectRoot);
  const toolWorkspace = getDefaultToolWorkspace();
  const packageInfo = await detectPackage(projectRoot);
  const { config, exists } = await readHermesConfig(hermesConfigPath);

  const mcpRegistration = config.mcp_servers?.[packageInfo.safeProjectId];
  const skillRegistered = config.skills?.external_dirs?.includes(skillsDirectory) ?? false;

  const checks: CheckResult[] = [
    { level: "OK", message: `package detected: ${packageInfo.packageName} (${packageInfo.source})` },
    fs.existsSync(mcpServerPath)
      ? { level: "OK", message: `MCP build exists: ${mcpServerPath}` }
      : { level: "FAIL", message: `MCP build missing: ${mcpServerPath}` },
    fs.existsSync(skillsDirectory)
      ? { level: "OK", message: `skills directory exists: ${skillsDirectory}` }
      : { level: "FAIL", message: `skills directory missing: ${skillsDirectory}` },
    exists
      ? { level: "OK", message: `Hermes config exists: ${hermesConfigPath}` }
      : { level: "WARN", message: `Hermes config not found: ${hermesConfigPath}` },
    mcpRegistration
      ? { level: "OK", message: `MCP server registered: ${packageInfo.safeProjectId}` }
      : { level: "FAIL", message: `MCP server not registered: ${packageInfo.safeProjectId}` },
    skillRegistered
      ? { level: "OK", message: `skills path registered: ${skillsDirectory}` }
      : { level: "FAIL", message: `skills path not registered: ${skillsDirectory}` },
    canRunNode()
      ? { level: "OK", message: `node executable available: ${process.execPath}` }
      : { level: "FAIL", message: "node executable is not available" },
    hasGitRemote(projectRoot)
      ? { level: "OK", message: "git remote detected" }
      : { level: "WARN", message: "git remote not detected" },
    { level: "OK", message: `tool workspace: ${toolWorkspace}` },
  ];

  checks.forEach(printCheck);

  if (checks.some((check) => check.level === "FAIL")) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown doctor error";
  process.stderr.write(`[FAIL] ${message}\n`);
  process.exitCode = 1;
});
