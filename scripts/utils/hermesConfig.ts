import fs from "node:fs/promises";
import path from "node:path";

import YAML from "yaml";

import type { DetectedPackage } from "./detectPackage.js";
import type { RuntimePaths } from "./paths.js";

const REQUIRED_TOOLS = ["health_check", "run_job", "inspect_result", "update_repo"] as const;

export interface HermesConfigDocument {
  mcp_servers?: Record<string, unknown>;
  skills?: {
    external_dirs?: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface HermesIntegrationEntry {
  key: string;
  command: "node";
  args: string[];
  env: {
    TOOL_WORKSPACE: string;
  };
  tools: {
    include: string[];
  };
}

export interface PrepareHermesConfigOptions {
  detectedPackage: DetectedPackage;
  runtimePaths: RuntimePaths;
}

export interface PrepareHermesConfigResult {
  config: HermesConfigDocument;
  entry: HermesIntegrationEntry;
  createdConfig: boolean;
  backupPath: string;
  createdDirectories: string[];
}

export async function loadHermesConfig(configPath: string): Promise<{ config: HermesConfigDocument; created: boolean }> {
  try {
    const content = await fs.readFile(configPath, "utf8");
    const parsed = YAML.parse(content) as HermesConfigDocument | null;
    return {
      config: parsed ?? {},
      created: false
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {
        config: {},
        created: true
      };
    }

    throw error;
  }
}

export function prepareHermesConfig(
  currentConfig: HermesConfigDocument,
  options: PrepareHermesConfigOptions
): PrepareHermesConfigResult {
  const { detectedPackage, runtimePaths } = options;
  const entry = buildIntegrationEntry(detectedPackage, runtimePaths);
  const config = structuredClone(currentConfig);

  const mcpServers = isRecord(config.mcp_servers) ? { ...config.mcp_servers } : {};
  mcpServers[detectedPackage.safeProjectId] = {
    command: entry.command,
    args: [...entry.args],
    env: { ...entry.env },
    tools: {
      include: [...entry.tools.include]
    }
  };
  config.mcp_servers = mcpServers;

  const skills = isRecord(config.skills) ? { ...config.skills } : {};
  const externalDirs = Array.isArray(skills.external_dirs)
    ? skills.external_dirs.filter((item): item is string => typeof item === "string")
    : [];

  if (!externalDirs.includes(runtimePaths.skillsDir)) {
    externalDirs.push(runtimePaths.skillsDir);
  }

  skills.external_dirs = externalDirs;
  config.skills = skills;

  return {
    config,
    entry,
    createdConfig: !Object.keys(currentConfig).length,
    backupPath: createBackupPath(runtimePaths.hermesConfigPath),
    createdDirectories: [runtimePaths.artifactsDir, runtimePaths.incidentsDir]
  };
}

export async function ensureBuildOutput(distServerPath: string, runBuild?: () => Promise<void>): Promise<boolean> {
  try {
    await fs.access(distServerPath);
    return false;
  } catch {
    if (!runBuild) {
      throw new Error("Missing build output and no build callback was provided.");
    }

    await runBuild();
    return true;
  }
}

export async function backupFileIfExists(filePath: string, backupPath: string, dryRun: boolean): Promise<boolean> {
  try {
    await fs.access(filePath);
  } catch {
    return false;
  }

  if (!dryRun) {
    await fs.copyFile(filePath, backupPath);
  }

  return true;
}

export async function writeHermesConfig(configPath: string, config: HermesConfigDocument, dryRun: boolean): Promise<void> {
  if (dryRun) {
    return;
  }

  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, `${YAML.stringify(config)}`, "utf8");
}

export async function ensureIntegrationDirectories(pathsToCreate: string[], dryRun: boolean): Promise<void> {
  if (dryRun) {
    return;
  }

  await Promise.all(pathsToCreate.map((targetPath) => fs.mkdir(targetPath, { recursive: true })));
}

export function buildIntegrationEntry(
  detectedPackage: DetectedPackage,
  runtimePaths: RuntimePaths
): HermesIntegrationEntry {
  return {
    key: detectedPackage.safeProjectId,
    command: "node",
    args: [runtimePaths.distServerPath],
    env: {
      TOOL_WORKSPACE: runtimePaths.defaultToolWorkspace
    },
    tools: {
      include: [...REQUIRED_TOOLS]
    }
  };
}

export function getRequiredHermesTools(): string[] {
  return [...REQUIRED_TOOLS];
}

export function createBackupPath(configPath: string, now = new Date()): string {
  const stamp = [
    now.getFullYear().toString().padStart(4, "0"),
    (now.getMonth() + 1).toString().padStart(2, "0"),
    now.getDate().toString().padStart(2, "0")
  ].join("") + "-" + [
    now.getHours().toString().padStart(2, "0"),
    now.getMinutes().toString().padStart(2, "0"),
    now.getSeconds().toString().padStart(2, "0")
  ].join("");

  return `${configPath}.backup-${stamp}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
