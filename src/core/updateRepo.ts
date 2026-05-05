import { spawn } from "node:child_process";

import { createToolError } from "./errors";
import { healthCheck } from "./healthCheck";
import { getProjectRoot } from "./workspace";

export type UpdateRepoInput = {
  allowDirty?: boolean;
  runInstall?: boolean;
  runBuild?: boolean;
  runHermesUpdate?: boolean;
};

export type UpdateRepoStep = {
  command: string;
  status: "ok" | "failed" | "skipped";
  message: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
};

export type UpdateRepoResult = {
  status: "ok" | "failed";
  summary: string;
  steps: UpdateRepoStep[];
  errors: Array<ReturnType<typeof createToolError>>;
  health?: ReturnType<typeof healthCheck>;
};

export type CommandRunner = {
  run(command: string, args: string[], cwd: string): Promise<{
    exitCode: number | null;
    stdout: string;
    stderr: string;
  }>;
};

const MAX_CAPTURE_LENGTH = 4000;

export class DefaultUpdateRepoCommandRunner implements CommandRunner {
  async run(command: string, args: string[], cwd: string) {
    return new Promise<{ exitCode: number | null; stdout: string; stderr: string }>((resolve, reject) => {
      const child = spawn(command, args, {
        cwd,
        stdio: ["ignore", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk) => {
        stdout = truncateOutput(stdout + String(chunk));
      });

      child.stderr.on("data", (chunk) => {
        stderr = truncateOutput(stderr + String(chunk));
      });

      child.on("error", reject);
      child.on("close", (exitCode) => {
        resolve({
          exitCode,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        });
      });
    });
  }
}

export async function updateRepo(
  input: UpdateRepoInput = {},
  runner: CommandRunner = new DefaultUpdateRepoCommandRunner(),
): Promise<UpdateRepoResult> {
  const options = {
    allowDirty: input.allowDirty ?? false,
    runInstall: input.runInstall ?? true,
    runBuild: input.runBuild ?? true,
    runHermesUpdate: input.runHermesUpdate ?? true,
  };

  const cwd = getProjectRoot();
  const steps: UpdateRepoStep[] = [];

  const statusStep = await runStep("git status --short", "git", ["status", "--short"], runner, cwd);
  steps.push(statusStep);
  if (statusStep.status === "failed") {
    return failResult(steps, [createToolError("GIT_STATUS_FAILED", "Failed to inspect git working tree.", false, {})], "Update stopped before git pull.");
  }

  const dirty = statusStep.stdout.length > 0;
  if (dirty && !options.allowDirty) {
    steps[steps.length - 1] = {
      ...statusStep,
      status: "failed",
      message: "Working tree has uncommitted changes.",
    };
    return failResult(
      steps,
      [createToolError("WORKING_TREE_DIRTY", "Commit or stash local changes before updating.", false, { command: "git status --short" })],
      "Update stopped before git pull.",
    );
  }

  const pullStep = await runStep("git pull", "git", ["pull"], runner, cwd);
  steps.push(pullStep);
  if (pullStep.status === "failed") {
    return failResult(steps, [stepError("git pull", pullStep)], "Update failed during git pull.");
  }

  if (options.runInstall) {
    const installStep = await runStep("npm install", "npm", ["install"], runner, cwd);
    steps.push(installStep);
    if (installStep.status === "failed") {
      return failResult(steps, [stepError("npm install", installStep)], "Update failed during dependency install.");
    }
  } else {
    steps.push(skippedStep("npm install", "runInstall=false"));
  }

  if (options.runBuild) {
    const buildStep = await runStep("npm run build", "npm", ["run", "build"], runner, cwd);
    steps.push(buildStep);
    if (buildStep.status === "failed") {
      return failResult(steps, [stepError("npm run build", buildStep)], "Update failed during build.");
    }
  } else {
    steps.push(skippedStep("npm run build", "runBuild=false"));
  }

  if (options.runHermesUpdate) {
    const hermesUpdateStep = await runStep("npm run hermes:update", "npm", ["run", "hermes:update"], runner, cwd);
    steps.push(hermesUpdateStep);
    if (hermesUpdateStep.status === "failed") {
      return failResult(steps, [stepError("npm run hermes:update", hermesUpdateStep)], "Update failed during Hermes integration refresh.");
    }
  } else {
    steps.push(skippedStep("npm run hermes:update", "runHermesUpdate=false"));
  }

  return {
    status: "ok",
    summary: "Repository update completed and health check is available.",
    steps,
    errors: [],
    health: healthCheck(),
  };
}

async function runStep(
  label: string,
  command: string,
  args: string[],
  runner: CommandRunner,
  cwd: string,
): Promise<UpdateRepoStep> {
  const result = await runner.run(command, args, cwd);

  return {
    command: label,
    status: result.exitCode === 0 ? "ok" : "failed",
    message: result.exitCode === 0 ? "Command completed." : "Command failed.",
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
  };
}

function skippedStep(command: string, reason: string): UpdateRepoStep {
  return {
    command,
    status: "skipped",
    message: `Skipped because ${reason}.`,
    stdout: "",
    stderr: "",
    exitCode: null,
  };
}

function stepError(command: string, step: UpdateRepoStep) {
  return createToolError("COMMAND_FAILED", `${command} failed.`, false, {
    command,
    stdout: step.stdout,
    stderr: step.stderr,
    exitCode: step.exitCode,
  });
}

function failResult(
  steps: UpdateRepoStep[],
  errors: Array<ReturnType<typeof createToolError>>,
  summary: string,
): UpdateRepoResult {
  return {
    status: "failed",
    summary,
    steps,
    errors,
  };
}

function truncateOutput(value: string): string {
  return value.length > MAX_CAPTURE_LENGTH ? value.slice(-MAX_CAPTURE_LENGTH) : value;
}
