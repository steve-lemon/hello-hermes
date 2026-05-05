import { spawn } from "node:child_process";

import { createToolError, unknownToolError } from "./errors.js";
import type {
  ToolError,
  UpdateRepoInput,
  UpdateRepoResult,
  UpdateRepoStepResult
} from "./types.js";
import { getProjectRoot } from "./workspace.js";

const ALLOWED_COMMANDS = new Set([
  "git status --short",
  "git pull",
  "npm install",
  "npm run build",
  "npm run hermes:update"
]);

const MAX_CAPTURE_LENGTH = 4000;

export interface CommandExecutionResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

export interface UpdateRepoCommandRunner {
  run(command: string, args: string[], cwd: string): Promise<CommandExecutionResult>;
}

class DefaultUpdateRepoCommandRunner implements UpdateRepoCommandRunner {
  public async run(command: string, args: string[], cwd: string): Promise<CommandExecutionResult> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd,
        stdio: ["ignore", "pipe", "pipe"]
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
          stderr: stderr.trim()
        });
      });
    });
  }
}

export function getAllowedUpdateRepoCommands(): string[] {
  return [...ALLOWED_COMMANDS];
}

export async function updateRepo(
  input: UpdateRepoInput = {},
  runner: UpdateRepoCommandRunner = new DefaultUpdateRepoCommandRunner()
): Promise<UpdateRepoResult> {
  const options = {
    allowDirty: input.allowDirty ?? false,
    runInstall: input.runInstall ?? true,
    runBuild: input.runBuild ?? true,
    runHermesUpdate: input.runHermesUpdate ?? true
  };

  const steps: UpdateRepoStepResult[] = [];
  const errors: ToolError[] = [];
  const cwd = getProjectRoot();

  try {
    const statusStep = await runAllowedStep("git status", "git", ["status", "--short"], runner, cwd);
    steps.push(statusStep);

    if (statusStep.status === "failed") {
      return failResult(
        steps,
        [createToolError("UNKNOWN_ERROR", "Failed to inspect git working tree.", false, {})],
        "Update stopped before git pull."
      );
    }

    const dirty = Boolean(statusStep.stdout);
    if (dirty && !options.allowDirty) {
      steps[steps.length - 1] = {
        ...statusStep,
        status: "failed",
        message: "Working tree has uncommitted changes."
      };

      return failResult(
        steps,
        [
          createToolError("WORKING_TREE_DIRTY", "Commit or stash local changes before updating.", false, {
            command: "git status --short"
          })
        ],
        "Update stopped before git pull."
      );
    }

    const pullStep = await runAllowedStep("git pull", "git", ["pull"], runner, cwd);
    steps.push(pullStep);
    if (pullStep.status === "failed") {
      return failResult(steps, stepErrors("git pull", pullStep), "Update failed during git pull.");
    }

    if (options.runInstall) {
      const installStep = await runAllowedStep("npm install", "npm", ["install"], runner, cwd);
      steps.push(installStep);
      if (installStep.status === "failed") {
        return failResult(steps, stepErrors("npm install", installStep), "Update failed during dependency install.");
      }
    } else {
      steps.push(skippedStep("npm install", "runInstall=false"));
    }

    if (options.runBuild) {
      const buildStep = await runAllowedStep("npm run build", "npm", ["run", "build"], runner, cwd);
      steps.push(buildStep);
      if (buildStep.status === "failed") {
        return failResult(steps, stepErrors("npm run build", buildStep), "Update failed during build.");
      }
    } else {
      steps.push(skippedStep("npm run build", "runBuild=false"));
    }

    if (options.runHermesUpdate) {
      const hermesUpdateStep = await runAllowedStep(
        "npm run hermes:update",
        "npm",
        ["run", "hermes:update"],
        runner,
        cwd
      );
      steps.push(hermesUpdateStep);
      if (hermesUpdateStep.status === "failed") {
        return failResult(
          steps,
          stepErrors("npm run hermes:update", hermesUpdateStep),
          "Update failed while refreshing Hermes integration."
        );
      }
    } else {
      steps.push(skippedStep("npm run hermes:update", "runHermesUpdate=false"));
    }

    return {
      status: "ok",
      steps,
      summary: "Repository updated and Hermes config refreshed.",
      errors
    };
  } catch (error) {
    return failResult(steps, [unknownToolError(error)], "Update stopped because of an unexpected error.");
  }
}

async function runAllowedStep(
  stepName: string,
  command: string,
  args: string[],
  runner: UpdateRepoCommandRunner,
  cwd: string
): Promise<UpdateRepoStepResult> {
  assertAllowedCommand(command, args);
  const result = await runner.run(command, args, cwd);

  return {
    name: stepName,
    status: result.exitCode === 0 ? "ok" : "failed",
    exitCode: result.exitCode,
    stdout: result.stdout || undefined,
    stderr: result.stderr || undefined,
    message: result.exitCode === 0 ? undefined : `${stepName} exited with code ${result.exitCode}.`
  };
}

function assertAllowedCommand(command: string, args: string[]): void {
  const key = [command, ...args].join(" ");
  if (!ALLOWED_COMMANDS.has(key)) {
    throw new Error(`Command not allowed: ${key}`);
  }
}

function truncateOutput(output: string): string {
  return output.length <= MAX_CAPTURE_LENGTH ? output : output.slice(-MAX_CAPTURE_LENGTH);
}

function skippedStep(name: string, reason: string): UpdateRepoStepResult {
  return {
    name,
    status: "skipped",
    message: reason
  };
}

function stepErrors(command: string, step: UpdateRepoStepResult): ToolError[] {
  return [
    createToolError("UNKNOWN_ERROR", `${command} failed.`, true, {
      exitCode: step.exitCode,
      stdout: step.stdout,
      stderr: step.stderr
    })
  ];
}

function failResult(steps: UpdateRepoStepResult[], errors: ToolError[], summary: string): UpdateRepoResult {
  return {
    status: "failed",
    steps,
    summary,
    errors
  };
}
