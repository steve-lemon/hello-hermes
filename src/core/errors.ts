import type { ErrorCode, ToolError } from "./types.js";

export class ToolErrorException extends Error {
  public readonly toolError: ToolError;

  public constructor(toolError: ToolError) {
    super(toolError.message);
    this.name = "ToolErrorException";
    this.toolError = toolError;
  }
}

export function createToolError(
  code: ErrorCode,
  message: string,
  retryable = false,
  details: Record<string, unknown> = {}
): ToolError {
  return {
    code,
    message,
    retryable,
    details
  };
}

export function unknownToolError(error: unknown): ToolError {
  if (error instanceof ToolErrorException) {
    return error.toolError;
  }

  if (error instanceof Error) {
    return createToolError("UNKNOWN_ERROR", error.message, false, {
      name: error.name
    });
  }

  return createToolError("UNKNOWN_ERROR", "Unknown error", false, {
    value: error
  });
}
