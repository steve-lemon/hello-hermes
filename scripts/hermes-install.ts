import fs from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { detectPackage } from "./utils/detectPackage";
import {
  backupHermesConfig,
  ensureHermesDirectory,
  readHermesConfig,
  syncHermesConfig,
  writeHermesConfig,
} from "./utils/hermesConfig";
import { getDefaultToolWorkspace, getHermesConfigPath, getMcpServerBuildPath, getProjectRoot, getSkillsDirectory } from "./utils/paths";

const execFileAsync = promisify(execFile);

async function ensureBuild(projectRoot: string, mcpServerPath: string): Promise<{ built: boolean }> {
  if (fs.existsSync(mcpServerPath)) {
    return { built: false };
  }

  await execFileAsync("npm", ["run", "build"], { cwd: projectRoot });
  return { built: true };
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const projectRoot = getProjectRoot();
  const hermesConfigPath = getHermesConfigPath();
  const mcpServerPath = getMcpServerBuildPath(projectRoot);
  const skillsDirectory = getSkillsDirectory(projectRoot);
  const toolWorkspace = getDefaultToolWorkspace();
  const packageInfo = await detectPackage(projectRoot);

  const buildResult = await ensureBuild(projectRoot, mcpServerPath);
  const { config, exists } = await readHermesConfig(hermesConfigPath);
  const nextConfig = syncHermesConfig({
    config,
    projectId: packageInfo.safeProjectId,
    mcpServerPath,
    skillsDirectory,
    toolWorkspace,
  });

  let backupPath: string | undefined;
  if (!dryRun) {
    await ensureHermesDirectory(hermesConfigPath);
    backupPath = await backupHermesConfig(hermesConfigPath);
    await writeHermesConfig(hermesConfigPath, nextConfig);
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        status: "ok",
        action: dryRun ? "hermes:install:dry-run" : "hermes:install",
        packageName: packageInfo.packageName,
        safeProjectId: packageInfo.safeProjectId,
        source: packageInfo.source,
        projectRoot,
        built: buildResult.built,
        hermesConfigExisted: exists,
        hermesConfigPath,
        backupPath: backupPath ?? null,
        mcpServerPath,
        skillsDirectory,
        toolWorkspace,
      },
      null,
      2,
    )}\n`,
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown install error";
  process.stderr.write(
    `${JSON.stringify(
      {
        code: "HERMES_INSTALL_FAILED",
        message,
        retryable: false,
        details: {},
      },
      null,
      2,
    )}\n`,
  );
  process.exitCode = 1;
});
