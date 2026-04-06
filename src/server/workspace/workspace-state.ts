import { randomUUID } from "node:crypto";
import { z } from "zod";

export const workspaceTabSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(64),
});

export const workspaceStateSchema = z.object({
  tabs: z.array(workspaceTabSchema),
  lastActiveTabId: z.string().uuid().nullable(),
  nextDefaultTitleIndex: z.number().int().min(1),
});

export type WorkspaceTab = z.infer<typeof workspaceTabSchema>;
export type WorkspaceState = z.infer<typeof workspaceStateSchema>;

function createDefaultTitle(index: number): string {
  return `Instance ${index}`;
}

export function createEmptyWorkspaceState(): WorkspaceState {
  return {
    tabs: [],
    lastActiveTabId: null,
    nextDefaultTitleIndex: 1,
  };
}

export function ensureWorkspaceHasTab(state: WorkspaceState): WorkspaceState {
  if (state.tabs.length > 0) {
    return state;
  }

  const firstTab = {
    id: randomUUID(),
    title: createDefaultTitle(state.nextDefaultTitleIndex),
  };

  return {
    tabs: [firstTab],
    lastActiveTabId: firstTab.id,
    nextDefaultTitleIndex: state.nextDefaultTitleIndex + 1,
  };
}

export function addWorkspaceTab(
  state: WorkspaceState,
  title?: string,
): { state: WorkspaceState; tab: WorkspaceTab } {
  const resolvedTitle = title?.trim() || createDefaultTitle(state.nextDefaultTitleIndex);
  const tab = {
    id: randomUUID(),
    title: resolvedTitle,
  };

  return {
    tab,
    state: {
      tabs: [...state.tabs, tab],
      lastActiveTabId: tab.id,
      nextDefaultTitleIndex: title?.trim()
        ? state.nextDefaultTitleIndex
        : state.nextDefaultTitleIndex + 1,
    },
  };
}

export function selectWorkspaceTab(
  state: WorkspaceState,
  tabId: string,
): WorkspaceState {
  if (!state.tabs.some((tab) => tab.id === tabId)) {
    return state;
  }

  return {
    ...state,
    lastActiveTabId: tabId,
  };
}

export function removeWorkspaceTab(
  state: WorkspaceState,
  tabId: string,
): { state: WorkspaceState; removed: boolean } {
  const nextTabs = state.tabs.filter((tab) => tab.id !== tabId);
  if (nextTabs.length === state.tabs.length) {
    return { state, removed: false };
  }

  const nextActive =
    state.lastActiveTabId === tabId ? nextTabs.at(-1)?.id ?? null : state.lastActiveTabId;

  return {
    removed: true,
    state: {
      ...state,
      tabs: nextTabs,
      lastActiveTabId: nextActive,
    },
  };
}
