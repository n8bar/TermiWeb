# M6 Installer And First-Run Experience Worklist

## Scope
This worklist covers the detailed execution layer for milestone `M6`.

`M6` includes both packaging/install/run/uninstall experience for a non-dev Windows user and first-run guidance that gets a newly installed user to one shared session visible from two devices at the same time, and also, optional boot auto-start.

Read this worklist alongside [the plan](../PLAN.md) for milestone timing and sequencing, [the product spec](../PRODUCT_SPEC.md) for product-level constraints, and [the release standard](../RELEASE_STANDARD.md) for the `0.1` quality bar.

## Desired Outcome
A Windows user should be able to install or unpack TermiWeb, launch it without a developer workflow, and understand how to reach it locally.

That same user should be able to reach their first shared live shell from a second device without having to reverse-engineer the product.

The packaged experience should also support optional boot-time startup and a clear uninstall path without turning setup into service-management complexity.

The result should feel intentional, not like a source checkout with a few extra scripts.

## 1. Work Breakdown
1. [x] Define the `0.1` release package contract.
  Capture the minimum packaging decisions needed for later install, launch, uninstall, and first-run work: release form, required shipped files, excluded repo/dev material, and any runtime assumptions the package depends on.
  The approved contract now lives in [the focused `0.1` release package contract spec](../specs/v0.1-release-package-contract.md).

2. [x] Create the third-party notices inventory before packaging.
  `THIRD_PARTY_NOTICES.md` is now generated from the installed production dependency graph by `npm run notices:third-party`, so the checked-in inventory can stay aligned with the runtime package set we expect to ship.

3. [x] Add the shipped disclaimer notice before packaging.
  Include a plain-language disclaimer file in the release materials so the packaged release does not rely on the repository license alone to communicate the no-warranty and operator-responsibility posture.
  `DISCLAIMER.md` is already in repo and the package contract now treats it as a required shipped release file.

4. [x] Define and implement the launch surface.
  Make the user-facing start, restart, and stop path obvious after install or unpack. The hidden/background launch path should be part of the supported experience, not just an advanced script.
  The packaged launch surface is now `Set Up TermiWeb.cmd`, `Start TermiWeb.cmd`, `Restart TermiWeb.cmd`, and `Stop TermiWeb.cmd`, backed by the existing hidden-run PowerShell scripts and bundled-Node-aware startup.

5. [x] Define and implement configuration expectations.
  Make it clear how the user sets or confirms the configured app password on first use. Keep `.env.example` as the product defaults, but support running a dev checkout alongside the installed pre-release by moving the dev env off the default port and any other settings that would clash.
  `.env.example` remains the product-default template, `.env.dev.example` now provides a repo-checkout coexistence template on port `32443`, and the README now states the first-run password expectation explicitly.

6. [x] Define and implement optional boot auto-start.
  For `0.1`, use Windows Task Scheduler rather than Startup-folder or service-based startup. Auto-start should target the current intended workstation user only and should not try to support ambiguous or "installing for someone else" setups.
  1. [x] Prove a true before-sign-in startup path that runs TermiWeb as the installing user rather than `SYSTEM`.
  2. [x] Define the Windows authorization path for enabling that feature, including UAC elevation and any required user-credential step.
  3. [x] Implement the packaged enable/disable launchers so a declined or failed authorization step falls back to auto-start off instead of breaking setup.
  4. [x] Verify the enable and disable flows locally, including the resulting task identity and cleanup behavior.
  Verified: task registered with `LogonType=Password` (run whether user is logged on or not) and `UserId=n8Bar` (not SYSTEM), trigger is `MSFT_TaskBootTrigger`, manual run returned exit code 0 and TermiWeb came up on the configured port, disable flow removed the task cleanly.

7. [x] Define and implement the uninstall path.
  The packaged install experience should include an obvious uninstall script or equivalent removal path. Uninstall should stop TermiWeb, and remove any startup task we created.
  `Uninstall TermiWeb.cmd` now fronts a packaged-only uninstall script that stops TermiWeb, removes the startup task if present, and refuses to run from a source checkout.

8. [x] Implement side-by-side coexistence between the dev checkout and the installed pre-release.
  Running both at once should not collide just because they share a host. Port separation is required, and auth cookie isolation should also be part of the coexistence story so the two instances do not step on each other's browser sessions.
  1. [x] Isolate browser auth cookies between local copies through port-derived cookie names.
  2. [x] Move the repo-checkout defaults off the product-default port with `.env.dev.example`.
  3. [x] Verify that an assembled packaged prerelease can run beside the repo checkout without port, cookie, launch-surface, or runtime-state collisions.
     Verified locally with the assembled package on `22443` beside the repo checkout on `2443`, including separate health endpoints, separate login cookie names, and package-local `.termiweb` state.
  4. [x] Reconcile any shared machine registrations, including optional startup-task naming, so packaged and repo copies do not stomp each other if both expose those features.
     Auto-start now uses a port-derived Task Scheduler name, so the packaged default and a repo checkout do not share one startup-task registration when both keep their supported default ports.

9. [x] Write the doc-first first-run guidance.
  For `0.1`, keep first-run guidance leaning docs-first and embedded UI guidance minimally. The UI should lean toward being self-explanatory rather than explanatory.
  `1.Start-Here.md` now carries the packaged first-run path as a release-facing doc instead of burying that guidance in the engineering docs tree.

10. [x] Write the first shared-session walkthrough.
  The walkthrough should open TermiWeb on the workstation, log in, use the seeded `Instance 1`, open the LAN URL from a second device, and confirm both devices are attached to the same live shell.
  `1.Start-Here.md` now includes that two-device `Instance 1` walkthrough directly.

11. [x] Add the tiny fallback note about `+ New Instance`.
  Mention briefly in the docs that a user can create a new instance if they closed the seeded one or want another session. Keep that note intentionally minimal.
  `1.Start-Here.md` now includes that short fallback note and keeps it deliberately minimal.

12. [x] Publish the first-run guidance in the right places.
  Bias `0.1` toward release-package docs, adding only minimal in-app guidance where it is cheap and high-value. Decide whether the website download page also needs a condensed version.
  `1.Start-Here.md` now exists at the package root, is linked from the README, and the website-condensed-version question is deferred to M7 instead of blocking M6.

13. [x] Add the repo-or-fork coexistence note once the behavior is real.
  Document changing `TERMIWEB_PORT` for users who want to maintain a repo or fork alongside an installed pre-release, but only once the coexistence story is actually complete enough to be truthful.
  The README now documents the repo-or-fork coexistence path through `.env.dev.example`, nondefault ports, cookie isolation, and startup-task naming after the packaged coexistence proof passed.

14. [x] Assemble the packaged release and its verification materials.
  Build the actual packaged folder or zip and cover install or unpack steps, launch steps, optional boot auto-start, uninstall, stop/restart steps, the disclaimer and third-party notices files, and the first-run two-device walkthrough. 
  1. [x] Add a repeatable packaging command that produces the Windows release folder and zip from the approved package contract.
  2. [x] Produce an assembled packaged prerelease from the current tree.
  3. [x] Capture the packaged verification notes for launch, restart, stop, uninstall, optional boot auto-start, and first-run doc alignment.
  Verified against assembled package on port 22443 beside the repo checkout on port 2443:
  - Launch: `Start TermiWeb.cmd` started server hidden, port 22443 listening.
  - Restart: `Restart TermiWeb.cmd` stopped the previous process and started a new one on port 22443.
  - Stop: `Stop TermiWeb.cmd` stopped the server cleanly, port 22443 released.
  - Auto-start enable: registered task `TermiWeb Auto Start` with `LogonType=Password`, `UserId=n8Bar`, `MSFT_TaskBootTrigger`, action pointing at packaged `start-hidden.ps1`.
  - Uninstall: `Uninstall TermiWeb.cmd` stopped the running server, removed the startup task, and self-deleted the package directory.

## 2. Verification Checklist
1. [x] A fresh Windows machine or Windows user profile can start the shipped release package without a development-oriented setup.
   1. [x] On the dev machine, run `npm run package:release` from the repo to produce `artifacts/release/TermiWeb-0.1.0-windows-x64.zip`. Copy that zip to the test environment.
   2. [x] On a clean Windows machine or a Windows user account that has never touched this repo, extract the zip to a working folder.
   3. [x] Double-click `Set Up TermiWeb.cmd`. Confirm a PowerShell window opens and prompts for a TermiWeb app password with no prerequisite install steps required.
   4. [x] Enter a password and proceed through setup. Confirm the script does not fail due to a missing Node runtime, missing npm, or any other dev dependency.
   5. [x] When setup asks about before-sign-in auto-start, say yes. Complete the UAC elevation and enter the Windows account password when prompted. Confirm setup continues rather than failing.
   6. [x] When setup asks whether to start TermiWeb now, confirm yes. Confirm the browser opens automatically to `http://127.0.0.1:22443` and the TermiWeb login page appears.
   7. [x] Log in with the password entered during setup. Confirm the instance rail and `Instance 1` shell are visible.
   8. [x] Reboot the machine. Without launching anything manually, confirm TermiWeb is reachable at `http://127.0.0.1:22443` after the machine comes back up.
2. [x] The shipped release package includes a third-party notices file that matches the packaged production dependency set closely enough to be truthful and reviewable.
3. [x] The shipped release package includes a plain-language disclaimer file alongside the license and third-party notices.
4. [x] Optional boot auto-start works through a startup task for the current installing user without requiring an interactive logon.
5. [x] The uninstall path removes the packaged runtime artifacts and any startup task we created without leaving the machine in a confusing state.
6. [x] The user can identify the local URL, LAN URL, and password expectations without guessing.
7. [x] The user can attach from a second device and see the same live shell.
   1. [x] With TermiWeb running on the workstation, find the workstation's LAN IP address (e.g. run `ipconfig` and look for the IPv4 address on the active adapter).
   2. [x] On a second device on the same network, open a browser and navigate to `http://<workstation-lan-ip>:22443`.
   3. [x] Confirm the TermiWeb login page loads on the second device.
   4. [x] Log in with the configured app password.
   5. [x] Confirm `Instance 1` is visible on the second device.
   6. [x] Type something in the terminal on the workstation. Confirm the same output appears in real time on the second device.
   7. [x] Type something on the second device. Confirm the same output appears on the workstation.
8. [x] A dev checkout and an installed pre-release can run side by side on the same machine without port or auth-cookie collisions.
9. [x] The documented steps match the shipped artifact exactly.
10. [x] The first-run path does not depend on hidden tribal knowledge from the repo.
