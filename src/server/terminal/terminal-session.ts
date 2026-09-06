import { EventEmitter } from "node:events";

import { spawn, type IPty } from "node-pty";

import type { SessionSnapshot, SessionSummary, TerminalStatus } from "../../shared/protocol.js";
import { BellDetector } from "./bell-detector.js";
import { resolveHomeDirectory, resolveStartDirectory } from "./start-directory.js";

const BELL_COALESCE_MS = 1000;

interface TerminalSessionOptions {
  id: string;
  title: string;
  shell: string;
  historyLimit: number;
  fixedCols: number;
  fixedRows: number;
  startDirectory?: string | undefined;
}

interface TerminalSessionEvents {
  output: [data: string];
  summary: [summary: SessionSummary];
  bell: [];
}

function defaultArgs(shell: string): string[] {
  const lowered = shell.toLowerCase();
  if (lowered.includes("powershell") || lowered.includes("pwsh")) {
    return ["-NoLogo"];
  }

  return [];
}

export class TerminalSession extends EventEmitter<TerminalSessionEvents> {
  readonly #id: string;
  readonly #shell: string;
  readonly #historyLimit: number;
  readonly #startDirectory: string | undefined;
  readonly #clientIds = new Set<string>();
  #title: string;
  #shellTitle: string | null = null;
  #attentionPending = false;
  #lastBellAt = 0;
  #bellDetector = new BellDetector();
  #pty: IPty | null = null;
  #history = "";
  #status: TerminalStatus = "stopped";
  #lastExitCode: number | null = null;
  #cols: number;
  #rows: number;

  constructor(options: TerminalSessionOptions) {
    super();
    this.#id = options.id;
    this.#title = options.title;
    this.#shell = options.shell;
    this.#historyLimit = options.historyLimit;
    this.#startDirectory = options.startDirectory;
    this.#cols = options.fixedCols;
    this.#rows = options.fixedRows;
  }

  get id(): string {
    return this.#id;
  }

  getSummary(): SessionSummary {
    return {
      id: this.#id,
      title: this.#title,
      shellTitle: this.#shellTitle,
      attentionPending: this.#attentionPending,
      status: this.#status,
      clientCount: this.#clientIds.size,
      shell: this.#shell,
      lastExitCode: this.#lastExitCode,
      fixedCols: this.#cols,
      fixedRows: this.#rows,
    };
  }

  getSnapshot(): SessionSnapshot {
    return {
      session: this.getSummary(),
      history: this.#history,
    };
  }

  async ensureStarted(size?: { cols: number; rows: number }): Promise<void> {
    if (size && !this.#pty && this.#status !== "starting") {
      this.#cols = size.cols;
      this.#rows = size.rows;
    }

    if (this.#pty || this.#status === "starting") {
      return;
    }

    this.#status = "starting";
    this.#emitSummary();

    try {
      this.#pty = spawn(this.#shell, defaultArgs(this.#shell), {
        name: "xterm-color",
        cols: this.#cols,
        rows: this.#rows,
        cwd: resolveStartDirectory({
          configured: this.#startDirectory,
          fallback: resolveHomeDirectory(),
        }),
        env: process.env as Record<string, string>,
        useConpty: true,
      });

      this.#bellDetector = new BellDetector();
      this.#pty.onData((data) => {
        this.#appendHistory(data);
        this.emit("output", data);
        if (this.#bellDetector.feed(data) > 0) {
          this.#ring();
        }
      });

      this.#pty.onExit(({ exitCode }) => {
        this.#pty = null;
        this.#shellTitle = null;
        this.#lastExitCode = exitCode;
        this.#status = "exited";
        this.#emitSummary();
      });

      this.#status = "running";
      this.#lastExitCode = null;
      this.#emitSummary();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.#appendHistory(`\r\n[TermiWeb] Failed to start shell: ${message}\r\n`);
      this.#status = "error";
      this.#emitSummary();
    }
  }

  attachClient(clientId: string): void {
    this.#clientIds.add(clientId);
    this.#emitSummary();
  }

  detachClient(clientId: string): void {
    if (this.#clientIds.delete(clientId)) {
      this.#emitSummary();
    }
  }

  async write(data: string): Promise<void> {
    await this.ensureStarted();
    this.#pty?.write(data);
  }

  resize(cols: number, rows: number): void {
    this.#cols = cols;
    this.#rows = rows;
  }

  setFixedCols(cols: number, rows = this.#rows): void {
    this.#cols = cols;
    this.#rows = rows;
    this.#pty?.resize(cols, this.#rows);
  }

  getFixedCols(): number {
    return this.#cols;
  }

  getFixedRows(): number {
    return this.#rows;
  }

  setTitle(title: string): void {
    if (this.#title === title) {
      return;
    }

    this.#title = title;
    this.#emitSummary();
  }

  setShellTitle(title: string | null): void {
    if (this.#shellTitle === title) {
      return;
    }

    this.#shellTitle = title;
    this.#emitSummary();
  }

  clearAttention(): void {
    if (!this.#attentionPending) {
      return;
    }

    this.#attentionPending = false;
    this.#emitSummary();
  }

  #ring(): void {
    if (!this.#attentionPending) {
      this.#attentionPending = true;
      this.#emitSummary();
    }

    const now = Date.now();
    if (now - this.#lastBellAt < BELL_COALESCE_MS) {
      return;
    }

    this.#lastBellAt = now;
    this.emit("bell");
  }

  dispose(): void {
    this.#clientIds.clear();
    this.#pty?.kill();
    this.#pty = null;
    this.#shellTitle = null;
    this.#status = "stopped";
    this.#emitSummary();
  }

  #appendHistory(data: string): void {
    this.#history += data;
    if (this.#history.length > this.#historyLimit) {
      this.#history = this.#history.slice(-this.#historyLimit);
    }
  }

  #emitSummary(): void {
    this.emit("summary", this.getSummary());
  }
}
