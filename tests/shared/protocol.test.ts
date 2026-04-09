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
