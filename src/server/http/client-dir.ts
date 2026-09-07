import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Locates the built client bundle relative to the compiled server module rather
 * than the working directory. The installed layout runs the server with the
 * ProgramData config root as its working directory, so a cwd-relative
 * `dist/client` would miss; the compiled server lives at
 * `dist/server/server/http/`, and the client at `dist/client/`.
 */
export function resolveClientDir(moduleUrl: string): string {
  return path.resolve(path.dirname(fileURLToPath(moduleUrl)), "..", "..", "..", "client");
}
