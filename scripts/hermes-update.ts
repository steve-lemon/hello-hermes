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

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const projectRoot = getProjectRoot();
  const hermesConfigPath = getHermesConfigPath();
  const mcpServerPath = getMcpServerBuildPath(projectRoot);
  const skillsDirectory = getSkillsDirectory(projectRoot);
  const toolWorkspace = getDefaultToolWorkspace();
  const packageInfo = await detectPackage(projectRoot);

  await execFileAsync("npm", ["run", "build"], { cwd: projectRoot });

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
        action: dryRun ? "hermes:update:dry-run" : "hermes:update",
        packageName: packageInfo.packageName,
        safeProjectId: packageInfo.safeProjectId,
        source: packageInfo.source,
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
  const message = error instanceof Error ? error.message : "Unknown update error";
  process.stderr.write(
    `${JSON.stringify(
      {
        code: "HERMES_UPDATE_FAILED",
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
