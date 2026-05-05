import { z } from "zod";

import { ToolErrorException, createToolError } from "./errors.js";
import type { JobInput } from "./types.js";

const jobInputSchema = z.object({
  jobType: z.literal("demo"),
  targets: z.array(z.string().url()).min(1),
  options: z.record(z.string(), z.unknown())
});

export function validateJobInput(input: unknown): JobInput {
  const parsed = jobInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new ToolErrorException(
      createToolError("VALIDATION_ERROR", "Job input failed validation.", false, {
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      })
    );
  }

  return parsed.data;
}
