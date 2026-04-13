import type { TermiWebConfig } from "../config.js";
import {
  addWorkspaceTab,
  DEFAULT_FIXED_COLS,
  createEmptyWorkspaceState,
  ensureWorkspaceHasTab,
  removeWorkspaceTab,
  selectWorkspaceTab,
  updateWorkspaceTabFixedCols,
  type WorkspaceState,
  type WorkspaceTab,
} from "./workspace-state.js";

export class WorkspaceStore {
  readonly #defaultFixedCols: number;
  #state: WorkspaceState = createEmptyWorkspaceState();

  constructor(config: TermiWebConfig) {
    this.#defaultFixedCols = config.fixedCols;
  }

  async initialize(): Promise<void> {
    this.#state = ensureWorkspaceHasTab(createEmptyWorkspaceState(), this.#configFixedCols());
  }

  listTabs(): WorkspaceTab[] {
    return [...this.#state.tabs];
  }

  getLastActiveTabId(): string | null {
    return this.#state.lastActiveTabId;
  }

  async createTab(title?: string): Promise<WorkspaceTab> {
    const next = addWorkspaceTab(this.#state, title, this.#configFixedCols());
    this.#state = next.state;
    return next.tab;
  }

  async closeTab(tabId: string): Promise<boolean> {
    const next = removeWorkspaceTab(this.#state, tabId);
    this.#state = next.state;
    return next.removed;
  }

  async selectTab(tabId: string): Promise<void> {
    this.#state = selectWorkspaceTab(this.#state, tabId);
  }

  async setTabFixedCols(tabId: string, fixedCols: number): Promise<void> {
    this.#state = updateWorkspaceTabFixedCols(this.#state, tabId, fixedCols);
  }

  #configFixedCols(): number {
    return this.#defaultFixedCols ?? DEFAULT_FIXED_COLS;
  }
}
