import type { ToolError } from "./errors";

export type DemoJobInput = {
  jobType: "demo";
  targets: string[];
  options: Record<string, unknown>;
};

export type BrowserSearchJobInput = {
  jobType: "browser_search";
  query: string;
  options: {
    openBrowser?: boolean;
    resultLimit?: number;
    [key: string]: unknown;
  };
};

export type JobInput = DemoJobInput | BrowserSearchJobInput;

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
  details?: Record<string, unknown>;
};
