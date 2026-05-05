export type ToolError = {
  code: string;
  message: string;
  retryable: boolean;
  details: Record<string, unknown>;
};

export class ToolErrorException extends Error {
  readonly toolError: ToolError;

  constructor(toolError: ToolError) {
    super(toolError.message);
    this.name = "ToolErrorException";
    this.toolError = toolError;
  }
}

export function createToolError(
  code: string,
  message: string,
  retryable = false,
  details: Record<string, unknown> = {},
): ToolError {
  return {
    code,
    message,
    retryable,
    details,
  };
}

export function unknownToolError(error: unknown): ToolError {
  if (error instanceof ToolErrorException) {
    return error.toolError;
  }

  if (error instanceof Error) {
    return createToolError("UNKNOWN_ERROR", error.message, false, {
      name: error.name,
    });
  }

  return createToolError("UNKNOWN_ERROR", "Unknown error", false, {
    value: error,
  });
}
