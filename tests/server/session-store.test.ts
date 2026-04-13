import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { SessionStore } from "../../src/server/auth/session-store.js";

const tempDirs: string[] = [];

function createTempDataDir(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), "termiweb-session-store-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("session store", () => {
  it("restores valid sessions from disk after restart", () => {
    const now = Date.now();
    const dataDir = createTempDataDir();
    const firstStore = new SessionStore({
      ttlHours: 24,
      dataDir,
    });

    const token = firstStore.issue(now);
    const secondStore = new SessionStore({
      ttlHours: 24,
      dataDir,
    });

    expect(secondStore.validate(token, now + 1_000)).toBe(true);
  });

  it("drops expired sessions when validating after restart", () => {
    const now = Date.now();
    const dataDir = createTempDataDir();
    const firstStore = new SessionStore({
      ttlHours: 1,
      dataDir,
    });

    const token = firstStore.issue(now);
    const secondStore = new SessionStore({
      ttlHours: 1,
      dataDir,
    });

    expect(secondStore.validate(token, now + 60 * 60 * 1000 + 1)).toBe(false);
  });

  it("persists revocation across restarts", () => {
    const now = Date.now();
    const dataDir = createTempDataDir();
    const firstStore = new SessionStore({
      ttlHours: 24,
      dataDir,
    });

    const token = firstStore.issue(now);
    const secondStore = new SessionStore({
      ttlHours: 24,
      dataDir,
    });
    secondStore.revoke(token);

    const thirdStore = new SessionStore({
      ttlHours: 24,
      dataDir,
    });

    expect(thirdStore.validate(token, now + 1_000)).toBe(false);
  });
});
