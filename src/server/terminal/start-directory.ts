import fs from "node:fs";
import os from "node:os";

export function resolveHomeDirectory(env: NodeJS.ProcessEnv = process.env): string {
  return env.USERPROFILE ?? env.HOME ?? os.homedir() ?? process.cwd();
}

export function isExistingDirectory(candidate: string): boolean {
  try {
    return fs.statSync(candidate).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Picks the directory a new shell starts in: the configured start directory
 * when it names an existing directory, otherwise the running account's home.
 * Evaluated at each spawn so a directory created after startup is honored.
 */
export function resolveStartDirectory(options: {
  configured: string | undefined;
  fallback: string;
  isDirectory?: (candidate: string) => boolean;
}): string {
  const isDirectory = options.isDirectory ?? isExistingDirectory;
  if (options.configured && isDirectory(options.configured)) {
    return options.configured;
  }

  return options.fallback;
}
