import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function read(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

const backgroundLaunchers = [
  "Start TermiWeb.cmd",
  "Restart TermiWeb.cmd",
  "Stop TermiWeb.cmd",
  "Enable TermiWeb Auto Start.cmd",
  "Disable TermiWeb Auto Start.cmd",
];

const elevatingScripts = [
  "scripts/start-hidden.ps1",
  "scripts/stop-hidden.ps1",
  "scripts/enable-auto-start.ps1",
  "scripts/disable-auto-start.ps1",
];

describe("background launchers", () => {
  it.each(backgroundLaunchers)("%s hands off to a hidden host and exits", (launcher) => {
    const contents = read(launcher);
    expect(contents).toContain('start "" "%PS_EXE%"');
    expect(contents).toContain("-WindowStyle Hidden");
    expect(contents).not.toContain("%ERRORLEVEL%");
  });

  it.each(backgroundLaunchers)("%s quotes the script path so spaces survive", (launcher) => {
    expect(read(launcher)).toMatch(/-File "%ROOT%scripts\\[a-z-]+\.ps1"/);
  });
});

describe("interactive launchers", () => {
  it.each(["Set Up TermiWeb.cmd", "Uninstall TermiWeb.cmd"])(
    "%s keeps its console so its prompts and output are readable",
    (launcher) => {
      const contents = read(launcher);
      expect(contents).not.toContain('start ""');
      expect(contents).toContain("%ERRORLEVEL%");
    },
  );
});

describe("elevation relaunches", () => {
  it.each(elevatingScripts)("%s hides the elevated child's console", (script) => {
    const contents = read(script);
    expect(contents).toContain("-Verb RunAs");
    expect(contents).toContain("-WindowStyle Hidden");
  });
});

describe("setup handoff", () => {
  it("starts the server through the hidden launcher rather than a visible cmd.exe", () => {
    const contents = read("scripts/setup.ps1");
    expect(contents).toContain("start-hidden.ps1");
    expect(contents).toContain("-WindowStyle Hidden");
    expect(contents).not.toContain('-FilePath "cmd.exe"');
  });
});
