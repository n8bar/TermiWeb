interface SnapshotLine {
  translateToString(trimRight?: boolean, startColumn?: number, endColumn?: number): string;
}

interface SnapshotBuffer {
  viewportY: number;
  getLine(y: number): SnapshotLine | undefined;
}

interface SnapshotTerminal {
  rows: number;
  buffer: {
    active: SnapshotBuffer;
  };
}

export function captureVisibleTerminalText(terminal: SnapshotTerminal): string {
  const lines: string[] = [];
  const start = terminal.buffer.active.viewportY;

  for (let offset = 0; offset < terminal.rows; offset += 1) {
    const line = terminal.buffer.active.getLine(start + offset);
    lines.push(line?.translateToString(true) ?? "");
  }

  while (lines.length > 0 && lines.at(-1) === "") {
    lines.pop();
  }

  return lines.join("\n");
}

export type SnapshotFollowUp = "refresh-selection-text" | "refocus-live-terminal";

/**
 * Decides what the client does after a session snapshot has been written into
 * the terminal. Applying a snapshot must never exit selection mode: on mobile,
 * opening Select can change the keyboard state, the resulting viewport resize
 * schedules a snapshot resync, and exiting selection mode from that resync
 * would close the panel right after the user opened it (#5). While selecting,
 * the captured text is refreshed instead of refocusing the live terminal.
 */
export function resolveSnapshotFollowUp(options: { selectionMode: boolean }): SnapshotFollowUp {
  return options.selectionMode ? "refresh-selection-text" : "refocus-live-terminal";
}
