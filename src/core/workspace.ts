import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const moduleDir = path.dirname(currentFile);

function findProjectRoot(startDir: string): string {
  let currentDir = startDir;

  while (true) {
    if (fs.existsSync(path.join(currentDir, "package.json"))) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return process.cwd();
    }

    currentDir = parentDir;
  }
}

const projectRoot = findProjectRoot(moduleDir);

export function getProjectRoot(): string {
  return projectRoot;
}

export function getWorkspaceRoot(): string {
  return process.env.TOOL_WORKSPACE ?? projectRoot;
}

export function toProjectRelativePath(targetPath: string): string {
  return path.relative(projectRoot, targetPath).replaceAll(path.sep, "/");
}

export function toWorkspaceRelativePath(targetPath: string): string {
  return path.relative(getWorkspaceRoot(), targetPath).replaceAll(path.sep, "/");
}

export function maskPath(inputPath: string, placeholder: string): string {
  if (!inputPath) {
    return placeholder;
  }

  const normalizedProjectRoot = projectRoot.replaceAll(path.sep, "/");
  const normalizedInput = inputPath.replaceAll(path.sep, "/");

  if (normalizedInput.startsWith(normalizedProjectRoot)) {
    const relative = path.relative(projectRoot, inputPath).replaceAll(path.sep, "/");
    return relative ? `${placeholder}/${relative}` : placeholder;
  }

  return placeholder;
}
