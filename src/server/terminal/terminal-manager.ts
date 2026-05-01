import { EventEmitter } from "node:events";

import type { SessionSnapshot, SessionSummary } from "../../shared/protocol.js";
import type { TermiWebConfig } from "../config.js";
import type { WorkspaceStore } from "../workspace/workspace-store.js";
import { resolveShellCommand } from "./shell.js";
import { TerminalSession } from "./terminal-session.js";

interface SessionSize {
  cols: number;
  rows: number;
}

interface ManagerEvents {
  sessions: [sessions: SessionSummary[]];
  output: [sessionId: string, data: string];
}

export class TerminalManager extends EventEmitter<ManagerEvents> {
  readonly #sessions = new Map<string, TerminalSession>();
  readonly #clientSessions = new Map<string, string>();
  readonly #workspaceStore: WorkspaceStore;
  readonly #config: TermiWebConfig;
  readonly #shell: string;

  constructor(config: TermiWebConfig, workspaceStore: WorkspaceStore) {
    super();
    this.#workspaceStore = workspaceStore;
    this.#config = config;
    this.#shell = resolveShellCommand(config.defaultShell);
  }

  async initialize(): Promise<void> {
    for (const tab of this.#workspaceStore.listTabs()) {
      this.#registerSession(tab.id, tab.title, tab.fixedCols, tab.fixedRows);
    }
    this.#syncSessionDefinitions();
    this.#emitSessions();
  }

  listSessions(): SessionSummary[] {
    return [...this.#sessions.values()].map((session) => session.getSummary());
  }

  getActiveSessionId(): string | null {
    const activeSessionId = this.#workspaceStore.getLastActiveTabId();
    if (activeSessionId && this.#sessions.has(activeSessionId)) {
      return activeSessionId;
    }

    return this.listSessions()[0]?.id ?? null;
  }

  async ensureSessionAvailable(): Promise<SessionSummary> {
    const existing = this.listSessions()[0];
    if (existing) {
      return existing;
    }

    return this.createSession();
  }

  async createSession(title?: string): Promise<SessionSummary> {
    if (this.#sessions.size >= this.#config.maxSessions) {
      throw new Error(`Maximum session count (${this.#config.maxSessions}) reached.`);
    }

    const tab = await this.#workspaceStore.createTab(title);
    this.#syncSessionDefinitions();
    const session = this.#registerSession(tab.id, tab.title, tab.fixedCols, tab.fixedRows);
    this.#syncSessionDefinitions();
    this.#emitSessions();
    return session.getSummary();
  }

  async closeSession(sessionId: string): Promise<boolean> {
    const session = this.#sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.dispose();
    this.#sessions.delete(sessionId);

    for (const [clientId, attachedSessionId] of this.#clientSessions.entries()) {
      if (attachedSessionId === sessionId) {
        this.#clientSessions.delete(clientId);
      }
    }

    const removed = await this.#workspaceStore.closeTab(sessionId);
    this.#syncSessionDefinitions();
    this.#emitSessions();
    return removed;
  }

  async attachClient(
    clientId: string,
    sessionId: string,
    size: SessionSize,
  ): Promise<SessionSnapshot> {
    const session = this.#sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found.");
    }

    const previousSessionId = this.#clientSessions.get(clientId);
    if (previousSessionId && previousSessionId !== sessionId) {
      this.#sessions.get(previousSessionId)?.detachClient(clientId);
    }

    this.#clientSessions.set(clientId, sessionId);
    session.attachClient(clientId);
    await session.ensureStarted({
      cols: session.getFixedCols(),
      rows: session.getFixedRows(),
    });
    await this.#workspaceStore.selectTab(sessionId);
    this.#emitSessions();
    return session.getSnapshot();
  }

  getSnapshot(sessionId: string, clientId?: string): SessionSnapshot {
    if (clientId && this.#clientSessions.get(clientId) !== sessionId) {
      throw new Error("Client is not attached to that session.");
    }

    const session = this.#sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found.");
    }

    return session.getSnapshot();
  }

  detachClient(clientId: string): void {
    const sessionId = this.#clientSessions.get(clientId);
    if (!sessionId) {
      return;
    }

    this.#clientSessions.delete(clientId);
    this.#sessions.get(sessionId)?.detachClient(clientId);
    this.#emitSessions();
  }

  async write(sessionId: string, data: string, clientId?: string): Promise<void> {
    if (clientId && this.#clientSessions.get(clientId) !== sessionId) {
      return;
    }

    await this.#sessions.get(sessionId)?.write(data);
  }

  resize(sessionId: string, cols: number, rows: number, clientId?: string): void {
    if (clientId && this.#clientSessions.get(clientId) !== sessionId) {
      return;
    }

    const session = this.#sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.resize(session.getFixedCols(), rows);
  }

  async setSessionFixedCols(
    sessionId: string,
    cols: number,
    rows: number,
    clientId?: string,
  ): Promise<void> {
    if (clientId && this.#clientSessions.get(clientId) !== sessionId) {
      return;
    }

    const session = this.#sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found.");
    }

    session.setFixedCols(cols, rows);
    await this.#workspaceStore.setTabFixedSize(sessionId, cols, rows);
    this.#emitSessions();
  }

  getShellLabel(): string {
    return this.#shell;
  }

  #registerSession(
    sessionId: string,
    title: string,
    fixedCols: number,
    fixedRows: number,
  ): TerminalSession {
    const session = new TerminalSession({
      id: sessionId,
      title,
      shell: this.#shell,
      historyLimit: this.#config.historyLimit,
      fixedCols,
      fixedRows,
    });

    session.on("summary", () => {
      this.#emitSessions();
    });

    session.on("output", (data) => {
      this.emit("output", sessionId, data);
    });

    this.#sessions.set(sessionId, session);
    return session;
  }

  #emitSessions(): void {
    this.emit("sessions", this.listSessions());
  }

  #syncSessionDefinitions(): void {
    for (const tab of this.#workspaceStore.listTabs()) {
      this.#sessions.get(tab.id)?.setTitle(tab.title);
    }
  }
}
