import { describe, expect, it } from "vitest";

import {
  addWorkspaceTab,
  createEmptyWorkspaceState,
  ensureWorkspaceHasTab,
  removeWorkspaceTab,
  selectWorkspaceTab,
} from "../../src/server/workspace/workspace-state.js";

describe("workspace state", () => {
  it("ensures at least one default tab exists", () => {
    const state = ensureWorkspaceHasTab(createEmptyWorkspaceState());

    expect(state.tabs).toHaveLength(1);
    expect(state.tabs[0]?.title).toBe("Instance 1");
    expect(state.lastActiveTabId).toBe(state.tabs[0]?.id ?? null);
  });

  it("increments default tab titles only for auto-generated tabs", () => {
    const initial = ensureWorkspaceHasTab(createEmptyWorkspaceState());
    const withCustom = addWorkspaceTab(initial, "Logs");
    const withDefault = addWorkspaceTab(withCustom.state);

    expect(withCustom.tab.title).toBe("Logs");
    expect(withDefault.tab.title).toBe("Instance 2");
  });

  it("selects a known tab and ignores unknown ones", () => {
    const initial = ensureWorkspaceHasTab(createEmptyWorkspaceState());
    const next = addWorkspaceTab(initial);
    const selected = selectWorkspaceTab(next.state, next.tab.id);

    expect(selected.lastActiveTabId).toBe(next.tab.id);

    const unchanged = selectWorkspaceTab(selected, "d44f5fbf-8231-4d68-a332-3030cc2e8f07");
    expect(unchanged).toEqual(selected);
  });

  it("promotes another tab when the active tab is removed", () => {
    const initial = ensureWorkspaceHasTab(createEmptyWorkspaceState());
    const second = addWorkspaceTab(initial);
    const removed = removeWorkspaceTab(second.state, second.tab.id);

    expect(removed.removed).toBe(true);
    expect(removed.state.tabs).toHaveLength(1);
    expect(removed.state.lastActiveTabId).toBe(removed.state.tabs[0]?.id ?? null);
  });
});
