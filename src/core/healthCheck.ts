import fs from "node:fs";
import path from "node:path";

import type { HealthCheckResult } from "./types.js";
import { getProjectRoot, getWorkspaceRoot, maskPath } from "./workspace.js";

function readPackageMetadata(): { name: string; version: string } {
  const packageJsonPath = path.join(getProjectRoot(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
    name?: string;
    version?: string;
  };

  return {
    name: packageJson.name ?? "unknown-package",
    version: packageJson.version ?? "0.0.0"
  };
}

export function healthCheck(): HealthCheckResult {
  const packageMetadata = readPackageMetadata();

  return {
    status: "ok",
    nodeVersion: process.version,
    cwd: maskPath(process.cwd(), "<PROJECT_ROOT>"),
    packageName: packageMetadata.name,
    packageVersion: packageMetadata.version,
    timestamp: new Date().toISOString(),
    toolWorkspace: maskPath(getWorkspaceRoot(), "<TOOL_WORKSPACE>")
  };
}
