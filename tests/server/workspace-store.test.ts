import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import type { TermiWebConfig } from "../../src/server/config.js";
import { WorkspaceStore } from "../../src/server/workspace/workspace-store.js";

const tempDirs: string[] = [];

function createConfig(dataDir: string): TermiWebConfig {
  return {
    host: "127.0.0.1",
    port: 22443,
    sessionCookieName: "termiweb_session",
    password: "change-me",
    allowLan: false,
    defaultShell: undefined,
    fixedCols: 80,
    maxSessions: 8,
    sessionTtlHours: 24,
    dataDir,
    historyLimit: 200_000,
  };
}

afterEach(async () => {
  for (const tempDir of tempDirs.splice(0)) {
    await import("node:fs/promises").then(({ rm }) =>
      rm(tempDir, { recursive: true, force: true }),
    );
  }
});

describe("workspace store", () => {
  it("starts with one fresh instance even if old workspace metadata exists on disk", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "termiweb-workspace-store-"));
    tempDirs.push(tempDir);
    await mkdir(tempDir, { recursive: true });
    await writeFile(
      path.join(tempDir, "workspace.json"),
      JSON.stringify({
        tabs: [
          {
            id: "e8111049-784e-4fb3-bf87-bb994b57c6cb",
            title: "Instance 7",
            fixedCols: 160,
          },
        ],
        lastActiveTabId: "e8111049-784e-4fb3-bf87-bb994b57c6cb",
        nextDefaultTitleIndex: 8,
      }),
      "utf8",
    );

    const store = new WorkspaceStore(createConfig(tempDir));
    await store.initialize();

    const tabs = store.listTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]?.title).toBe("Instance 1");
    expect(tabs[0]?.fixedCols).toBe(80);
    expect(store.getLastActiveTabId()).toBe(tabs[0]?.id ?? null);
  });
});
