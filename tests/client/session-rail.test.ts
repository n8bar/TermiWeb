import { describe, expect, it } from "vitest";

import type { SessionSummary } from "../../src/shared/protocol.js";
import {
  describeRailStructure,
  resolveRailRefresh,
  type RailStructureOptions,
} from "../../src/client/ui/sessionRail.js";

const first: SessionSummary = {
  id: "54fd93ae-0f1d-4dc4-af4a-547e8b87d2af",
  title: "Instance 1",
  status: "running",
  clientCount: 1,
  shell: "pwsh.exe",
  lastExitCode: null,
  fixedCols: 80,
  fixedRows: 30,
  shellTitle: null,
  attentionPending: false,
};

const second: SessionSummary = {
  ...first,
  id: "25f43048-9a8c-4b30-8150-6b75e437d9e8",
  title: "Instance 2",
};

const options: RailStructureOptions = {
  activeSessionId: first.id,
  sidebarCollapsed: false,
  collapsedControlsOpenId: null,
  flashingSessionIds: new Set(),
};

function plan(
  before: { sessions: SessionSummary[]; options?: Partial<RailStructureOptions> },
  after: { sessions: SessionSummary[]; options?: Partial<RailStructureOptions> },
) {
  const rendered = describeRailStructure(before.sessions, { ...options, ...before.options });
  const next = describeRailStructure(after.sessions, { ...options, ...after.options });
  return resolveRailRefresh(rendered, next);
}

describe("resolveRailRefresh", () => {
  it("rebuilds on the first render", () => {
    expect(resolveRailRefresh(null, describeRailStructure([first], options))).toBe("rebuild");
  });

  it("takes a shell title change in place", () => {
    expect(
      plan(
        { sessions: [first, second] },
        { sessions: [{ ...first, shellTitle: "⠋ codex: working" }, second] },
      ),
    ).toBe("titles-in-place");
  });

  it("takes a workspace title change in place", () => {
    expect(
      plan({ sessions: [first, second] }, { sessions: [first, { ...second, title: "Build" }] }),
    ).toBe("titles-in-place");
  });

  it("ignores fields the rail does not show", () => {
    expect(
      plan(
        { sessions: [first] },
        { sessions: [{ ...first, fixedRows: 40, lastExitCode: 1 }] },
      ),
    ).toBe("titles-in-place");
  });

  it("rebuilds when an entry is added, removed, or reordered", () => {
    expect(plan({ sessions: [first] }, { sessions: [first, second] })).toBe("rebuild");
    expect(plan({ sessions: [first, second] }, { sessions: [second] })).toBe("rebuild");
    expect(plan({ sessions: [first, second] }, { sessions: [second, first] })).toBe("rebuild");
  });

  it("rebuilds when what an entry shows besides its title changes", () => {
    expect(plan({ sessions: [first] }, { sessions: [{ ...first, status: "exited" }] })).toBe(
      "rebuild",
    );
    expect(plan({ sessions: [first] }, { sessions: [{ ...first, clientCount: 2 }] })).toBe(
      "rebuild",
    );
    expect(plan({ sessions: [first] }, { sessions: [{ ...first, shell: "cmd.exe" }] })).toBe(
      "rebuild",
    );
    expect(plan({ sessions: [first] }, { sessions: [{ ...first, fixedCols: 120 }] })).toBe(
      "rebuild",
    );
    expect(
      plan({ sessions: [first] }, { sessions: [{ ...first, attentionPending: true }] }),
    ).toBe("rebuild");
  });

  it("rebuilds when the active entry changes", () => {
    expect(
      plan(
        { sessions: [first, second] },
        { sessions: [first, second], options: { activeSessionId: second.id } },
      ),
    ).toBe("rebuild");
  });

  it("rebuilds when the rail layout changes", () => {
    expect(
      plan(
        { sessions: [first, second] },
        { sessions: [first, second], options: { sidebarCollapsed: true } },
      ),
    ).toBe("rebuild");
    expect(
      plan(
        { sessions: [first, second], options: { sidebarCollapsed: true } },
        {
          sessions: [first, second],
          options: { sidebarCollapsed: true, collapsedControlsOpenId: first.id },
        },
      ),
    ).toBe("rebuild");
  });

  it("rebuilds when a bell flash starts or ends", () => {
    expect(
      plan(
        { sessions: [first, second] },
        { sessions: [first, second], options: { flashingSessionIds: new Set([second.id]) } },
      ),
    ).toBe("rebuild");
    expect(
      plan(
        { sessions: [first, second], options: { flashingSessionIds: new Set([second.id]) } },
        { sessions: [first, second] },
      ),
    ).toBe("rebuild");
  });
});
