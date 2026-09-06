# Terminal Bell Spec

## Scope

How TermiWeb reacts when a program running in an instance rings the terminal bell (the `BEL` byte, `\x07`), on every connected client and for every instance, including instances no client is currently viewing.

## Motivation

Today the bell byte is silently dropped (issue `#6`). Programs use the bell to say "I need you": a long build finishing, a prompt waiting for confirmation, a test run failing. With shared instances that can run unattended from a phone, that signal matters more than in a desktop terminal, because the person may be on another instance or have the phone in a pocket.

## Detection

- The server detects the bell in each instance's PTY output stream. A `BEL` byte counts as a bell only when it is not the terminator of an OSC sequence (`ESC ]` ... `BEL`), so title changes and other OSC payloads never ring. Detection state carries across output chunks, since a sequence can be split between them.
- Detection is server-side so that bells from instances no client is viewing still register, and so that history replay on attach never rings a stale bell. The xterm.js terminal keeps its built-in bell disabled and the client does not parse the bell byte itself.
- Bells are coalesced per instance: at most one bell event per instance per second. Extra bells inside that window are dropped, so a program that floods the bell cannot flood the clients.

## Attention State

- Each instance carries an `attention pending` flag, set when it rings and cleared when any client selects that instance or sends input to it. The flag is shared runtime state like the shell title: it is not persisted and a server restart clears it.
- The flag rides on the session summary, so every client renders the same pending state through the existing session list broadcast.

## Client Behavior

Every connected client reacts to every bell, whichever instance rang.

- Visual cue, always on: the ringing instance's sidebar card border does a bright double flash, in both the expanded sidebar and the collapsed rail, and if that instance is the client's active one, the terminal frame flashes as well. The flashes are short (under a second) and respect the reduced-motion preference by degrading to the static badge only.
- Attention badge: while an instance has attention pending, its sidebar entry shows a bell badge. The badge is visible in both the expanded sidebar and the collapsed rail, and it disappears when the flag clears.
- Browser tab: while any instance has attention pending, the document title carries a leading bell marker so a desktop tab shows it without being focused.
- Sound, off by default: a per-device preference enables a short synthesized tone on each bell event. The tone is generated with the Web Audio API so no asset ships. Because browsers block audio until a user gesture, the toggle itself unlocks audio when switched on, and the client also unlocks on the first gesture after load when the preference is already on. Until unlocked, bells fall back to the visual cue only.
- On coarse-pointer devices with the sound preference on, a bell also triggers a short vibration where the browser supports it.
- The sound preference is browser-local, stored alongside the existing sidebar and controls preferences, and exposed as a bell toggle button in the sidebar footer next to `Type`.

## Protocol and State Changes

- `SessionSummary` gains a boolean `attentionPending` field, default false.
- A new server event, `session/bell`, carries the ringing instance's id to every connected client. It is the live cue; the summary flag is the persistent state. A bell never requires a snapshot re-send.
- The server clears the flag on `session/select` and on `terminal/input` for that instance and broadcasts the updated summary.

## Acceptance Checks

- A bell rung in the client's active instance flashes the terminal frame and double-flashes that instance's sidebar card border on that client.
- A bell rung in an instance no client is viewing double-flashes that instance's card border and marks it with the attention badge on every connected client, in both the expanded sidebar and the collapsed rail.
- A title change or other OSC sequence does not ring the bell.
- Attaching to an instance whose history contains bell bytes does not ring the bell.
- A program that rings the bell many times per second produces at most one bell event per second for that instance.
- Selecting an instance with attention pending, or sending input to it, clears its badge on every connected client.
- While any instance has attention pending, the browser tab title shows the bell marker; when none does, the title is unchanged.
- With the sound preference off, a bell produces no audio. With it on and audio unlocked by a user gesture, each bell plays the tone; before unlock, the visual cue still appears and nothing errors.
- On a coarse-pointer device with the sound preference on, a bell vibrates where the browser supports vibration.
- The sound preference survives a page reload on the same device and does not affect other devices.
- Under the reduced-motion preference, bells show the badge without the pulse or flash.

## Manual Verification

- Desktop browser: run `[char]7` in a pwsh instance and confirm the frame flash, the card border double flash, and the badge, then press a key and confirm the badge clears.
- Desktop browser: switch to another instance, ring the bell in the first one from a second client, and confirm the badge appears on the first instance without switching.
- Desktop browser: set a title with `$host.UI.RawUI.WindowTitle = "x"` and confirm nothing rings.
- Desktop browser: reload the page on an instance whose history contains a bell and confirm nothing rings on attach.
- Desktop browser: enable the sound toggle and ring the bell; confirm the tone. Reload and confirm the toggle state persisted and the first bell after a click still plays.
- Mobile browser: with sound on, ring the bell from the workstation and confirm the phone vibrates, shows the badge, and plays the tone after its first tap.
- Mobile browser: collapse the sidebar and confirm the badge is visible on the rail card.
- Bell storm: run a loop that rings the bell fifty times in a second and confirm a single cue and no client lag.
