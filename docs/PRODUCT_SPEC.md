# Product Spec

## Goal

TermiWeb provides a single browser-served terminal workflow that can be used from a workstation and other devices without remoting an entire desktop environment.

## Core Behavior

- The browser is the primary interface on every device.
- Multiple clients can attach to the same terminal session and type into it concurrently.
- The app manages named shared instances rather than a single throwaway shell.
- The UI refers to those shared shells as instances.
- Authentication is a single shared password suitable for local/private deployments in v1.
- The host platform is Windows-first.
- Runtime configuration is read from process environment and an optional repo-root `.env` file.
- Terminal width is fixed at 80 columns by default so concurrent clients target the same line width.
- The runtime prefers PowerShell 7 from `PATH`, then the standard install path, and only then falls back to Windows PowerShell.

## V1 Constraints

- No public internet exposure assumptions.
- LAN binding is enabled by default and uses the LAN default host when no explicit `TERMIWEB_HOST` is set.
- No full account system.
- No PTY/session resurrection after process or server restart.
- Persist only the workspace metadata needed to restore the instance list and session labels.
- Mobile users must have access to terminal-essential keys even when the OS keyboard is limited.
- The host machine identity should remain visible before and after login.
- The instance rail can collapse horizontally, but instance selection and close actions must remain available.
- A device chooses its active instance locally after initial attach; switching on one device must not force-switch another device.
- Sidebar collapse is a per-device browser preference and must not propagate through shared session state.
- Select mode replaces the live terminal viewport with a read-only rendered-text snapshot suitable for copying.
- Workstation and device browsers should use the same core layout rather than switching into a separate mobile-specific arrangement.
- The page should fit the device viewport by default instead of forcing the whole UI onto an oversized horizontally panning canvas.
- Mobile browsers should default to a desktop-style layout viewport so the UI initially behaves more like the browser's "Desktop Site" mode without requiring a per-device toggle.
- That desktop-style mobile viewport should leave the browser free to choose the initial fit instead of pinning the page to a forced `initial-scale=1.0`.
- The mobile key cluster should include `Home` and `End` near the cursor keys, not only in the main action strip.
- `Ctrl` and `Alt` should arm on a single tap, lock on a double tap, and visibly distinguish armed from locked states.
- The sidebar should stay outside any scaled workspace stage so instance targets remain finger-sized.
- The main header and the active-terminal header should be merged to preserve vertical space.
- The terminal workspace stage should never present narrower than a 4:3 aspect ratio and should top-align so portrait phones leave slack below for the on-screen keyboard.
- When no manual sidebar preference is stored for a device, narrow viewports should default to a collapsed sidebar.
