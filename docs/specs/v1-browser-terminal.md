# V1 Browser Terminal Spec

## Scope

V1 delivers a browser-based Windows terminal that supports:

- shared login with a single configured password
- multiple shared instances
- concurrent client input into the same live terminal
- touch-friendly control access for phones
- local/LAN deployment only

## Session Model

- Shared instances are global to the app instance.
- Instances persist across app restarts as lightweight metadata only.
- An instance starts a fresh shell when activated if no live process exists.
- Output history is replayed to newly attached clients so a second browser can catch up to the current terminal buffer.
- The workspace's last active instance should be the default attach target for newly connected clients that do not already have a local selection.
- After that initial attach, each device keeps its own selected instance until the user changes it or the instance disappears.

## Terminal UX

- All devices use the same web interface.
- The browser UI should keep one shared layout model across device classes and prefer horizontal overflow over rearranging major panels into a different mobile-specific structure.
- The overall page should still fit within the browser viewport by default; horizontal overflow should stay local to the terminal surface or other narrow components rather than making the whole app an oversized canvas.
- On phones and other narrow browsers, the page should default to a desktop-style layout viewport so users are not forced to enable the browser's separate "Desktop Site" setting just to get a zoomed-out overview.
- That desktop-style viewport should not force a fixed initial scale; the browser should be allowed to choose the initial zoomed-out fit.
- The host/connection header and the active-terminal header should be merged into one header row outside the scaled workspace stage.
- The active terminal instance is rendered with `xterm.js`.
- The UI labels shared shells as instances rather than tabs.
- The current machine hostname is visible before and after login.
- The instance rail can collapse horizontally into a narrow action-first layout that preserves minimal instance identity and close controls.
- In collapsed mode, the instance close control must remain physically separate from the instance card hit target.
- The sidebar collapse state is local to each browser and must not sync through shared session metadata.
- If no local sidebar preference exists for a browser, narrow viewports should auto-collapse the sidebar by default.
- New instances start in the user's home directory rather than the repository working directory.
- Terminal width stays fixed at 80 columns across clients so switching devices does not change line wrapping.
- The sidebar stays outside the scaled stage so instance controls remain finger-sized.
- The right-hand workspace stage should top-align within its viewport and should never present narrower than a 4:3 aspect ratio.
- Mobile controls must expose at least `Ctrl`, `Alt`, `Esc`, `Tab`, `Enter`, `Backspace`, and arrow keys.
- Mobile controls must also expose a `Del` key.
- Mobile controls must also expose `Home` and `End`.
- Modifier controls must allow key combos to be composed from a phone.
- `Ctrl` and `Alt` should arm for the next key on single tap, lock on double tap, and clear on a later tap when locked.
- Arrow-key controls should look like a compact cursor-key cluster rather than text buttons.
- `Home` should sit above `←` and `End` should sit above `→` in that cluster.
- The main control strip should stay dense enough to fit roughly twice the current button count per row when space allows.
- A select mode must exist so touch devices can copy terminal text reliably.
- Select mode should replace the terminal viewport in-place with a read-only monospace text view derived from the rendered terminal buffer instead of the raw PTY stream.
- The select snapshot should reflect what is currently visible in the terminal buffer, so text cleared by commands like `cls` does not reappear there.

## Security

- Access requires a configured shared password.
- HTTP session state is cookie-based in v1.
- WebSocket upgrades require a valid authenticated browser session.
- Runtime configuration can come from process environment or a repo-root `.env` file.
- LAN binding is enabled by default when no explicit `TERMIWEB_HOST` is set.

## Testing Guidance

- Use test-first development for pure logic and protocol boundaries.
- Use exploratory integration work for PTY/browser wiring, then backfill tests where stable seams emerge.
- Maintain a manual verification path for multi-client shared typing and mobile control behavior.
