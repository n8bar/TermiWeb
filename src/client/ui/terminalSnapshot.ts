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
