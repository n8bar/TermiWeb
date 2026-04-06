# V1 Browser Terminal Spec

## Scope

V1 delivers a browser-based Windows terminal that supports:

- shared login with a single configured password
- multiple workspace tabs
- concurrent client input into the same live terminal
- touch-friendly control access for phones
- local/LAN deployment only

## Session Model

- Workspace tabs are global to the app instance.
- Tabs persist across app restarts as lightweight metadata only.
- A tab starts a fresh shell when activated if no live process exists.
- Output history is replayed to newly attached clients so a second browser can catch up to the current terminal buffer.

## Terminal UX

- Desktop and phone use the same web interface.
- The active terminal tab is rendered with `xterm.js`.
- Mobile controls must expose at least `Ctrl`, `Alt`, `Esc`, `Tab`, `Enter`, `Backspace`, and arrow keys.
- Sticky modifiers must allow key combos to be composed from a phone.

## Security

- Access requires a configured shared password.
- HTTP session state is cookie-based in v1.
- WebSocket upgrades require a valid authenticated browser session.
- Runtime configuration can come from process environment or a repo-root `.env` file.
- LAN binding is enabled by setting `TERMIWEB_ALLOW_LAN=true` when no explicit `TERMIWEB_HOST` is set.

## Testing Guidance

- Use test-first development for pure logic and protocol boundaries.
- Use exploratory integration work for PTY/browser wiring, then backfill tests where stable seams emerge.
- Maintain a manual verification path for multi-client shared typing and mobile control behavior.
