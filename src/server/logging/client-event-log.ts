import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export interface ClientEventLogEntry {
  timestamp: string;
  type: string;
  name?: string | undefined;
  message?: string | undefined;
  context?: Record<string, string | boolean | number | null> | undefined;
  request?: {
    ip?: string | null | undefined;
    userAgent?: string | null | undefined;
  } | undefined;
}

export async function appendClientEventLog(
  dataDir: string,
  entry: ClientEventLogEntry,
): Promise<void> {
  const logDir = path.join(dataDir, "logs");
  const logPath = path.join(logDir, "client-events.log");
  await mkdir(logDir, { recursive: true });
  await appendFile(logPath, `${JSON.stringify(entry)}\n`, "utf8");
}
