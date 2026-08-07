# M3 Browser UI With Instances, Auth, And Mobile Controls

Milestone Timing: Mirrors `M3` in [Project plan](../PLAN.md): start `2026-04-06`, end `2026-04-06` (completed same-day).

Status: Completed on 2026-04-06. Reconstructed retroactively on 2026-08-06 from git history and the changelog; the worklist convention did not exist yet during this milestone, and `M1`-`M3` all landed inside the same day of overlapping commits. Task boundaries here follow the plan's thematic split, not a contemporaneous record.

## Desired Outcome

TermiWeb should leave `M3` with a browser client that both a desktop and a phone can use against the same live instance: a login flow, an instance rail with lifecycle controls, xterm.js terminal integration, and a first genuinely usable mobile control surface for modifiers, navigation keys, and copy/paste.

## 1. Work Breakdown

1. [x] Build the browser client core.
   1. [x] Build the login flow against the configured app password.
   2. [x] Build the workspace layout with clear host identity so users know which machine they are attached to.
   3. [x] Wire xterm.js to the active instance's shared I/O stream.
   4. [x] Add icon-based refresh and collapse controls to the workspace chrome.

2. [x] Build the instance rail and lifecycle UI.
   1. [x] Adopt `Instance` terminology and build the collapsible instance rail.
   2. [x] Make instance selection device-local.
      1. [x] Stop cross-device instance auto-following so each browser picks its own active instance.
      2. [x] Make sidebar collapse state local to each browser instead of shared.
   3. [x] Separate instance close buttons from the card hit targets so closing is never an accidental tap.
   4. [x] Stabilize automatic instance naming.
      1. [x] Reuse the lowest available auto-generated instance number.
      2. [x] Normalize legacy `Terminal`-style names forward to `Instance` naming.
   5. [x] Tighten the collapsed rail: narrower width, enlarged rail targets, and collapse/refresh actions stacked vertically.

3. [x] Build the first mobile control surface.
   1. [x] Build the keyboard-style control tray and settle its key arrangement at Esc/Bksp/Del, Tab/Select/Copy, and Ctrl/Alt/Paste with Enter under the cursor cluster.
   2. [x] Build the cursor cluster with arrow keys, then add `Home` and `End` above the left and right arrows, and expose a `Del` key for mobile use.
   3. [x] Design the modifier semantics for touch.
      Decision: a single tap arms `Ctrl`/`Alt` for the next key, a double tap locks the modifier, and the buttons visibly distinguish armed and locked states.
   4. [x] Add a select mode for copying terminal text, switched to a rendered viewport snapshot so selection is stable while shared output keeps flowing.
   5. [x] Move control activation off synthetic mobile click handling onto direct touch/pointer events, with taller keys for reliable touch targets.

4. [x] Converge desktop and phones on one shared layout.
   1. [x] Remove the separate mobile layout in favor of one cross-device layout with doubled control density per row.
   2. [x] Settle the mobile viewport strategy.
      1. [x] Remove page-level forced workspace width so phones fit the UI to the viewport again.
      2. [x] Switch to desktop-style viewport metadata so phones behave like desktop-site mode without a per-device browser toggle.
      3. [x] Drop the forced `initial-scale` so browsers choose their own initial zoomed-out fit.
   3. [x] Shape the workspace stage: a top-aligned 4:3-aware stage first, then width-first behavior that keeps full width and trims height instead of scaling everything down.
   4. [x] Keep the keyboard tray finger-sized: place it outside the scaled stage, then move it inside the outer terminal shell once row heights matched the cursor cluster.
   5. [x] Tie the workspace shell to the live visual-viewport height so controls stay above the on-screen keyboard.
   6. [x] Settle the shared terminal width default.
      Decision path: fixed `120` columns, then `40`, settling at `80` columns as the durable default.

5. [x] Start the dogfood findings loop.
   1. [x] Add the findings log and adopt the batch-fix workflow for recorded findings.
   2. [x] Fix the first findings batch.
      1. [x] Make on-screen navigation keys application-cursor aware.
      2. [x] Stabilize touch control focus and viewport refits.
      3. [x] Switch to a single solid terminal cursor.
      4. [x] Auto-seed `Instance 1` when a login reaches an empty workspace.
   3. [x] Tighten the batch: give on-screen `Home`/`End` a fallback sequence path and reapply the fitted viewport scale after orientation changes.

## 2. Verification Checklist

1. [x] A desktop browser and a phone browser can both sign in and attach to the same live instance through the browser UI.
2. [x] Mobile modifiers, navigation keys, and paste are usable through the on-screen control tray without a hardware keyboard.
3. [x] Select mode allows copying terminal text from a touch device.
4. [x] Instance create, select, and close work from the rail in both expanded and collapsed states.
5. [x] Dogfood issues are being captured in the findings log instead of being lost.
