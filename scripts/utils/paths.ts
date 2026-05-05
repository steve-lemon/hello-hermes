import os from "node:os";
import path from "node:path";

export function getProjectRoot(): string {
  return process.cwd();
}

export function getHermesHome(): string {
  return process.env.HERMES_HOME ?? path.join(os.homedir(), ".hermes");
}

export function getHermesConfigPath(): string {
  return path.join(getHermesHome(), "config.yaml");
}

export function getSkillsDirectory(projectRoot = getProjectRoot()): string {
  return path.join(projectRoot, "skills");
}

export function getMcpServerBuildPath(projectRoot = getProjectRoot()): string {
  return path.join(projectRoot, "dist", "mcp", "server.js");
}

export function getDefaultToolWorkspace(): string {
  return process.env.TOOL_WORKSPACE ?? path.join(os.homedir(), "agent-workspace");
}
