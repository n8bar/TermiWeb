import { beforeEach, describe, expect, it, vi } from "vitest";

const resizeMock = vi.fn();
const killMock = vi.fn();
const writeMock = vi.fn();

vi.mock("node-pty", () => ({
  spawn: vi.fn(() => ({
    onData: vi.fn(),
    onExit: vi.fn(),
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
  });

  it("does not resize a live PTY when another client attaches with a different row count", async () => {
    const session = new TerminalSession({
      id: "session-1",
      title: "Instance 1",
      shell: "pwsh",
      historyLimit: 10_000,
      fixedCols: 80,
    });

    await session.ensureStarted({
      cols: 80,
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
    });

    await session.ensureStarted({
      cols: 80,
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
    });

    await session.ensureStarted({
      cols: 80,
    });
    resizeMock.mockClear();

    session.setFixedCols(100, 60);

    expect(resizeMock).toHaveBeenCalledWith(100, 38);
  });
});
