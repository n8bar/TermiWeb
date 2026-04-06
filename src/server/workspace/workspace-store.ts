import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { TermiWebConfig } from "../config.js";
import {
  addWorkspaceTab,
  createEmptyWorkspaceState,
  ensureWorkspaceHasTab,
  removeWorkspaceTab,
  selectWorkspaceTab,
  workspaceStateSchema,
  type WorkspaceState,
  type WorkspaceTab,
} from "./workspace-state.js";

export class WorkspaceStore {
  readonly #stateFile: string;
  #state: WorkspaceState = createEmptyWorkspaceState();

  constructor(config: TermiWebConfig) {
    this.#stateFile = path.join(config.dataDir, "workspace.json");
  }

  async initialize(): Promise<void> {
    await mkdir(path.dirname(this.#stateFile), { recursive: true });

    try {
      const raw = await readFile(this.#stateFile, "utf8");
      this.#state = ensureWorkspaceHasTab(
        workspaceStateSchema.parse(JSON.parse(raw)),
      );
    } catch {
      this.#state = ensureWorkspaceHasTab(createEmptyWorkspaceState());
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
    const next = addWorkspaceTab(this.#state, title);
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

  async #persist(): Promise<void> {
    await writeFile(this.#stateFile, `${JSON.stringify(this.#state, null, 2)}\n`, "utf8");
  }
}
