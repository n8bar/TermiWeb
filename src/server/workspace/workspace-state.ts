import { randomUUID } from "node:crypto";
import { z } from "zod";

export const workspaceTabSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(64),
  autoNamed: z.boolean().default(false),
});

export const workspaceStateSchema = z.object({
  tabs: z.array(workspaceTabSchema),
  lastActiveTabId: z.string().uuid().nullable(),
  nextDefaultTitleIndex: z.number().int().min(1).default(1),
});

export type WorkspaceTab = z.infer<typeof workspaceTabSchema>;
export type WorkspaceState = z.infer<typeof workspaceStateSchema>;

function createDefaultTitle(index: number): string {
  return `Instance ${index}`;
}

function parseDefaultTitleIndex(title: string): number | null {
  const match = /^(?:Instance|Terminal)\s+(\d+)$/i.exec(title.trim());
  if (!match) {
    return null;
  }

  const index = Number.parseInt(match[1] ?? "", 10);
  return Number.isInteger(index) && index >= 1 ? index : null;
}

function isAutoNamedTab(tab: WorkspaceTab): boolean {
  return tab.autoNamed || parseDefaultTitleIndex(tab.title) !== null;
}

function nextAvailableTitleIndex(usedIndices: Set<number>): number {
  let candidate = 1;
  while (usedIndices.has(candidate)) {
    candidate += 1;
  }

  return candidate;
}

function normalizeWorkspaceTabs(tabs: WorkspaceTab[]): WorkspaceTab[] {
  const usedIndices = new Set<number>();

  for (const tab of tabs) {
    if (isAutoNamedTab(tab)) {
      continue;
    }

    const reservedIndex = parseDefaultTitleIndex(tab.title);
    if (reservedIndex !== null) {
      usedIndices.add(reservedIndex);
    }
  }

  return tabs.map((tab) => {
    if (!isAutoNamedTab(tab)) {
      return {
        ...tab,
        autoNamed: false,
      };
    }

    const nextIndex = nextAvailableTitleIndex(usedIndices);
    usedIndices.add(nextIndex);

    return {
      ...tab,
      title: createDefaultTitle(nextIndex),
      autoNamed: true,
    };
  });
}

function resolveNextDefaultTitleIndex(tabs: WorkspaceTab[]): number {
  const usedIndices = new Set<number>();

  for (const tab of tabs) {
    const index = parseDefaultTitleIndex(tab.title);
    if (index !== null) {
      usedIndices.add(index);
    }
  }

  return nextAvailableTitleIndex(usedIndices);
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
    const tabs = normalizeWorkspaceTabs(state.tabs);
    return {
      ...state,
      tabs,
      nextDefaultTitleIndex: resolveNextDefaultTitleIndex(tabs),
    };
  }

  const firstTab = {
    id: randomUUID(),
    title: createDefaultTitle(state.nextDefaultTitleIndex),
    autoNamed: true,
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
  const normalizedTitle = title?.trim();
  const resolvedTitle = normalizedTitle || createDefaultTitle(state.nextDefaultTitleIndex);
  const tab = {
    id: randomUUID(),
    title: resolvedTitle,
    autoNamed: !normalizedTitle,
  };
  const tabs = normalizeWorkspaceTabs([...state.tabs, tab]);
  const resolvedTab = tabs.at(-1) ?? tab;

  return {
    tab: resolvedTab,
    state: {
      tabs,
      lastActiveTabId: resolvedTab.id,
      nextDefaultTitleIndex: resolveNextDefaultTitleIndex(tabs),
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
  const nextTabs = normalizeWorkspaceTabs(state.tabs.filter((tab) => tab.id !== tabId));
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
      nextDefaultTitleIndex: resolveNextDefaultTitleIndex(nextTabs),
    },
  };
}
