import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const moduleDirectory = path.dirname(currentFile);

function findProjectRoot(startDirectory: string): string {
  let currentDirectory = startDirectory;

  while (true) {
    if (fs.existsSync(path.join(currentDirectory, "package.json"))) {
      return currentDirectory;
    }

    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      return process.cwd();
    }

    currentDirectory = parentDirectory;
  }
}

const projectRoot = findProjectRoot(moduleDirectory);

export function getProjectRoot(): string {
  return projectRoot;
}

export function getWorkspaceRoot(): string {
  return process.env.TOOL_WORKSPACE ?? projectRoot;
}

export function toWorkspaceRelativePath(targetPath: string): string {
  return path.relative(getWorkspaceRoot(), targetPath).replaceAll(path.sep, "/");
}

export function maskPath(inputPath: string, placeholder: string): string {
  const normalizedProjectRoot = projectRoot.replaceAll(path.sep, "/");
  const normalizedInputPath = inputPath.replaceAll(path.sep, "/");

  if (normalizedInputPath.startsWith(normalizedProjectRoot)) {
    const relativePath = path.relative(projectRoot, inputPath).replaceAll(path.sep, "/");
    return relativePath.length > 0 ? `${placeholder}/${relativePath}` : placeholder;
  }

  return placeholder;
}
