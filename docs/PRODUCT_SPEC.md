# Product Spec

## Goal

TermiWeb provides a workstation-first browser terminal workflow that can also be reached from other devices without remoting an entire desktop environment.

## Product Direction

- The default product story is simple: one Windows workstation, one private network, and one trusted operator or small trusted group.
- Careful WAN exposure is a legitimate advanced use case for people managing their own workstations remotely.
- The product should remain useful without requiring a homelab or a complex self-hosted access stack.
- Advanced remote or internet-enabled deployments should be documented as operator-managed patterns around the app rather than treated as misuse.
- Future instance types may extend beyond terminals; the current leading candidate after `0.1` is an isolated workstation-hosted browser session.
- Future workstation layouts may also extend beyond a single visible instance; the leading post-`0.1` candidate there is an optional side-by-side instance view for very wide windows.
- Documentation should clearly separate current product behavior from deployment patterns users may layer around the app themselves.

## Core Behavior

### Session Model

- The browser is the primary interface on every device.
- Multiple clients can attach to the same terminal session and type into it concurrently.
- The app manages named shared instances rather than a single throwaway shell.
- The UI refers to those shared shells as instances.
- Auto-generated instance names should reuse the lowest available `Instance N` and normalize legacy `Terminal N` names forward to `Instance N`.
- Live instance titles should stay synced with that renumbering after creates and closes so the UI does not show duplicate auto-generated names.
- If a browser session reaches an empty workspace on login or reconnect, the app should seed `Instance 1` automatically.
- A device chooses its active instance locally after initial attach; switching on one device must not force-switch another device.
- Sidebar, topbar, and keyboard-tray collapse state are browser-local preferences and must not propagate through shared session state.

### Access And Runtime

- Authentication uses a single configured app password suitable for trusted private deployments in `0.1`.
- Authenticated browser sessions should survive a normal server restart until they expire or are revoked.
- A server restart should come back with one fresh active `Instance 1` rather than restoring dead instances from the prior process.
- TermiWeb `0.1` targets Windows hosts.
- TermiWeb `0.1` is elevated-only. Every shell it spawns is elevated.
- Runtime configuration is read from process environment and an optional repo-root `.env` file.
- The runtime prefers PowerShell 7 from `PATH`, then the standard install path, and only then falls back to Windows PowerShell.

### Terminal Sizing And Display

- New instances start at 80 columns by default.
- Terminal width is an instance property shared across all attached devices for that instance.
- Terminal rows are also shared per instance and must not be derived from live device viewport churn.
- Custom column widths should derive rows from a stable `80x30` baseline shape, while named width presets may apply explicit stable `cols x rows` pairs to preserve useful vertical context on mobile.
- The UI exposes a shared width control on the active instance so users can change columns deliberately without turning width into a per-device preference.
- The configured column count must always fit inside the visible `xterm` viewport width on each device.
- Font sizing should make the shared column count fit inside the visible viewport width.
- If width fit reaches the minimum font-size floor and configured columns still cannot fit, the terminal should expose a local horizontal scrollbar rather than clipping columns.
- The visible terminal surface should support touch scrolling through xterm scrollback without relying on a dead outer scrollbar.
- If a device cannot display the full shared real-screen height at once, the client may expose a separate local viewport scroll for the current shared screen without redefining shared terminal geometry.
- That local viewport scroll is distinct from xterm scrollback, which still represents buffer history older than the current shared screen.
- Each client should keep a local follow-cursor mode for the active instance so typing or otherwise returning to live use brings the active cursor/input area back into view without mutating the shared PTY.
- That local follow-cursor mode should disable itself when the user intentionally scrolls away from the live area, and re-enable when the user resumes typing or explicitly returns to live use.
- The rendered terminal cursor should present as a single solid insertion cursor rather than showing an extra blinking cursor artifact.

## 0.1 Constraints

Detailed browser-terminal interaction behavior lives in [the focused `0.1` browser-terminal spec](specs/v0.1-browser-terminal.md). The product spec keeps only the durable `0.1` boundaries and invariants here.

### Deployment And Security

- The supported default is localhost, LAN, or another trusted private network.
- Careful WAN exposure is allowed as an operator-managed deployment pattern around the app.
- `0.1` expects operators to provide the surrounding WAN controls they need, such as TLS, external auth, ingress policy, VPN or mesh access, or equivalent safeguards.
- No built-in claim that the configured app password by itself is a complete public-internet security story.
- No full account system.
- No built-in multi-user authorization model beyond the configured app password.
- No built-in TLS termination.

### Session Lifetime And Recovery

- No PTY/session resurrection after process or server restart.
- No workspace-instance persistence across server restart; only authenticated browser sessions may survive restart.
- Restart-stable auth state may persist lightweight server-side session records under `.termiweb/`, but that does not imply session resurrection for PTYs or shells.
- After a live connection is interrupted by a server restart, open pages should wait for server recovery and refresh themselves instead of flapping between reconnect states.

### Cross-Device And Mobile Interaction

- Mobile users must have access to terminal-essential keys even when the OS keyboard is limited.
- The host machine identity should remain visible before and after login.
- The current product version should remain visible before and after login so the running build is obvious on every device.
- The instance rail can collapse horizontally, but instance selection and close actions must remain available.
- The instance rail should favor larger touch targets over maximum density.
- The terminal `Type` action should live in the sidebar so it remains available in both expanded and collapsed rail states without competing with topbar status/actions.
- When narrow width forces the sidebar collapsed, the manual collapse toggle should disappear instead of pretending the user can expand it at that width.
- Workstation and device browsers should use the same core layout rather than switching into a separate mobile-specific arrangement.
- The page should fit the device viewport by default instead of forcing the whole UI onto an oversized horizontally panning canvas.
- Mobile browsers should default to a desktop-style layout viewport so the UI initially behaves more like the browser's "Desktop Site" mode without requiring a per-device toggle.
- That desktop-style mobile viewport should leave the browser free to choose the initial fit instead of pinning the page to a forced `initial-scale=1.0`.
- Touch use of the control tray should not blur the terminal or toggle the OS keyboard unexpectedly.
- The control tray should activate reliably from direct touch interaction on coarse-pointer browsers instead of depending on synthetic mobile click behavior.
- The live terminal input should disable autocorrect, autocapitalize, spellcheck, and similar word-level text assistance so command entry is not altered by the browser or OS keyboard.
- The live terminal input should not use password-style or credential-shaped capture fields; browser password-manager behavior belongs on the actual app login only.
- Mobile terminal entry may use a non-credential capture input type that browsers treat as non-autocorrecting when normal text capture is not strong enough, provided common shell entry remains available.
- The app should not expose a dead outer terminal scrollbar when the real scrollback lives inside the xterm viewport.
- The touch-oriented terminal scrollbar should favor a larger draggable thumb over strict visual density.
- The keyboard control tray should stay anchored inside the outer terminal shell, below the scaled stage, rather than floating against the screen edge.
- The keyboard control tray should be collapsible so a device can trade button space for more visible terminal rows.
- The top bar should also be locally collapsible per browser so constrained views can reclaim vertical space without affecting other attached devices.
- When collapsed, the top bar should leave behind only a tiny reveal button instead of a full header strip.
- The main header and the active-terminal header should be merged to preserve vertical space.
- Portrait-phone keyboard behavior should come from live visual-viewport sizing and tray placement, not from a universal 4:3 stage rule.
- The workspace shell should follow the live visual viewport height so the control tray stays attached to the terminal area instead of dropping behind the on-screen keyboard.
- Viewport and orientation changes should fully refit the terminal shell without requiring a browser refresh.
- On coarse-pointer browsers, rotation should be treated as a local layout refit rather than a shared terminal event.
- Viewport churn from one attached device should stay local after session startup rather than repeatedly rewriting the live PTY rows for every browser resize or mobile rotation.
- The live PTY row count should follow the shared per-instance geometry and should not keep changing just because attached devices have different viewport heights.
- TermiWeb should be able to rebuild the current instance from a fresh session snapshot after disruptive viewport changes without requiring a full page refresh.
- Snapshot-driven terminal rebuilds should force a local xterm repaint after attach or recovery, without mutating the shared PTY just because one device needed a local cleanup pass.
