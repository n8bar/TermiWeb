import { describe, expect, it } from "vitest";

import type { TermiWebConfig } from "../../src/server/config.js";
import { TerminalManager } from "../../src/server/terminal/terminal-manager.js";
import type { WorkspaceStore } from "../../src/server/workspace/workspace-store.js";
import {
  addWorkspaceTab,
  createEmptyWorkspaceState,
  ensureWorkspaceHasTab,
  removeWorkspaceTab,
  selectWorkspaceTab,
  updateWorkspaceTabFixedCols,
  type WorkspaceState,
} from "../../src/server/workspace/workspace-state.js";

class FakeWorkspaceStore {
  #state: WorkspaceState;

  constructor(state = createEmptyWorkspaceState()) {
    this.#state = state;
  }

  listTabs() {
    return [...this.#state.tabs];
  }

  getLastActiveTabId() {
    return this.#state.lastActiveTabId;
  }

  async createTab(title?: string) {
    const next = addWorkspaceTab(this.#state, title);
    this.#state = next.state;
    return next.tab;
  }

  async closeTab(tabId: string) {
    const next = removeWorkspaceTab(this.#state, tabId);
    this.#state = next.state;
    return next.removed;
  }

  async selectTab(tabId: string) {
    this.#state = selectWorkspaceTab(this.#state, tabId);
  }

  async setTabFixedCols(tabId: string, fixedCols: number) {
    this.#state = updateWorkspaceTabFixedCols(this.#state, tabId, fixedCols);
  }
}

function createConfig(): TermiWebConfig {
  return {
    host: "127.0.0.1",
    port: 22443,
    password: "change-me",
    allowLan: false,
    defaultShell: undefined,
    fixedCols: 80,
    maxSessions: 8,
    sessionTtlHours: 24,
    dataDir: "C:\\Projects\\TermiWeb\\.termiweb-test",
    historyLimit: 200_000,
  };
}

describe("terminal manager", () => {
  it("creates Instance 1 when an empty workspace is listed", async () => {
    const store = new FakeWorkspaceStore();
    const manager = new TerminalManager(createConfig(), store as unknown as WorkspaceStore);

    await manager.initialize();

    expect(manager.listSessions()).toHaveLength(0);

    const created = await manager.ensureSessionAvailable();

    expect(created.title).toBe("Instance 1");
    expect(manager.listSessions()).toHaveLength(1);
    expect(store.listTabs()[0]?.title).toBe("Instance 1");
  });

  it("reuses an existing session instead of creating another one", async () => {
    const store = new FakeWorkspaceStore(ensureWorkspaceHasTab(createEmptyWorkspaceState()));
    const manager = new TerminalManager(createConfig(), store as unknown as WorkspaceStore);

    await manager.initialize();

    const existing = manager.listSessions()[0];
    const ensured = await manager.ensureSessionAvailable();

    expect(ensured.id).toBe(existing?.id);
    expect(manager.listSessions()).toHaveLength(1);
  });

  it("updates and persists the fixed column width for a session", async () => {
    const store = new FakeWorkspaceStore(ensureWorkspaceHasTab(createEmptyWorkspaceState()));
    const manager = new TerminalManager(createConfig(), store as unknown as WorkspaceStore);

    await manager.initialize();

    const existing = manager.listSessions()[0];
    expect(existing?.fixedCols).toBe(80);

    await manager.setSessionFixedCols(existing!.id, 120, 32);

    expect(manager.listSessions()[0]?.fixedCols).toBe(120);
    expect(store.listTabs()[0]?.fixedCols).toBe(120);
  });
});
