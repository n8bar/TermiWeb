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
        },
      ],
    });

    expect(event.type).toBe("session/list");
    if (event.type !== "session/list") {
      throw new Error("Expected session/list event");
    }
    expect(event.activeSessionId).toBe("54fd93ae-0f1d-4dc4-af4a-547e8b87d2af");
    expect(event.sessions[0]?.clientCount).toBe(2);
  });
});
