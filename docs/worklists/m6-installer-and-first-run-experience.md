# M6 Installer And First-Run Experience Worklist

## 1. Scope
This worklist covers the detailed execution layer for milestone `M6`.

`M6` includes both packaging/install/run/uninstall experience for a non-dev Windows user and first-run guidance that gets a newly installed user to one shared session visible from two devices at the same time, and also, optional boot auto-start.

Read this worklist alongside [the plan](../PLAN.md) for milestone timing and sequencing, [the product spec](../PRODUCT_SPEC.md) for product-level constraints, and [the release standard](../RELEASE_STANDARD.md) for the `0.1` quality bar.

## 2. Desired Outcome
A Windows user should be able to install or unpack TermiWeb, launch it without a developer workflow, and understand how to reach it locally.

That same user should be able to reach their first shared live shell from a second device without having to reverse-engineer the product.

The packaged experience should also support optional boot-time startup and a clear uninstall path without turning setup into service-management complexity.

The result should feel intentional, not like a source checkout with a few extra scripts.

## 3. Work Breakdown
1. [ ] Build the `0.1` release packaging basic structure.
  Ship a packaged Windows folder or zip with the built app, bundled runtime, required dependencies, and simple launchers. The source repo remains the real hacker and developer surface.

2. [ ] Create the third-party notices inventory before packaging.
  Add and maintain a third-party notices file for the shipped production dependencies so the release package has a clear licensing and attribution surface before we finalize the installer artifact.

3. [ ] Add the shipped disclaimer notice before packaging.
  Include a plain-language disclaimer file in the release materials so the packaged artifact does not rely on the repository license alone to communicate the no-warranty and operator-responsibility posture.

4. [ ] Define and implement the launch surface.
  Make the user-facing start, restart, and stop path obvious after install or unpack. The hidden/background launch path should be part of the supported experience, not just an advanced script.

5. [ ] Define and implement optional boot auto-start.
  For `0.1`, use Windows Task Scheduler rather than Startup-folder or service-based startup. Auto-start should target the current intended workstation user only and should not try to support ambiguous or "installing for someone else" setups.

6. [ ] Define and implement the uninstall path.
  The packaged install experience should include an obvious uninstall script or equivalent removal path. Uninstall should stop TermiWeb, and remove any startup task we created.

7. [ ] Define and implement configuration expectations.
  Make it clear how the user sets or confirms the configured app password on first use. Keep `.env.example` as the product defaults, but support running a dev checkout alongside the installed pre-release by moving the dev env off the default port and any other settings that would clash.

8. [ ] Implement side-by-side coexistence between the dev checkout and the installed pre-release.
  Running both at once should not collide just because they share a host. Port separation is required, and auth cookie isolation should also be part of the coexistence story so the two instances do not step on each other's browser sessions.

9. [ ] Write the doc-first first-run guidance.
  For `0.1`, keep first-run guidance leaning docs-first and embedded UI guidance minimally. The UI should lean toward being self-explanatory rather than explanatory.

10. [ ] Write the first shared-session walkthrough.
  The walkthrough should open TermiWeb on the workstation, log in, use the seeded `Instance 1`, open the LAN URL from a second device, and confirm both devices are attached to the same live shell.

11. [ ] Add the tiny fallback note about `+ New Instance`.
  Mention briefly in the docs that a user can create a new instance if they closed the seeded one or want another session. Keep that note intentionally minimal.

12. [ ] Publish the first-run guidance in the right places.
  Bias `0.1` toward release-package docs, adding only minimal in-app guidance where it is cheap and high-value. Decide whether the website download page also needs a condensed version.

13. [ ] Add the repo-or-fork coexistence note once the behavior is real.
  Document changing `TERMIWEB_PORT` for users who want to maintain a repo or fork alongside an installed pre-release, but only once the coexistence story is actually complete enough to be truthful.

14. [ ] Package the verification artifacts.
  Cover install or unpack steps, launch steps, optional boot auto-start, uninstall, stop/restart steps, the disclaimer and third-party notices payloads, and the first-run two-device walkthrough. 

## 4. Verification Checklist
1. [ ] A fresh Windows machine or Windows user profile can start the shipped artifact without a development-oriented setup.
2. [ ] The shipped artifact includes a third-party notices file that matches the packaged production dependency set closely enough to be truthful and reviewable.
3. [ ] The shipped artifact includes a plain-language disclaimer file alongside the license and third-party notices.
4. [ ] Optional boot auto-start works through a startup task for the current installing user without requiring an interactive logon.
5. [ ] The uninstall path removes the packaged runtime artifacts and any startup task we created without leaving the machine in a confusing state.
6. [ ] The user can identify the local URL, LAN URL, and password expectations without guessing.
7. [ ] The user can attach from a second device and see the same live shell.
8. [ ] A dev checkout and an installed pre-release can run side by side on the same machine without port or auth-cookie collisions.
9. [ ] The documented steps match the shipped artifact exactly.
10. [ ] The first-run path does not depend on hidden tribal knowledge from the repo.
