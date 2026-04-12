# M6 Installer And First-Run Experience Worklist

## 1. Scope
This worklist covers the detailed execution layer for milestone `M6`.

`M6` includes both packaging/install/run experience for a non-dev Windows user and first-run guidance that gets a newly installed user to one shared session visible from two devices at the same time.

This worklist does not replace the product docs or release standard.

## 2. Desired Outcome
A Windows user should be able to install or unpack TermiWeb, launch it without a developer workflow, and understand how to reach it locally.

That same user should be able to reach their first shared live shell from a second device without having to reverse-engineer the product.

The result should feel intentional, not like a source checkout with a few extra scripts.

## 3. Work Breakdown
1. [ ] Build the `0.1` release packaging shape.
  Ship a packaged Windows folder or zip with the built app, bundled runtime, required dependencies, and simple launchers. The source repo remains the real hacker and developer surface.

2. [ ] Define and implement the launch surface.
  Make the user-facing start, restart, and stop path obvious after install or unpack. The hidden/background launch path should be part of the supported experience, not just an advanced script.

3. [ ] Define and implement configuration expectations.
  Make it clear how the user sets or confirms the configured app password on first use. Choose defaults that do not force unnecessary manual editing.

4. [ ] Write the doc-first first-run guidance.
  For `0.1`, keep first-run guidance doc-heavy and embedded UI guidance minimal. The UI should lean toward being self-explanatory rather than explanatory.

5. [ ] Write the first shared-session walkthrough.
  The walkthrough should open TermiWeb on the workstation, log in, use the seeded `Instance 1`, open the LAN URL from a second device, and confirm both devices are attached to the same live shell.

6. [ ] Add the tiny fallback note about `+ New Instance`.
  Mention briefly in the docs that a user can create a new instance if they closed the seeded one or want another session. Keep that note intentionally minimal.

7. [ ] Publish the first-run guidance in the right places.
  Bias `0.1` toward release-package docs, adding only minimal in-app guidance where it is cheap and high-value. Decide whether the website download page also needs a condensed version.

8. [ ] Package the verification artifacts.
  Cover install or unpack steps, launch steps, stop/restart steps, and the first-run two-device walkthrough. Do not add QR codes or similar convenience aids in `0.1` unless a real failure proves they are needed.

## 4. Verification Checklist
1. [ ] A fresh Windows machine or Windows user profile can start the shipped artifact without a development-oriented setup.
2. [ ] The user can identify the local URL, LAN URL, and password expectations without guessing.
3. [ ] The user can attach from a second device and see the same live shell.
4. [ ] The documented steps match the shipped artifact exactly.
5. [ ] The first-run path does not depend on hidden tribal knowledge from the repo.

## 5. Current Status
Created. The M6 direction is now baked into the task wording instead of being tracked as fake completed decision items. Remaining work is execution detail, packaging detail, and writing the actual first-run flow.
