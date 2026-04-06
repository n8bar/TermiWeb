import os from "node:os";
import { EventEmitter } from "node:events";

import { spawn, type IPty } from "node-pty";

import type { SessionSnapshot, SessionSummary, TerminalStatus } from "../../shared/protocol.js";

interface TerminalSessionOptions {
  id: string;
  title: string;
  shell: string;
  historyLimit: number;
}

interface TerminalSessionEvents {
  output: [data: string];
  summary: [summary: SessionSummary];
}

function defaultArgs(shell: string): string[] {
  const lowered = shell.toLowerCase();
  if (lowered.includes("powershell") || lowered.includes("pwsh")) {
    return ["-NoLogo"];
  }

  return [];
}

function defaultWorkingDirectory(): string {
  return process.env.USERPROFILE ?? process.env.HOME ?? os.homedir() ?? process.cwd();
}

export class TerminalSession extends EventEmitter<TerminalSessionEvents> {
  readonly #id: string;
  readonly #title: string;
  readonly #shell: string;
  readonly #historyLimit: number;
  readonly #clientIds = new Set<string>();
  #pty: IPty | null = null;
  #history = "";
  #status: TerminalStatus = "stopped";
  #lastExitCode: number | null = null;
  #cols = 120;
  #rows = 32;

  constructor(options: TerminalSessionOptions) {
    super();
    this.#id = options.id;
    this.#title = options.title;
    this.#shell = options.shell;
    this.#historyLimit = options.historyLimit;
  }

  get id(): string {
    return this.#id;
  }

  getSummary(): SessionSummary {
    return {
      id: this.#id,
      title: this.#title,
      status: this.#status,
      clientCount: this.#clientIds.size,
      shell: this.#shell,
      lastExitCode: this.#lastExitCode,
    };
  }

  getSnapshot(): SessionSnapshot {
    return {
      session: this.getSummary(),
      history: this.#history,
    };
  }

  async ensureStarted(size?: { cols: number; rows: number }): Promise<void> {
    if (size) {
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
        cwd: defaultWorkingDirectory(),
        env: process.env as Record<string, string>,
        useConpty: true,
      });

      this.#pty.onData((data) => {
        this.#appendHistory(data);
        this.emit("output", data);
      });

      this.#pty.onExit(({ exitCode }) => {
        this.#pty = null;
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

  attachClient(clientId: string, size: { cols: number; rows: number }): void {
    this.#clientIds.add(clientId);
    this.#cols = size.cols;
    this.#rows = size.rows;
    this.#pty?.resize(size.cols, size.rows);
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
    this.#pty?.resize(cols, rows);
  }

  dispose(): void {
    this.#clientIds.clear();
    this.#pty?.kill();
    this.#pty = null;
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
