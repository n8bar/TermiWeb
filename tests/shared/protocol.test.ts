import { describe, expect, it } from "vitest";

import { parseClientEvent, parseServerEvent } from "../../src/shared/protocol.js";

describe("protocol parsing", () => {
  it("accepts a valid terminal input event", () => {
    const event = parseClientEvent({
      type: "terminal/input",
      sessionId: "54fd93ae-0f1d-4dc4-af4a-547e8b87d2af",
      data: "dir\r",
    });

    expect(event.type).toBe("terminal/input");
    if (event.type !== "terminal/input") {
      throw new Error("Expected terminal/input event");
    }
    expect(event.data).toBe("dir\r");
  });

  it("rejects invalid session identifiers", () => {
    expect(() =>
      parseClientEvent({
        type: "session/select",
        sessionId: "not-a-uuid",
        cols: 120,
        rows: 32,
      }),
    ).toThrow();
  });

  it("accepts a valid session list payload", () => {
    const event = parseServerEvent({
      type: "session/list",
      activeSessionId: "54fd93ae-0f1d-4dc4-af4a-547e8b87d2af",
      sessions: [
        {
          id: "54fd93ae-0f1d-4dc4-af4a-547e8b87d2af",
          title: "Instance 1",
          status: "running",
          clientCount: 2,
          shell: "powershell.exe",
          lastExitCode: null,
          fixedCols: 80,
          fixedRows: 30,
        },
      ],
    });

    expect(event.type).toBe("session/list");
    if (event.type !== "session/list") {
      throw new Error("Expected session/list event");
    }
    expect(event.activeSessionId).toBe("54fd93ae-0f1d-4dc4-af4a-547e8b87d2af");
    expect(event.sessions[0]?.clientCount).toBe(2);
    expect(event.sessions[0]?.fixedCols).toBe(80);
    expect(event.sessions[0]?.fixedRows).toBe(30);
  });

  it("accepts a session snapshot request event", () => {
    const event = parseClientEvent({
      type: "session/snapshot.request",
      sessionId: "54fd93ae-0f1d-4dc4-af4a-547e8b87d2af",
    });

    expect(event.type).toBe("session/snapshot.request");
    if (event.type !== "session/snapshot.request") {
      throw new Error("Expected session/snapshot.request event");
    }

    expect(event.sessionId).toBe("54fd93ae-0f1d-4dc4-af4a-547e8b87d2af");
  });

  it("accepts a valid session column width change event", () => {
    const event = parseClientEvent({
      type: "session/cols",
      sessionId: "54fd93ae-0f1d-4dc4-af4a-547e8b87d2af",
      cols: 120,
      rows: 32,
    });

    expect(event.type).toBe("session/cols");
    if (event.type !== "session/cols") {
      throw new Error("Expected session/cols event");
    }

    expect(event.cols).toBe(120);
    expect(event.rows).toBe(32);
  });

  it("accepts a tiny-height resize event when the viewport only has a few visible rows", () => {
    const event = parseClientEvent({
      type: "terminal/resize",
      sessionId: "54fd93ae-0f1d-4dc4-af4a-547e8b87d2af",
      cols: 80,
      rows: 1,
    });

    expect(event.type).toBe("terminal/resize");
    if (event.type !== "terminal/resize") {
      throw new Error("Expected terminal/resize event");
    }

    expect(event.rows).toBe(1);
  });
});

describe("instance title protocol", () => {
  it("defaults a session summary's shell title to null when the field is absent", () => {
    const event = parseServerEvent({
      type: "session/list",
      activeSessionId: null,
      sessions: [
        {
          id: "54fd93ae-0f1d-4dc4-af4a-547e8b87d2af",
          title: "Instance 1",
          status: "running",
          clientCount: 0,
          shell: null,
          lastExitCode: null,
          fixedCols: 80,
          fixedRows: 30,
        },
      ],
    });

    if (event.type !== "session/list") {
      throw new Error("Expected session/list event");
    }
    expect(event.sessions[0]?.shellTitle).toBeNull();
  });

  it("accepts a session summary carrying a shell title", () => {
    const event = parseServerEvent({
      type: "session/created",
      session: {
        id: "54fd93ae-0f1d-4dc4-af4a-547e8b87d2af",
        title: "Instance 3",
        shellTitle: "build watcher",
        status: "running",
        clientCount: 1,
        shell: "pwsh.exe",
        lastExitCode: null,
        fixedCols: 80,
        fixedRows: 30,
      },
    });

    if (event.type !== "session/created") {
      throw new Error("Expected session/created event");
    }
    expect(event.session.shellTitle).toBe("build watcher");
  });

  it("accepts a terminal title event", () => {
    const event = parseClientEvent({
      type: "terminal/title",
      sessionId: "54fd93ae-0f1d-4dc4-af4a-547e8b87d2af",
      title: "vim README.md",
    });

    expect(event.type).toBe("terminal/title");
    if (event.type !== "terminal/title") {
      throw new Error("Expected terminal/title event");
    }
    expect(event.title).toBe("vim README.md");
  });
});
