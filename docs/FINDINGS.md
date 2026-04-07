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

None yet.

## Closed

### Finding 1: Home and End require a double press
- Status: `Closed`
- First seen: `2026-04-06`
- Area: `mobile`
- Summary: The `Home` and `End` buttons did not take effect on the first press and had to be pressed twice.
- Notes: Fixed by making on-screen navigation buttons respect xterm application cursor mode instead of always sending normal-mode sequences.

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
- Notes: Fixed by forcing terminal and stage refits on viewport and orientation changes so the layout settles without a manual refresh.

### Finding 4: A second flashing cursor appears at the last updated character
- Status: `Closed`
- First seen: `2026-04-06`
- Area: `UI`
- Summary: A flashing cursor appeared at the last updated character in addition to the real solid input cursor.
- Notes: Fixed by switching the rendered terminal to a single solid bar cursor and suppressing the inactive cursor artifact.
