import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export interface RuntimePaths {
  projectRoot: string;
  distServerPath: string;
  skillsDir: string;
  artifactsDir: string;
  incidentsDir: string;
  homeDir: string;
  hermesDir: string;
  hermesConfigPath: string;
  defaultToolWorkspace: string;
}

export function findProjectRoot(startDir = process.cwd()): string {
  let currentDir = path.resolve(startDir);

  while (true) {
    if (fs.existsSync(path.join(currentDir, "package.json"))) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return path.resolve(startDir);
    }

    currentDir = parentDir;
  }
}

export function getRuntimePaths(): RuntimePaths {
  const projectRoot = findProjectRoot();
  const homeDir = process.env.HOME ?? os.homedir();
  const hermesDir = process.env.HERMES_CONFIG_DIR
    ? path.resolve(process.env.HERMES_CONFIG_DIR)
    : path.join(homeDir, ".hermes");

  return {
    projectRoot,
    distServerPath: path.join(projectRoot, "dist", "mcp", "server.js"),
    skillsDir: path.join(projectRoot, "skills"),
    artifactsDir: path.join(projectRoot, "artifacts"),
    incidentsDir: path.join(projectRoot, "incidents"),
    homeDir,
    hermesDir,
    hermesConfigPath: path.join(hermesDir, "config.yaml"),
    defaultToolWorkspace: path.join(homeDir, "agent-workspace")
  };
}

export function maskProjectPath(inputPath: string, projectRoot: string): string {
  if (!path.isAbsolute(inputPath)) {
    return inputPath;
  }

  const normalizedInput = path.normalize(inputPath);
  const normalizedRoot = path.normalize(projectRoot);

  if (normalizedInput === normalizedRoot) {
    return "<PROJECT_ROOT>";
  }

  if (normalizedInput.startsWith(`${normalizedRoot}${path.sep}`)) {
    return `<PROJECT_ROOT>/${path.relative(normalizedRoot, normalizedInput).replaceAll(path.sep, "/")}`;
  }

  return inputPath;
}

export function maskHomePath(inputPath: string, homeDir: string): string {
  if (!path.isAbsolute(inputPath)) {
    return inputPath;
  }

  const normalizedInput = path.normalize(inputPath);
  const normalizedHome = path.normalize(homeDir);

  if (normalizedInput === normalizedHome) {
    return "~";
  }

  if (normalizedInput.startsWith(`${normalizedHome}${path.sep}`)) {
    return `~/${path.relative(normalizedHome, normalizedInput).replaceAll(path.sep, "/")}`;
  }

  return inputPath;
}
