import { describe, expect, it } from "vitest";

import type { SessionSummary } from "../../src/shared/protocol.js";
import { resolvePreferredSessionId } from "../../src/client/ui/sessionSelection.js";

const sessions: SessionSummary[] = [
  {
    id: "54fd93ae-0f1d-4dc4-af4a-547e8b87d2af",
    title: "Instance 1",
    status: "running",
    clientCount: 1,
    shell: "pwsh.exe",
    lastExitCode: null,
  },
  {
    id: "25f43048-9a8c-4b30-8150-6b75e437d9e8",
    title: "Instance 2",
    status: "running",
    clientCount: 1,
    shell: "pwsh.exe",
    lastExitCode: null,
  },
];

describe("resolvePreferredSessionId", () => {
  it("prefers the device-local selection when it still exists", () => {
    const preferred = resolvePreferredSessionId({
      sessions,
      localSessionId: sessions[1]!.id,
      workspaceActiveSessionId: sessions[0]!.id,
    });

    expect(preferred).toBe(sessions[1]!.id);
  });

  it("uses the workspace active instance for the initial attach when no local selection exists", () => {
    const preferred = resolvePreferredSessionId({
      sessions,
      localSessionId: null,
      workspaceActiveSessionId: sessions[1]!.id,
    });

    expect(preferred).toBe(sessions[1]!.id);
  });

  it("falls back to the first available instance when neither prior selection exists", () => {
    const preferred = resolvePreferredSessionId({
      sessions,
      localSessionId: "9a1fc8bf-8e52-43bf-8a7c-03dc8b18280b",
      workspaceActiveSessionId: "7cfeaf9d-5a98-47f8-bffd-58c0a289ce6a",
    });

    expect(preferred).toBe(sessions[0]!.id);
  });

  it("returns null when no sessions exist", () => {
    const preferred = resolvePreferredSessionId({
      sessions: [],
      localSessionId: null,
      workspaceActiveSessionId: null,
    });

    expect(preferred).toBeNull();
  });
});
