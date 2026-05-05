import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { detectPackage } from "./utils/detectPackage.js";
import {
  backupFileIfExists,
  ensureIntegrationDirectories,
  loadHermesConfig,
  prepareHermesConfig,
  writeHermesConfig
} from "./utils/hermesConfig.js";
import { Logger } from "./utils/logger.js";
import { getRuntimePaths } from "./utils/paths.js";

const execFileAsync = promisify(execFile);

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const verbose = process.argv.includes("--verbose");
  const runtimePaths = getRuntimePaths();
  const detectedPackage = detectPackage();
  const logger = new Logger({
    projectRoot: runtimePaths.projectRoot,
    homeDir: runtimePaths.homeDir,
    verbose
  });

  if (!dryRun) {
    await execFileAsync("npm", ["run", "build"], {
      cwd: runtimePaths.projectRoot
    });
  }

  const { config: currentConfig } = await loadHermesConfig(runtimePaths.hermesConfigPath);
  const prepared = prepareHermesConfig(currentConfig, {
    detectedPackage,
    runtimePaths
  });

  const hadConfigBackup = await backupFileIfExists(runtimePaths.hermesConfigPath, prepared.backupPath, dryRun);
  await ensureIntegrationDirectories(prepared.createdDirectories, dryRun);
  await writeHermesConfig(runtimePaths.hermesConfigPath, prepared.config, dryRun);

  logger.info("Hermes update summary");
  logger.info(`- package name: ${detectedPackage.packageName}`);
  logger.info(`- safe project id: ${detectedPackage.safeProjectId}`);
  logger.info(`- config path: ${logger.maskPath(runtimePaths.hermesConfigPath)}`);
  logger.info(`- mcp server path: ${logger.maskPath(runtimePaths.distServerPath)}`);
  logger.info(`- skills path: ${logger.maskPath(runtimePaths.skillsDir)}`);
  logger.info(`- backup path: ${logger.maskPath(prepared.backupPath)}`);
  logger.info(`- config backup created: ${hadConfigBackup ? "yes" : "no existing config to back up"}`);

  if (dryRun) {
    logger.info("- mode: dry-run");
    logger.info("- mcp server block:");
    logger.info(JSON.stringify({
      [prepared.entry.key]: {
        command: prepared.entry.command,
        args: prepared.entry.args.map((value) => logger.maskPath(value)),
        env: {
          TOOL_WORKSPACE: logger.maskPath(prepared.entry.env.TOOL_WORKSPACE)
        },
        tools: prepared.entry.tools
      }
    }, null, 2));
    logger.info(`- created directories: ${prepared.createdDirectories.map((value) => logger.maskPath(value)).join(", ")}`);
    return;
  }

  logger.info("Hermes integration has been refreshed.");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown Hermes update error";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
