# Instance Titles Spec

## Scope

Two related behaviors that affect how a TermiWeb instance is labeled:

- Honor the OSC `0` / `2` window-title escape sequences shells and TUI apps emit, and surface that value in the active-instance heading and the sidebar list.
- Stop renumbering auto-named instances when an instance is closed, so an instance's identifying number stays stable for the lifetime of the workspace.

The two behaviors are specified together because the title-source decision and the stable-identifier decision interact directly.

## Motivation

CLI apps that set the terminal title (`ssh`, REPLs, editors, build tools, `tmux`, custom shell prompts) get no surface in TermiWeb today. The xterm.js terminal silently consumes the title-change escape sequences, and the topbar heading shows only the workspace-managed default like `Instance 1`. Operators lose a real signal about what each instance is currently doing.

The renumber-on-close behavior compounds this: closing instance `2` of `[1, 2, 3]` renames the previously-`3` instance to `2`, so any mental model of "instance 3 is my build watcher" breaks the moment something else closes.

## Title Sources and Precedence

Each instance has two possible title sources:

1. A workspace default title (`Instance N`) assigned when the instance is created.
2. A shell-provided title, captured from the most recent OSC `0` / `2` sequence emitted by the running program.

Display precedence:

- When a shell-provided title is present and non-empty, it is the displayed title.
- When the shell clears the title (empty OSC payload) or no shell title has ever been seen for this instance, the displayed title falls back to the workspace default.
- The workspace default for an instance never changes after creation. It is not renumbered when other instances are closed.

The shell-provided title is per-instance runtime state. It does not need to persist across server restarts; on reattach, the next program emit will repopulate it. The workspace default is the persistent identifier and stays in the workspace state file.

## Stable Instance Numbering

- New auto-named instances pick the lowest positive integer not currently in use by any existing auto-named instance. Closing an instance does not free its number for reuse if doing so would cause renumbering of other instances.
- Practical rule: no instance's workspace default ever changes as a side effect of another instance's lifecycle. The visible number may have gaps (`Instance 1`, `Instance 4`, `Instance 7`); that is acceptable and expected.
- A future explicit user rename is out of scope here. This spec only addresses automatic naming and shell-driven titles.

## Overflow Display

The active-instance heading in the top bar (`#active-session-title`) has limited horizontal room and must not wrap.

- The active-instance heading truncates with an ellipsis when the full title does not fit on a single line.
- The heading element exposes the full untruncated title via a native browser tooltip (`title` attribute) so a hover on desktop reveals the complete value.
- The sidebar instance list already truncates with an ellipsis; it also gains the same tooltip-on-hover affordance for the full title.
- Tooltip content is the full title currently in effect (shell-provided when present, workspace default otherwise). It is not a separate name.
- When the displayed title fits without truncation, the tooltip is still allowed and harmless; implementations may set it unconditionally.
- The collapsed-rail short label keeps its existing number-only display when the collapsed display rule applies. This spec does not change collapsed-rail compaction.

Non-goals for overflow display:

- No custom popover, marquee, or expand-on-click behavior. Native tooltip is sufficient.
- No mobile-specific tooltip behavior is required; mobile browsers do not surface `title` attributes consistently, and the collapsed-rail number is the primary mobile affordance.

## Protocol and State Changes

- `SessionSummary` gains an optional shell title field separate from the workspace default title, so clients can render precedence themselves and the server stays the source of truth.
- A new server event carries title changes for an existing session, or the existing `session/list` broadcast updates the summary. Either mechanism is acceptable; the implementation must not require a full snapshot re-send for a title change.
- The xterm.js client wires `terminal.onTitleChange` and forwards it to the server as a new `terminal/title` client event for the active session id. The server clamps length, applies the same length bound already used for session titles, strips control characters from the payload, and broadcasts the updated summary to the rest of the workspace.

## Acceptance Checks

- A shell-emitted OSC `0` or `2` title sequence on an instance updates the displayed title for that instance in the topbar heading and the sidebar entry across every connected client.
- An OSC `0` or `2` sequence with an empty title payload returns the displayed title for that instance to its workspace default.
- Closing any instance leaves the workspace default of every remaining instance unchanged.
- A newly created auto-named instance takes the lowest positive integer not currently in use by another auto-named instance, even when prior closures have produced gaps in the existing numbering.
- The active-instance heading occupies a single line. When the displayed title exceeds the available width, the visible value ends in an ellipsis and the full title is available through a native browser tooltip on that element.
- The sidebar instance list truncates each entry with an ellipsis when its title overflows the available width, and exposes the full title through a native browser tooltip.
- After a server restart, the workspace default for each persisted instance is displayed immediately. Shell-provided titles are not persisted and repopulate the next time a running program in that instance emits an OSC `0` or `2` sequence.
- Title payloads that exceed the workspace-managed length bound are clamped before being broadcast, and control characters in the payload are stripped, so a malformed sequence cannot break the UI.

## Manual Verification

- Desktop browser: emit a title from the shell (e.g. `printf '\e]0;build watcher\a'`) and confirm both the topbar heading and the sidebar entry update.
- Desktop browser: emit an empty title (`printf '\e]0;\a'`) and confirm the heading returns to the workspace default.
- Desktop browser: open a workspace with at least three auto-named instances, close the middle one, and confirm the remaining instances' workspace defaults are unchanged. Create a new instance and confirm it takes the first unused integer.
- Desktop browser: emit a long shell title and confirm the topbar heading shows ellipsis truncation and the full value on hover.
- Mobile browser: emit a long shell title and confirm the topbar heading still ellipsizes without wrapping. Tooltip surfacing is not required on mobile.
- Multi-client: with two clients attached, emit a title in one client and confirm the change appears in the other.
- Reconnect: restart the server and confirm workspace defaults remain stable across the restart and shell-provided titles repopulate as programs run.

## Open Decisions

- Whether to expose a per-instance manual rename alongside this work or defer it. This spec does not require it.
