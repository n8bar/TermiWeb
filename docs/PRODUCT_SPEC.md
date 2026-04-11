# Product Spec

## Goal

TermiWeb provides a workstation-first browser terminal workflow that can also be reached from other devices without remoting an entire desktop environment.

## Product Direction

- The default product story is simple: one Windows workstation, one private network, and one trusted operator or small trusted group.
- Careful WAN exposure is a legitimate advanced use case for people managing their own workstations remotely.
- The product should remain useful without requiring a homelab or a complex self-hosted access stack.
- Advanced remote or internet-enabled deployments should be documented as operator-managed patterns around the app rather than treated as misuse.
- Future instance types may extend beyond terminals; the current leading candidate after `0.1` is an isolated workstation-hosted browser session.
- Documentation should clearly separate current product behavior from deployment patterns users may layer around the app themselves.

## Core Behavior

- The browser is the primary interface on every device.
- Multiple clients can attach to the same terminal session and type into it concurrently.
- The app manages named shared instances rather than a single throwaway shell.
- The UI refers to those shared shells as instances.
- Auto-generated instance names should reuse the lowest available `Instance N` and normalize legacy `Terminal N` names forward to `Instance N`.
- If a browser session reaches an empty workspace on login or reconnect, the app should seed `Instance 1` automatically.
- Authentication uses a single configured app password suitable for trusted private deployments in `0.1`.
- Authenticated browser sessions should survive a normal server restart until they expire or are revoked.
- A server restart should come back with one fresh active `Instance 1` rather than restoring dead instances from the prior process.
- The host platform is Windows-first.
- Runtime configuration is read from process environment and an optional repo-root `.env` file.
- New instances start at 80 columns by default.
- Terminal width is an instance property shared across all attached devices for that instance.
- The UI exposes a shared width control on the active instance so users can change columns deliberately without turning width into a per-device preference.
- The configured column count must always fit inside the visible `xterm` viewport width on each device.
- Font sizing should make the configured columns fit inside that visible width.
- Visible row count should then flex from the available terminal height.
- If width fit reaches the minimum font-size floor and configured columns still cannot fit, the terminal should expose a local horizontal scrollbar rather than clipping columns.
- The runtime prefers PowerShell 7 from `PATH`, then the standard install path, and only then falls back to Windows PowerShell.

## 0.1 Constraints

- The supported default is localhost, LAN, or another trusted private network.
- Careful WAN exposure is allowed as an operator-managed deployment pattern around the app.
- `0.1` expects operators to provide the surrounding WAN controls they need, such as TLS, external auth, ingress policy, VPN or mesh access, or equivalent safeguards.
- No built-in claim that the configured app password by itself is a complete public-internet security story.
- LAN binding is enabled by default and uses the LAN default host when no explicit `TERMIWEB_HOST` is set.
- No full account system.
- No built-in multi-user authorization model beyond the configured app password.
- No built-in TLS termination.
- No PTY/session resurrection after process or server restart.
- No workspace-instance persistence across server restart; only authenticated browser sessions may survive restart.
- Restart-stable auth state may persist lightweight server-side session records under `.termiweb/`, but that does not imply session resurrection for PTYs or shells.
- Mobile users must have access to terminal-essential keys even when the OS keyboard is limited.
- The host machine identity should remain visible before and after login.
- The current product version should remain visible before and after login so the running build is obvious on every device.
- The instance rail can collapse horizontally, but instance selection and close actions must remain available.
- The instance rail should favor larger touch targets over maximum density.
- The terminal `Type` action should live in the sidebar so it remains available in both expanded and collapsed rail states without competing with topbar status/actions.
- In collapsed mode, the collapse toggle should sit above refresh instead of sharing a row with it.
- When narrow width forces the sidebar collapsed, the manual collapse toggle should disappear instead of pretending the user can expand it at that width.
- A device chooses its active instance locally after initial attach; switching on one device must not force-switch another device.
- Sidebar collapse is a per-device browser preference and must not propagate through shared session state.
- Select mode replaces the live terminal viewport with a read-only rendered-text snapshot suitable for copying.
- Workstation and device browsers should use the same core layout rather than switching into a separate mobile-specific arrangement.
- The page should fit the device viewport by default instead of forcing the whole UI onto an oversized horizontally panning canvas.
- Mobile browsers should default to a desktop-style layout viewport so the UI initially behaves more like the browser's "Desktop Site" mode without requiring a per-device toggle.
- That desktop-style mobile viewport should leave the browser free to choose the initial fit instead of pinning the page to a forced `initial-scale=1.0`.
- The mobile key cluster should include `Home` and `End` near the cursor keys, not only in the main action strip.
- On-screen `Home` and `End` should work on the first press at the shell prompt instead of requiring a second press.
- `Ctrl` and `Alt` should arm on a single tap, lock on a double tap, and visibly distinguish armed from locked states.
- On-screen `Home`, `End`, and cursor keys should emit application-cursor sequences when the terminal is in application cursor mode.
- Touch use of the control tray should not blur the terminal or toggle the OS keyboard unexpectedly.
- The control tray should activate reliably from direct touch interaction on coarse-pointer browsers instead of depending on synthetic mobile click behavior.
- The live terminal input should disable autocorrect, autocapitalize, spellcheck, and similar word-level text assistance so command entry is not altered by the browser or OS keyboard.
- The visible terminal surface itself should support one-finger vertical touch scrolling through scrollback on coarse-pointer devices.
- The app should not expose a dead outer terminal scrollbar when the real scrollback lives inside the xterm viewport.
- The touch-oriented terminal scrollbar should favor a larger draggable thumb over strict visual density.
- The sidebar should stay outside any scaled workspace stage so instance targets remain finger-sized.
- The keyboard control tray should also stay outside the scaled workspace stage so its controls remain finger-sized.
- The keyboard control tray should stay anchored inside the outer terminal shell, below the scaled stage, rather than floating against the screen edge.
- The keyboard control tray should be collapsible so a device can trade button space for more visible terminal rows.
- Keyboard tray collapse should be a per-device browser preference and must not propagate through shared session state.
- The keyboard-tray collapse control should live on the seam between the terminal viewport and the tray instead of consuming its own header row.
- The main header and the active-terminal header should be merged to preserve vertical space.
- The terminal workspace stage should top-align within its viewport and use the full available height rather than discarding rows through a global aspect-ratio cap.
- Portrait-phone keyboard behavior should come from live visual-viewport sizing and tray placement, not from a universal 4:3 stage rule.
- The workspace shell should follow the live visual viewport height so the control tray stays attached to the terminal area instead of dropping behind the on-screen keyboard.
- Viewport and orientation changes should fully refit the terminal shell without requiring a browser refresh.
- On coarse-pointer browsers, rotation should be treated as a local layout refit rather than a shared terminal event.
- Viewport churn from one attached device should stay local after session startup rather than repeatedly rewriting the live PTY rows for every browser resize or mobile rotation.
- The live PTY row count should be established when a shell starts and should not keep changing just because attached devices have different viewport heights.
- TermiWeb should be able to rebuild the current instance from a fresh session snapshot after disruptive viewport changes without requiring a full page refresh.
- After a live connection is interrupted by a server restart, open pages should wait for server recovery and refresh themselves instead of flapping between reconnect states.
- When no manual sidebar preference is stored for a device, narrow viewports should default to a collapsed sidebar.
- The control tray should keep the cursor-key cluster aligned beside the main button rows instead of stacking it below them.
- The main key strip should favor three taller rows over two cramped rows when that keeps touch targets usable.
- The main key strip should prioritize taller touch targets over extra horizontal density.
- Non-arrow terminal buttons should match the cursor-key button height.
- The main key strip order should be `Esc`, `Bksp`, `Del`; then `Tab`, `Select`, `Copy`; then `Ctrl`, `Alt`, `Paste`, with `Enter` placed under the cursor-key cluster.
- The rendered terminal cursor should present as a single solid insertion cursor rather than showing an extra blinking cursor artifact.
