import { z } from "zod";

import { createToolError, ToolErrorException } from "./errors";
import type { JobInput } from "./types";

const demoJobSchema = z.object({
  jobType: z.literal("demo"),
  targets: z.array(z.string().url()).min(1),
  options: z.record(z.string(), z.unknown()),
});

const browserSearchJobSchema = z.object({
  jobType: z.literal("browser_search"),
  query: z.string().min(1),
  options: z
    .object({
      openBrowser: z.boolean().optional(),
      resultLimit: z.number().int().min(1).max(10).optional(),
    })
    .catchall(z.unknown())
    .default({}),
});

export const jobInputSchema = z.discriminatedUnion("jobType", [demoJobSchema, browserSearchJobSchema]);

export function validateJobInput(input: unknown): JobInput {
  const parsed = jobInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new ToolErrorException(
      createToolError("VALIDATION_ERROR", "Job input failed validation.", false, {
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      }),
    );
  }

  return parsed.data;
}
