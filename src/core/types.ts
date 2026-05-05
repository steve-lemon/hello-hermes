import type { ToolError } from "./errors";

export type JobInput = {
  jobType: "demo";
  targets: string[];
  options: Record<string, unknown>;
};

export type JobResult = {
  jobId: string;
  status: "ok" | "failed";
  summary: string;
  startedAt: string;
  finishedAt: string;
  counts: {
    total: number;
    success: number;
    failed: number;
  };
  artifacts: string[];
  errors: ToolError[];
};
