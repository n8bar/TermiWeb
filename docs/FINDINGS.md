# Findings

This document tracks dogfood findings that are worth fixing later, without interrupting active use of the app.

## How To Use This Doc

- Add new findings to the `Open` section.
- Keep entries short and concrete.
- Prefer observable behavior over proposed fixes.
- Move items to `Closed` once the fix is shipped.

## Entry Template

### Finding N: Short title
- Status: `Open`
- First seen: `YYYY-MM-DD`
- Area: `UI` | `terminal` | `instances` | `mobile` | `docs` | `other`
- Summary: One or two sentences describing the behavior.
- Notes: Optional reproduction details, screenshots, or constraints.

## Open

### Finding 15: The app still has no favicon
- Status: `Closed`
- First seen: `2026-04-17`
- Area: `UI`
- Summary: TermiWeb still ships without a favicon, which makes tabs, bookmarks, and the eventual public release surface feel unfinished.
- Notes: Closed by shipping a real app favicon and wiring it into the browser client so screenshots and normal tabs stop showing the generic browser icon.

## Closed

### Finding 14: Mobile keyboard text assistance corrupts terminal input
- Status: `Closed`
- First seen: `2026-04-08`
- Area: `mobile`
- Summary: Mobile keyboard text-assistance features tied to predictive text and autocorrect interfered with terminal input, especially around punctuation, sometimes replaying or duplicating already typed text into PowerShell or other CLI prompts.
- Notes: Closed during `M9` by keeping standard text-assistance suppression hints on normal terminal surfaces and using a non-credential mobile capture fallback for live terminal entry so predictive text stops corrupting commands without making PTY input look like app login.

### Finding 13: Collapsed mobile instance controls are too small to use cleanly
- Status: `Closed`
- First seen: `2026-04-06`
- Area: `mobile`
- Summary: In collapsed mode on mobile, the active-instance row left the columns control too small to use reliably, and the same cramped layout made the close affordance compete badly for space.
- Notes: Closed during `M9` real-device mobile testing by making the collapsed active instance expose a large toggle target, showing larger opaque columns/close flyout controls only for the already active instance, keeping inactive collapsed-session taps selection-only, stabilizing the column popover against mobile keyboard and scroll side effects, and adding stable `40x40`/`60x36` preset geometries for narrow mobile use.

### Finding 6: The elevated-only run path still needs live verification
- Status: `Closed`
- First seen: `2026-04-16`
- Area: `other`
- Summary: `0.1` now has an elevated-only launch path in code, but the real start, restart, stop, and before-sign-in auto-start flow still needs live dogfood verification before the release story can be called dependable.
- Notes: Closed after the packaged uninstall, reinstall, setup, start, and live instance checks all passed in normal use, including verification that newly opened shells are actually elevated.

### Finding 12: Packaged setup could look hung after a successful first launch
- Status: `Closed`
- First seen: `2026-04-17`
- Area: `other`
- Summary: Running `Set Up TermiWeb.cmd` from a packaged install could stop at the firewall warning line even after the server had already started, which made the first-run flow look hung.
- Notes: Fixed during release dogfooding by making setup hand off to the packaged start launcher asynchronously and wait on the configured port instead of blocking on the nested launcher process chain.

### Finding 11: The collapsed keyboard rail could force app-level vertical scroll
- Status: `Closed`
- First seen: `2026-04-17`
- Area: `mobile`
- Summary: The collapsed keyboard quick-action rail could overflow the terminal shell enough to create a whole-app vertical scrollbar instead of staying contained within the terminal area.
- Notes: Fixed during M5 dogfooding by giving the collapsed rail a real grid row instead of rendering it from a zero-height row with a large downward translation, while keeping the desired slight upward visual nudge.

### Finding 5: Interactive CLI rendering truth breaks down under real use
- Status: `Closed`
- First seen: `2026-04-06`
- Area: `terminal`
- Summary: While using full-screen or highly interactive CLI tools such as Claude Code or Codex, typed text and generated text can appear in the wrong place, ghost text can linger, and visible text can shift upward or out of order.
- Notes: Closed after extended M5 dogfooding showed the current repaint and snapshot-rebuild mitigation is holding up in normal Claude Code and Codex use well enough that the drift no longer feels like a recurring `0.1` release blocker.

### Finding 7: Collapsing the top bar left reclaimed space stranded
- Status: `Closed`
- First seen: `2026-04-16`
- Area: `UI`
- Summary: Collapsing the top bar could leave dead space at the bottom of the workspace and made the reveal control feel spatially detached from the original collapse point.
- Notes: Fixed during M5 dogfooding by correcting the collapsed workspace grid and anchoring the reveal control to the same top-right corner language as the collapse control.

### Finding 8: Nested repo launches inherited the parent TermiWeb runtime config
- Status: `Closed`
- First seen: `2026-04-16`
- Area: `other`
- Summary: Launching the repo copy from inside another TermiWeb session could inherit the parent `TERMIWEB_*` environment and come up on the wrong port or password, which broke the expected Vite dogfood loop.
- Notes: Fixed during M5 dogfooding by making repo startup treat the repo `.env` as authoritative for `TERMIWEB_*` values and by making hidden start and stop prefer the repo port before inherited environment state.

### Finding 9: Top-bar status telemetry looked like part of the logout controls
- Status: `Closed`
- First seen: `2026-04-16`
- Area: `UI`
- Summary: The status pills and logout button shared the same right-side action rail, so connection status read like part of the logout control cluster instead of session telemetry.
- Notes: Fixed during M5 dogfooding by moving the status pills into the active-instance block and leaving logout as the lone action in the top-right action area.

### Finding 10: `Ctrl+C` ignored explicit selection during copy attempts
- Status: `Closed`
- First seen: `2026-04-16`
- Area: `terminal`
- Summary: Highlighted terminal text and selection-panel text did not get a reliable `Ctrl+C` copy path, so copy attempts could still behave like terminal interrupts instead of client-side copy.
- Notes: Fixed during M5 dogfooding by routing plain `Ctrl+C` or `Cmd+C` to the client clipboard only when there is an explicit text selection, while keeping unselected `Ctrl+C` as the real terminal interrupt path.

### Finding 1: Home and End require a double press
- Status: `Closed`
- First seen: `2026-04-06`
- Area: `mobile`
- Summary: The `Home` and `End` buttons did not take effect on the first press and had to be pressed twice.
- Notes: Fixed by giving on-screen `Home` and `End` a fallback navigation sequence so they work on the first press even when the shell and terminal disagree about cursor-mode interpretation.

### Finding 2: Cursor keys toggle keyboard visibility on mobile
- Status: `Closed`
- First seen: `2026-04-06`
- Area: `mobile`
- Summary: Pressing the on-screen cursor keys caused the mobile keyboard to show or hide unexpectedly.
- Notes: Fixed by keeping touch interaction with the control tray from stealing terminal focus, which keeps the keyboard and tray position stable during navigation.

### Finding 3: Returning from landscape leaves the UI too wide
- Status: `Closed`
- First seen: `2026-04-06`
- Area: `mobile`
- Summary: Rotating to landscape and then back to portrait could leave the layout wider than the screen.
- Notes: Fixed by forcing terminal and stage refits on viewport changes and by reapplying the desktop-style mobile viewport scale after orientation changes so the layout settles without a manual refresh.

### Finding 4: A second flashing cursor appears at the last updated character
- Status: `Closed`
- First seen: `2026-04-06`
- Area: `UI`
- Summary: A flashing cursor appeared at the last updated character in addition to the real solid input cursor.
- Notes: Fixed by switching the rendered terminal to a single solid bar cursor and suppressing the inactive cursor artifact.
