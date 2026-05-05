import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { getProjectRoot } from "./paths";

const execFileAsync = promisify(execFile);

export type PackageDetection = {
  packageName: string;
  source: "package.json" | "git-remote" | "folder";
  safeProjectId: string;
};

function normalizePackageName(rawName: string): string {
  return rawName.trim();
}

function createSafeProjectId(rawName: string): string {
  return rawName
    .toLowerCase()
    .replace(/^@/, "")
    .replaceAll(/[\/-]+/g, "_")
    .replaceAll(/[^a-z0-9_]+/g, "_")
    .replaceAll(/_+/g, "_")
    .replace(/^_+|_+$/g, "") || "tool";
}

function tryReadPackageName(projectRoot: string): string | undefined {
  const packageJsonPath = path.join(projectRoot, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return undefined;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as { name?: string };
  return packageJson.name ? normalizePackageName(packageJson.name) : undefined;
}

function extractRepoName(remoteUrl: string): string | undefined {
  const normalized = remoteUrl.trim().replace(/\.git$/, "");
  const match = normalized.match(/[:/]([^/]+\/[^/]+)$/);
  if (!match) {
    return undefined;
  }

  const [, ownerAndRepo] = match;
  const repoName = ownerAndRepo.split("/")[1];
  return repoName ? normalizePackageName(repoName) : undefined;
}

async function tryReadGitRemoteName(projectRoot: string): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync("git", ["remote", "get-url", "origin"], {
      cwd: projectRoot,
    });
    return extractRepoName(stdout);
  } catch {
    return undefined;
  }
}

export async function detectPackage(projectRoot = getProjectRoot()): Promise<PackageDetection> {
  const packageName = tryReadPackageName(projectRoot);
  if (packageName) {
    return {
      packageName,
      source: "package.json",
      safeProjectId: createSafeProjectId(packageName),
    };
  }

  const remotePackageName = await tryReadGitRemoteName(projectRoot);
  if (remotePackageName) {
    return {
      packageName: remotePackageName,
      source: "git-remote",
      safeProjectId: createSafeProjectId(remotePackageName),
    };
  }

  const folderName = path.basename(projectRoot);
  return {
    packageName: normalizePackageName(folderName),
    source: "folder",
    safeProjectId: createSafeProjectId(folderName),
  };
}
