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
- [ ] Decide the release packaging shape.
  Choose whether `0.1` ships as a packaged folder, installer, or another Windows-first distribution form. Confirm what runtime dependencies, if any, the end user still needs on the target machine.

- [ ] Define the launch surface.
  Decide what the user actually clicks or runs after install or unpack. Ensure the hidden/background launch path is part of the supported experience, not just an advanced script.

- [ ] Define configuration expectations.
  Decide how the user sets or confirms the configured app password on first use. Decide what defaults are acceptable without forcing immediate manual editing.

- [ ] Design the first-run guidance.
  Show the local URL and LAN URL clearly. Make the user aware of the configured password and guide them to open the same live session from a second device.

- [ ] Define the first shared-session walkthrough.
  Open TermiWeb on the workstation, log in, use or create `Instance 1`, open the LAN URL from a second device, and confirm both devices are attached to the same live shell.

- [ ] Decide where the first-run guidance lives.
  Decide whether the guidance belongs in release package docs, the app UI, the website download page, or a deliberate combination.

- [ ] Package the verification artifacts.
  Cover install or unpack steps, launch steps, stop/restart steps, and the first-run two-device walkthrough.

## 4. Verification Checklist
- [ ] A fresh Windows machine or Windows user profile can start the shipped artifact without a development-oriented setup.
- [ ] The user can identify the local URL, LAN URL, and password expectations without guessing.
- [ ] The user can attach from a second device and see the same live shell.
- [ ] The documented steps match the shipped artifact exactly.
- [ ] The first-run path does not depend on hidden tribal knowledge from the repo.

## 5. Open Questions
1. What is the actual `0.1` distribution form: packaged folder, installer, or something lighter?
2. How much first-run guidance belongs in the app UI versus release docs?
3. Should the first-run flow explicitly create a new instance, or should it assume seeded `Instance 1`?
4. Do we want any convenience aid such as a QR code in `0.1`, or is that post-`0.1`?

## 6. Current Status
Created. Not yet broken into concrete implementation tasks. Waiting for the first M6 execution pass.
