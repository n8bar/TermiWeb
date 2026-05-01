import { describe, expect, it } from "vitest";

import {
  addWorkspaceTab,
  createEmptyWorkspaceState,
  DEFAULT_FIXED_COLS,
  DEFAULT_FIXED_ROWS,
  ensureWorkspaceHasTab,
  removeWorkspaceTab,
  selectWorkspaceTab,
  updateWorkspaceTabFixedSize,
  workspaceStateSchema,
} from "../../src/server/workspace/workspace-state.js";

describe("workspace state", () => {
  it("ensures at least one default tab exists", () => {
    const state = ensureWorkspaceHasTab(createEmptyWorkspaceState());

    expect(state.tabs).toHaveLength(1);
    expect(state.tabs[0]?.title).toBe("Instance 1");
    expect(state.tabs[0]?.fixedCols).toBe(DEFAULT_FIXED_COLS);
    expect(state.tabs[0]?.fixedRows).toBe(DEFAULT_FIXED_ROWS);
    expect(state.lastActiveTabId).toBe(state.tabs[0]?.id ?? null);
  });

  it("increments default tab titles only for auto-generated tabs", () => {
    const initial = ensureWorkspaceHasTab(createEmptyWorkspaceState());
    const withCustom = addWorkspaceTab(initial, "Logs");
    const withDefault = addWorkspaceTab(withCustom.state);

    expect(withCustom.tab.title).toBe("Logs");
    expect(withDefault.tab.title).toBe("Instance 2");
  });

  it("reuses the lowest available default instance number", () => {
    const initial = ensureWorkspaceHasTab(createEmptyWorkspaceState());
    const second = addWorkspaceTab(initial);
    const removed = removeWorkspaceTab(second.state, initial.tabs[0]!.id);
    const replacement = addWorkspaceTab(removed.state);

    expect(removed.state.tabs.map((tab) => tab.title)).toEqual(["Instance 1"]);
    expect(replacement.tab.title).toBe("Instance 2");
  });

  it("ignores a stale nextDefaultTitleIndex when creating the next auto-named tab", () => {
    const staleState = workspaceStateSchema.parse({
      tabs: [
        {
          id: "4b2734b8-2878-4fa0-8c7e-1d0cdab85fb8",
          title: "Instance 1",
          fixedCols: 80,
        },
      ],
      lastActiveTabId: "4b2734b8-2878-4fa0-8c7e-1d0cdab85fb8",
      nextDefaultTitleIndex: 9,
    });

    const next = addWorkspaceTab(staleState);

    expect(next.tab.title).toBe("Instance 2");
  });

  it("normalizes legacy and sparse auto-generated titles on load", () => {
    const normalized = ensureWorkspaceHasTab(
      workspaceStateSchema.parse({
        tabs: [
          {
            id: "d9bd267f-eef0-4dc3-813b-32dcb61de7dd",
            title: "Terminal 4",
            fixedCols: 80,
          },
          {
            id: "624e3107-42d4-468a-b825-cb8a3022af0a",
            title: "Notes",
            fixedCols: 120,
          },
          {
            id: "dbf395bd-7573-40cd-a52d-53b0fdaf1383",
            title: "Instance 9",
            fixedCols: 100,
          },
        ],
        lastActiveTabId: "dbf395bd-7573-40cd-a52d-53b0fdaf1383",
        nextDefaultTitleIndex: 10,
      }),
    );

    expect(normalized.tabs.map((tab) => tab.title)).toEqual([
      "Instance 1",
      "Notes",
      "Instance 2",
    ]);
    expect(normalized.tabs.map((tab) => tab.fixedCols)).toEqual([80, 120, 100]);
    expect(normalized.tabs.map((tab) => tab.fixedRows)).toEqual([30, 45, 38]);
    expect(normalized.nextDefaultTitleIndex).toBe(3);
  });

  it("updates the fixed terminal size for a known tab", () => {
    const initial = ensureWorkspaceHasTab(createEmptyWorkspaceState());
    const updated = updateWorkspaceTabFixedSize(initial, initial.tabs[0]!.id, 120, 45);

    expect(updated.tabs[0]?.fixedCols).toBe(120);
    expect(updated.tabs[0]?.fixedRows).toBe(45);
    expect(updateWorkspaceTabFixedSize(updated, "a7c88eeb-e856-44d0-8d21-4ef32cdb35de", 132, 50)).toBe(
      updated,
    );
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
