import fs from "node:fs";
import path from "node:path";

import { getRuntimePaths } from "./paths.js";

export interface DetectedPackage {
  packageName: string;
  safeProjectId: string;
}

export function detectPackage(): DetectedPackage {
  const { projectRoot } = getRuntimePaths();
  const packageJsonPath = path.join(projectRoot, "package.json");

  if (fs.existsSync(packageJsonPath)) {
    const parsed = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as { name?: string };
    if (parsed.name) {
      return {
        packageName: parsed.name,
        safeProjectId: toSafeProjectId(parsed.name)
      };
    }
  }

  const remote = readGitRemoteOrigin(projectRoot);
  if (remote) {
    return {
      packageName: normalizePackageName(remote),
      safeProjectId: toSafeProjectId(remote)
    };
  }

  const folderName = path.basename(projectRoot);
  return {
    packageName: normalizePackageName(folderName),
    safeProjectId: toSafeProjectId(folderName)
  };
}

export function toSafeProjectId(input: string): string {
  return input
    .toLowerCase()
    .replace(/^@/, "")
    .replaceAll(/[/-]+/g, "_")
    .replaceAll(/[^a-z0-9_]+/g, "_")
    .replaceAll(/_+/g, "_")
    .replaceAll(/^_+|_+$/g, "");
}

function normalizePackageName(input: string): string {
  return input
    .toLowerCase()
    .replaceAll(/\s+/g, "-")
    .replaceAll(/[^a-z0-9/@._-]+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

function readGitRemoteOrigin(projectRoot: string): string | undefined {
  try {
    const configPath = path.join(projectRoot, ".git", "config");
    if (!fs.existsSync(configPath)) {
      return undefined;
    }

    const config = fs.readFileSync(configPath, "utf8");
    const match = config.match(/\[remote "origin"\][\s\S]*?url = (.+)/);
    if (!match?.[1]) {
      return undefined;
    }

    return extractRepoName(match[1].trim());
  } catch {
    return undefined;
  }
}

function extractRepoName(remoteUrl: string): string {
  const cleaned = remoteUrl.replace(/\.git$/, "");
  const parts = cleaned.split(/[:/]/);
  return parts[parts.length - 1] ?? cleaned;
}
