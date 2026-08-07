# M2 Shared Terminal Backend And Session Model

Milestone Timing: Mirrors `M2` in [Project plan](../PLAN.md): start `2026-04-06`, end `2026-04-06` (completed same-day).

Status: Completed on 2026-04-06. Reconstructed retroactively on 2026-08-06 from git history and the changelog; the worklist convention did not exist yet during this milestone, and `M1`-`M3` all landed inside the same day of overlapping commits. Task boundaries here follow the plan's thematic split, not a contemporaneous record.

## Desired Outcome

TermiWeb should leave `M2` with the server side of the shared-terminal model as real code paths instead of placeholders: a PTY/session manager for Windows shells, a client-server protocol for shared terminal I/O and instance lifecycle, app-password auth with cookie-backed sessions, and lightweight workspace persistence that stores session metadata without claiming session resurrection.

## 1. Work Breakdown

1. [x] Implement the server-side PTY/session manager for shared Windows shells.
   1. [x] Back shell sessions with ConPTY so interactive Windows CLIs run in a real pseudo-terminal.
   2. [x] Start shells in the user's home directory instead of the server's working directory.
   3. [x] Settle the shell resolution precedence.
      1. [x] First hardening pass: prefer the default PowerShell 7 install path before PATH-based fallback.
      2. [x] Corrected precedence: PowerShell 7 from `PATH` wins, the default install path is the fallback, and Windows PowerShell remains the final fallback so machines without PowerShell 7 still work.

2. [x] Define the client-server protocol for shared terminal I/O and instance lifecycle.
   1. [x] Carry instance creation, attach/select, and close as websocket events.
   2. [x] Stream shared terminal input and output so every attached client sees the same live session.
   3. [x] Handle terminal resize as a protocol-level event with validation.
   4. [x] Broadcast shared-active-instance metadata so clients know the workspace state.

3. [x] Implement app-password auth and cookie-backed browser sessions.
   1. [x] Gate the workspace behind the single configured app password.
   2. [x] Issue cookie-backed sessions so an authenticated browser stays signed in across page loads.

4. [x] Add lightweight workspace persistence for session metadata.
   1. [x] Persist instance metadata so the workspace structure survives a restart.
   2. [x] Keep the persistence posture honest: metadata only, no claim of resurrecting live shell processes.
      Decision: this is the v1 no-resurrection contract the product spec still holds.

5. [x] Make LAN access work as a first-class access model.
   1. [x] Fix LAN host resolution so `TERMIWEB_ALLOW_LAN=true` works with the sample config.
   2. [x] Make LAN binding the default path so a phone on the same network can reach the host copy without extra configuration.

## 2. Verification Checklist

1. [x] Instance creation, attach/select, close, and shared terminal I/O exist as real server code paths exercised from the browser client.
2. [x] Two clients attached to the same instance observe the same live terminal output.
3. [x] The workspace is unreachable without the configured app password, and an authenticated browser session survives page reloads.
4. [x] Restarting the server preserves only lightweight session metadata, consistent with the documented no-resurrection contract.
5. [x] A shell starts on a machine without PowerShell 7 installed via the Windows PowerShell fallback.
