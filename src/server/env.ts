import fs from "node:fs";
import path from "node:path";

import { parse } from "dotenv";

export function loadDotEnvFile(options: {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
} = {}): string | undefined {
  const cwd = options.cwd ?? process.cwd();
  const env = options.env ?? process.env;
  const envPath = path.resolve(cwd, ".env");

  if (!fs.existsSync(envPath)) {
    return undefined;
  }

  const parsed = parse(fs.readFileSync(envPath, "utf8"));

  for (const [key, value] of Object.entries(parsed)) {
    if (env[key] === undefined) {
      env[key] = value;
    }
  }

  return envPath;
}
