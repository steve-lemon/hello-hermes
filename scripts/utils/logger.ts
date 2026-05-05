import { maskHomePath, maskProjectPath } from "./paths.js";

export interface LoggerOptions {
  projectRoot: string;
  homeDir: string;
  verbose?: boolean;
}

export class Logger {
  public constructor(private readonly options: LoggerOptions) {}

  public info(message: string): void {
    process.stdout.write(`${message}\n`);
  }

  public warn(message: string): void {
    process.stdout.write(`[WARN] ${message}\n`);
  }

  public error(message: string): void {
    process.stderr.write(`[FAIL] ${message}\n`);
  }

  public maskPath(value: string): string {
    if (this.options.verbose) {
      return value;
    }

    const maskedProject = maskProjectPath(value, this.options.projectRoot);
    if (maskedProject !== value) {
      return maskedProject;
    }

    return maskHomePath(value, this.options.homeDir);
  }
}
