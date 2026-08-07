# M4 Local Verification And Launch Polish

Milestone Timing: Mirrors `M4` in [Project plan](../PLAN.md): start `2026-04-07`, end `2026-04-07` (completed same-day).

Status: Completed on 2026-04-07. Reconstructed retroactively on 2026-08-06 from git history and the changelog; the worklist convention did not exist yet during this milestone. Some restart/reconnect and findings-loop work landed late on 2026-04-06 and is claimed here thematically, matching the plan's summary of `M4`.

## Desired Outcome

TermiWeb should leave `M4` behaving like an intentional local app instead of a dev-only prototype: a working findings-driven verification loop, restart/reconnect behavior that live pages survive, a launch path that does not require a developer console, and deployment docs that describe the real trust posture.

## 1. Work Breakdown

1. [x] Consolidate the findings-driven verification loop as the working discipline.
   1. [x] Treat the findings log as the intake for every dogfood issue instead of fixing observations ad hoc.
   2. [x] Batch recorded findings into deliberate fix passes, the loop that carried every later milestone's polish work.

2. [x] Tighten restart/reconnect behavior.
   1. [x] Replace the restart-time websocket reconnect flap with server-recovery polling.
   2. [x] Make live pages wait for the server to come back and refresh themselves once it does, so a restart no longer strands attached browsers.

3. [x] Clean up the launch/run path for real local use.
   1. [x] Add hidden Windows background start scripts so TermiWeb launches without spawning an extra empty console window.
   2. [x] Add the matching hidden restart path so bouncing the server is one action instead of a stop/start dance.

4. [x] Reframe the deployment docs around the real trust posture.
   1. [x] Reframe TermiWeb as a workstation-first tool with deployment-philosophy guidance: trusted-network defaults plus operator-managed remote deployments.
   2. [x] Correct the follow-up overreach so careful WAN exposure reads as a legitimate advanced use case rather than a forbidden one, while keeping the `0.1` security boundaries explicit.
   3. [x] Align the `0.1` specs with that direction without claiming unshipped features.

5. [x] Continue interaction polish through the dogfood loop.
   1. [x] Add a collapsible keyboard control tray with a per-browser preference so users can trade control-panel space for visible terminal rows.
   2. [x] Move the tray collapse handle onto the terminal/tray seam so it stops spending a dedicated header row, then polish the seam toggle.
   3. [x] Document an isolated single-tab `Browser Session` as a possible `0.2` instance type without committing to browser-profile or sync integration.

## 2. Verification Checklist

1. [x] A server restart no longer strands attached browsers; pages recover on their own once the server returns.
2. [x] TermiWeb starts for daily local use without a visible developer console window.
3. [x] The deployment docs match the actual shipped posture: trusted-network default, operator-managed WAN as an advanced path, no unshipped claims.
4. [x] The findings log is the active intake for dogfood issues, with fixes batched deliberately.
