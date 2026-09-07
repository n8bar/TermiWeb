import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import { resolveClientDir } from "../../src/server/http/client-dir.js";

describe("resolveClientDir", () => {
  it("finds dist/client beside the compiled server tree regardless of the working directory", () => {
    const appRoot = path.resolve("C:\\Program Files\\TermiWeb");
    const compiledModule = pathToFileURL(
      path.join(appRoot, "dist", "server", "server", "http", "app.js"),
    ).href;

    expect(resolveClientDir(compiledModule)).toBe(path.join(appRoot, "dist", "client"));
  });
});
