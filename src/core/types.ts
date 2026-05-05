export const ERROR_CODES = [
  "AUTH_REQUIRED",
  "CAPTCHA_BLOCKED",
  "RATE_LIMITED",
  "SELECTOR_CHANGED",
  "VALIDATION_ERROR",
  "DESTRUCTIVE_ACTION_BLOCKED",
  "WORKING_TREE_DIRTY",
  "COMMAND_NOT_ALLOWED",
  "UNKNOWN_ERROR"
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];
export type JobStatus = "ok" | "partial" | "failed";

export interface ToolError {
  code: ErrorCode;
  message: string;
  retryable: boolean;
  details: Record<string, unknown>;
}

export interface JobInput {
  jobType: "demo";
  targets: string[];
  options: Record<string, unknown>;
}

export interface JobCounts {
  total: number;
  success: number;
  failed: number;
}

export interface JobResult {
  jobId: string;
  status: JobStatus;
  summary: string;
  startedAt: string;
  finishedAt: string;
  counts: JobCounts;
  artifacts: string[];
  errors: ToolError[];
}

export interface HealthCheckResult {
  status: "ok";
  nodeVersion: string;
  cwd: string;
  packageName: string;
  packageVersion: string;
  timestamp: string;
  toolWorkspace: string;
}

export interface InspectResultFound {
  jobId: string;
  found: true;
  artifactPath: string;
  result: JobResult;
}

export interface InspectResultMissing {
  jobId: string;
  found: false;
  artifactPath: string;
  error: ToolError;
}

export type InspectResult = InspectResultFound | InspectResultMissing;

export interface UpdateRepoInput {
  allowDirty?: boolean;
  runInstall?: boolean;
  runBuild?: boolean;
  runHermesUpdate?: boolean;
}

export interface UpdateRepoStepResult {
  name: string;
  status: "ok" | "failed" | "skipped";
  message?: string;
  exitCode?: number | null;
  stdout?: string;
  stderr?: string;
}

export interface UpdateRepoResult {
  status: "ok" | "failed";
  steps: UpdateRepoStepResult[];
  summary: string;
  errors: ToolError[];
}
