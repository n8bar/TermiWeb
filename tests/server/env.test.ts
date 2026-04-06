import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { loadDotEnvFile } from "../../src/server/env.js";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();

    if (dir) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("loadDotEnvFile", () => {
  it("loads values from .env without overriding existing process env", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "termiweb-env-"));
    tempDirs.push(tempDir);
    fs.writeFileSync(
      path.join(tempDir, ".env"),
      "TERMIWEB_PASSWORD=from-file\nTERMIWEB_ALLOW_LAN=true\n",
      "utf8",
    );

    const env: NodeJS.ProcessEnv = {
      TERMIWEB_PASSWORD: "from-process",
    };

    const loaded = loadDotEnvFile({ cwd: tempDir, env });

    expect(loaded).toBe(path.join(tempDir, ".env"));
    expect(env.TERMIWEB_PASSWORD).toBe("from-process");
    expect(env.TERMIWEB_ALLOW_LAN).toBe("true");
  });

  it("does nothing when no .env file exists", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "termiweb-env-"));
    tempDirs.push(tempDir);

    const env: NodeJS.ProcessEnv = {};
    const loaded = loadDotEnvFile({ cwd: tempDir, env });

    expect(loaded).toBeUndefined();
    expect(env).toEqual({});
  });
});
