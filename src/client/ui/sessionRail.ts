import type { SessionSummary } from "../../shared/protocol.js";

export interface RailStructureOptions {
  activeSessionId: string | null;
  sidebarCollapsed: boolean;
  collapsedControlsOpenId: string | null;
  flashingSessionIds: ReadonlySet<string>;
}

export type RailRefreshPlan = "rebuild" | "titles-in-place";

/**
 * Describes everything the sidebar list's entries, classes, and handlers are
 * built from, leaving the displayed titles out. When two descriptions match, a
 * session list update can be applied to the existing entries in place; only a
 * structural change (an entry added, removed, or reordered, a status, attachment
 * count, shell, or width change, a bell, the active entry, or the rail layout)
 * needs the list rebuilt.
 */
export function describeRailStructure(
  sessions: readonly SessionSummary[],
  options: RailStructureOptions,
): string {
  const head = [
    options.sidebarCollapsed ? "collapsed" : "expanded",
    options.collapsedControlsOpenId ?? "",
  ].join("|");
  const rows = sessions.map((session) =>
    [
      session.id,
      session.status,
      session.clientCount,
      session.shell ?? "",
      session.fixedCols,
      session.attentionPending ? "attention" : "",
      session.id === options.activeSessionId ? "active" : "",
      options.flashingSessionIds.has(session.id) ? "flash" : "",
    ].join("|"),
  );
  return [head, ...rows].join("\n");
}

/**
 * A busy program reports its title several times a second, and every report
 * reaches every browser as a session list update. Rebuilding the list for each
 * one replaces the entries under a tap, a click, or keyboard focus, so those
 * updates are applied in place; the list is rebuilt only when its structure
 * differs from what was last rendered.
 */
export function resolveRailRefresh(
  renderedStructure: string | null,
  nextStructure: string,
): RailRefreshPlan {
  return renderedStructure === nextStructure ? "titles-in-place" : "rebuild";
}
