import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { TermiWebConfig } from "../config.js";
import {
  addWorkspaceTab,
  DEFAULT_FIXED_COLS,
  createEmptyWorkspaceState,
  ensureWorkspaceHasTab,
  removeWorkspaceTab,
  selectWorkspaceTab,
  updateWorkspaceTabFixedCols,
  workspaceStateSchema,
  type WorkspaceState,
  type WorkspaceTab,
} from "./workspace-state.js";

export class WorkspaceStore {
  readonly #stateFile: string;
  readonly #defaultFixedCols: number;
  #state: WorkspaceState = createEmptyWorkspaceState();

  constructor(config: TermiWebConfig) {
    this.#stateFile = path.join(config.dataDir, "workspace.json");
    this.#defaultFixedCols = config.fixedCols;
  }

  async initialize(): Promise<void> {
    await mkdir(path.dirname(this.#stateFile), { recursive: true });

    try {
      const raw = await readFile(this.#stateFile, "utf8");
      const parsed = workspaceStateSchema.parse(JSON.parse(raw));
      this.#state = ensureWorkspaceHasTab(parsed, this.#configFixedCols());
      if (JSON.stringify(parsed) !== JSON.stringify(this.#state)) {
        await this.#persist();
      }
    } catch {
      this.#state = ensureWorkspaceHasTab(createEmptyWorkspaceState(), this.#configFixedCols());
      await this.#persist();
    }
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
    await this.#persist();
    return next.tab;
  }

  async closeTab(tabId: string): Promise<boolean> {
    const next = removeWorkspaceTab(this.#state, tabId);
    this.#state = next.state;
    await this.#persist();
    return next.removed;
  }

  async selectTab(tabId: string): Promise<void> {
    this.#state = selectWorkspaceTab(this.#state, tabId);
    await this.#persist();
  }

  async setTabFixedCols(tabId: string, fixedCols: number): Promise<void> {
    this.#state = updateWorkspaceTabFixedCols(this.#state, tabId, fixedCols);
    await this.#persist();
  }

  async #persist(): Promise<void> {
    await writeFile(this.#stateFile, `${JSON.stringify(this.#state, null, 2)}\n`, "utf8");
  }

  #configFixedCols(): number {
    return this.#defaultFixedCols ?? DEFAULT_FIXED_COLS;
  }
}
