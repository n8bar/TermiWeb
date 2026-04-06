import path from "node:path";
import { z } from "zod";

const envSchema = z.object({
  TERMIWEB_HOST: z.string().min(1).optional(),
  TERMIWEB_PORT: z.coerce.number().int().min(1).max(65535).default(22443),
  TERMIWEB_PASSWORD: z.string().min(1).default("change-me"),
  TERMIWEB_ALLOW_LAN: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  TERMIWEB_DEFAULT_SHELL: z.string().trim().optional(),
  TERMIWEB_MAX_SESSIONS: z.coerce.number().int().min(1).max(32).default(8),
  TERMIWEB_SESSION_TTL_HOURS: z.coerce
    .number()
    .int()
    .min(1)
    .max(24 * 30)
    .default(24 * 7),
  TERMIWEB_DATA_DIR: z.string().trim().default(".termiweb"),
  TERMIWEB_HISTORY_LIMIT: z.coerce
    .number()
    .int()
    .min(10_000)
    .max(5_000_000)
    .default(200_000),
});

export interface TermiWebConfig {
  host: string;
  port: number;
  password: string;
  allowLan: boolean;
  defaultShell?: string | undefined;
  maxSessions: number;
  sessionTtlHours: number;
  dataDir: string;
  historyLimit: number;
}

export function resolveConfig(
  env: NodeJS.ProcessEnv = process.env,
): TermiWebConfig {
  const parsed = envSchema.parse(env);
  const host = parsed.TERMIWEB_HOST ?? (parsed.TERMIWEB_ALLOW_LAN ? "0.0.0.0" : "127.0.0.1");

  return {
    host,
    port: parsed.TERMIWEB_PORT,
    password: parsed.TERMIWEB_PASSWORD,
    allowLan: parsed.TERMIWEB_ALLOW_LAN,
    defaultShell: parsed.TERMIWEB_DEFAULT_SHELL || undefined,
    maxSessions: parsed.TERMIWEB_MAX_SESSIONS,
    sessionTtlHours: parsed.TERMIWEB_SESSION_TTL_HOURS,
    dataDir: path.resolve(parsed.TERMIWEB_DATA_DIR),
    historyLimit: parsed.TERMIWEB_HISTORY_LIMIT,
  };
}
