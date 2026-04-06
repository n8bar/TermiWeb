# Product Spec

## Goal

TermiWeb provides a single browser-served terminal workflow that can be used from both desktop and phone without remoting an entire desktop environment.

## Core Behavior

- The browser is the primary interface on every device.
- Multiple clients can attach to the same terminal session and type into it concurrently.
- The app manages named workspace tabs rather than a single throwaway shell.
- Authentication is a single shared password suitable for local/private deployments in v1.
- The host platform is Windows-first.
- The runtime prefers `pwsh` when available and falls back to Windows PowerShell on hosts where PowerShell 7 is not installed.

## V1 Constraints

- No public internet exposure assumptions.
- No full account system.
- No PTY/session resurrection after process or server restart.
- Persist only the workspace metadata needed to restore the tab list and session labels.
- Mobile users must have access to terminal-essential keys even when the OS keyboard is limited.
