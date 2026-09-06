import { beforeEach, describe, expect, it, vi } from "vitest";

const resizeMock = vi.fn();
const killMock = vi.fn();
const writeMock = vi.fn();
const onExitMock = vi.fn();

vi.mock("node-pty", () => ({
  spawn: vi.fn(() => ({
    onData: vi.fn(),
    onExit: onExitMock,
    resize: resizeMock,
    kill: killMock,
    write: writeMock,
  })),
}));

import { TerminalSession } from "../../src/server/terminal/terminal-session.js";

describe("terminal session row handling", () => {
  beforeEach(() => {
    resizeMock.mockReset();
    killMock.mockReset();
    writeMock.mockReset();
    onExitMock.mockReset();
  });

  it("does not resize a live PTY when another client attaches with a different row count", async () => {
    const session = new TerminalSession({
      id: "session-1",
      title: "Instance 1",
      shell: "pwsh",
      historyLimit: 10_000,
      fixedCols: 80,
      fixedRows: 30,
    });

    await session.ensureStarted({
      cols: 80,
      rows: 30,
    });
    resizeMock.mockClear();

    session.attachClient("client-1");

    expect(resizeMock).not.toHaveBeenCalled();
  });

  it("ignores viewport row changes once the PTY is already live", async () => {
    const session = new TerminalSession({
      id: "session-2",
      title: "Instance 2",
      shell: "pwsh",
      historyLimit: 10_000,
      fixedCols: 80,
      fixedRows: 30,
    });

    await session.ensureStarted({
      cols: 80,
      rows: 30,
    });
    resizeMock.mockClear();

    session.resize(80, 60);

    expect(resizeMock).not.toHaveBeenCalled();
  });

  it("still resizes a live PTY when the fixed column count changes", async () => {
    const session = new TerminalSession({
      id: "session-3",
      title: "Instance 3",
      shell: "pwsh",
      historyLimit: 10_000,
      fixedCols: 80,
      fixedRows: 30,
    });

    await session.ensureStarted({
      cols: 80,
      rows: 30,
    });
    resizeMock.mockClear();

    session.setFixedCols(100, 60);

    expect(resizeMock).toHaveBeenCalledWith(100, 60);
  });
});

describe("terminal session shell title", () => {
  function createSession() {
    return new TerminalSession({
      id: "session-1",
      title: "Instance 1",
      shell: "pwsh",
      historyLimit: 10_000,
      fixedCols: 80,
      fixedRows: 30,
    });
  }

  it("starts without a shell title and emits a summary when one is set", () => {
    const session = createSession();
    const summaries: Array<string | null> = [];
    session.on("summary", (summary) => {
      summaries.push(summary.shellTitle);
    });

    expect(session.getSummary().shellTitle).toBeNull();

    session.setShellTitle("build watcher");
    session.setShellTitle("build watcher");
    session.setShellTitle(null);

    expect(summaries).toEqual(["build watcher", null]);
  });

  it("clears the shell title when the PTY exits", async () => {
    const session = createSession();
    await session.ensureStarted({ cols: 80, rows: 30 });
    session.setShellTitle("vim README.md");

    const exitHandler = onExitMock.mock.calls.at(-1)?.[0] as
      | ((event: { exitCode: number }) => void)
      | undefined;
    expect(exitHandler).toBeTypeOf("function");
    exitHandler?.({ exitCode: 0 });

    expect(session.getSummary().status).toBe("exited");
    expect(session.getSummary().shellTitle).toBeNull();
  });

  it("clears the shell title on dispose", async () => {
    const session = createSession();
    await session.ensureStarted({ cols: 80, rows: 30 });
    session.setShellTitle("vim README.md");
    session.dispose();

    expect(session.getSummary().shellTitle).toBeNull();
  });
});
