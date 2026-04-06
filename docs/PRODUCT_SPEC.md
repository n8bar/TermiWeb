# Product Spec

## Goal

TermiWeb provides a single browser-served terminal workflow that can be used from both desktop and phone without remoting an entire desktop environment.

## Core Behavior

- The browser is the primary interface on every device.
- Multiple clients can attach to the same terminal session and type into it concurrently.
- The app manages named workspace tabs rather than a single throwaway shell.
- Authentication is a single shared password suitable for local/private deployments in v1.
- The host platform is Windows-first.
- Runtime configuration is read from process environment and an optional repo-root `.env` file.
- The runtime prefers PowerShell 7 from `PATH`, then the standard install path, and only then falls back to Windows PowerShell.

## V1 Constraints

- No public internet exposure assumptions.
- `TERMIWEB_ALLOW_LAN=true` binds the app to the LAN default host when no explicit `TERMIWEB_HOST` is set.
- No full account system.
- No PTY/session resurrection after process or server restart.
- Persist only the workspace metadata needed to restore the tab list and session labels.
- Mobile users must have access to terminal-essential keys even when the OS keyboard is limited.
