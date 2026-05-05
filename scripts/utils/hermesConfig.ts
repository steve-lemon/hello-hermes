import fs from "node:fs/promises";
import path from "node:path";

import { dump, load } from "js-yaml";

export type HermesMcpServerConfig = {
  command: string;
  args: string[];
  env?: Record<string, string>;
  tools?: {
    include?: string[];
  };
};

export type HermesConfig = {
  mcp_servers?: Record<string, HermesMcpServerConfig>;
  skills?: {
    external_dirs?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type HermesConfigSyncInput = {
  config: HermesConfig;
  projectId: string;
  mcpServerPath: string;
  skillsDirectory: string;
  toolWorkspace: string;
};

export function createDefaultHermesConfig(): HermesConfig {
  return {
    mcp_servers: {},
    skills: {
      external_dirs: [],
    },
  };
}

export async function readHermesConfig(configPath: string): Promise<{ config: HermesConfig; exists: boolean }> {
  try {
    const raw = await fs.readFile(configPath, "utf8");
    const parsed = load(raw);
    return {
      config: isHermesConfig(parsed) ? parsed : createDefaultHermesConfig(),
      exists: true,
    };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return {
        config: createDefaultHermesConfig(),
        exists: false,
      };
    }

    throw error;
  }
}

export async function ensureHermesDirectory(configPath: string): Promise<void> {
  await fs.mkdir(path.dirname(configPath), { recursive: true });
}

export async function backupHermesConfig(configPath: string): Promise<string | undefined> {
  try {
    const timestamp = new Date().toISOString().replaceAll(/[-:]/g, "").replace(".", "").slice(0, 15);
    const backupPath = `${configPath}.backup-${timestamp}`;
    await fs.copyFile(configPath, backupPath);
    return backupPath;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}

export function syncHermesConfig(input: HermesConfigSyncInput): HermesConfig {
  const nextConfig: HermesConfig = {
    ...input.config,
    mcp_servers: { ...(input.config.mcp_servers ?? {}) },
    skills: {
      ...(input.config.skills ?? {}),
      external_dirs: [...(input.config.skills?.external_dirs ?? [])],
    },
  };

  nextConfig.mcp_servers![input.projectId] = {
    command: "node",
    args: [input.mcpServerPath],
    env: {
      TOOL_WORKSPACE: input.toolWorkspace,
    },
    tools: {
      include: ["health_check", "run_job", "inspect_result", "update_repo"],
    },
  };

  const externalDirs = nextConfig.skills!.external_dirs!;
  if (!externalDirs.includes(input.skillsDirectory)) {
    externalDirs.push(input.skillsDirectory);
  }

  return nextConfig;
}

export async function writeHermesConfig(configPath: string, config: HermesConfig): Promise<void> {
  const yaml = dump(config, {
    lineWidth: 120,
    noRefs: true,
  });
  await fs.writeFile(configPath, yaml, "utf8");
}

function isHermesConfig(value: unknown): value is HermesConfig {
  return typeof value === "object" && value !== null;
}
