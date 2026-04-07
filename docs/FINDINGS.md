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

### Finding 1: Home and End require a double press
- Status: `Open`
- First seen: `2026-04-06`
- Area: `mobile`
- Summary: The `Home` and `End` buttons do not take effect on the first press and currently have to be pressed twice.
- Notes: The issue appears specific to the on-screen control buttons rather than general terminal input.

### Finding 2: Cursor keys toggle keyboard visibility on mobile
- Status: `Open`
- First seen: `2026-04-06`
- Area: `mobile`
- Summary: Pressing the on-screen cursor keys causes the mobile keyboard to show or hide unexpectedly.
- Notes: When the keyboard visibility changes, the keyboard control tray shifts position, which makes the controls feel unstable during navigation.

### Finding 3: Returning from landscape leaves the UI too wide
- Status: `Open`
- First seen: `2026-04-06`
- Area: `mobile`
- Summary: On mobile, rotating to landscape and then back to portrait can leave the layout wider than the screen.
- Notes: The right side of the UI becomes inaccessible until the page is refreshed.

### Finding 4: A second flashing cursor appears at the last updated character
- Status: `Open`
- First seen: `2026-04-06`
- Area: `UI`
- Summary: A flashing cursor appears at the last updated character in addition to the real input cursor.
- Notes: The duplicate cursor is visually distracting because it competes with the actual insertion point.

## Closed

None yet.
