import fs from "node:fs";
import path from "node:path";

import { parse } from "dotenv";

export function loadDotEnvFile(options: {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  overridePrefixes?: string[];
} = {}): string | undefined {
  const cwd = options.cwd ?? process.cwd();
  const env = options.env ?? process.env;
  const overridePrefixes = options.overridePrefixes ?? [];
  const envPath = path.resolve(cwd, ".env");

  if (!fs.existsSync(envPath)) {
    return undefined;
  }

  const parsed = parse(fs.readFileSync(envPath, "utf8"));

  for (const [key, value] of Object.entries(parsed)) {
    const shouldOverride = overridePrefixes.some((prefix) => key.startsWith(prefix));
    if (env[key] === undefined || shouldOverride) {
      env[key] = value;
    }
  }

  return envPath;
}
