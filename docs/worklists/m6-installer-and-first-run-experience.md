# 1. M6 Installer And First-Run Experience Worklist

## 2. Scope
1. This worklist covers the detailed execution layer for milestone `M6`.
2. `M6` includes both:
   1. packaging/install/run experience for a non-dev Windows user
   2. first-run guidance that gets a newly installed user to one shared session visible from two devices at the same time
3. This worklist does not replace the product docs or release standard.

## 3. Desired Outcome
1. A Windows user should be able to install or unpack TermiWeb, launch it without a developer workflow, and understand how to reach it locally.
2. That same user should be able to reach their first shared live shell from a second device without having to reverse-engineer the product.
3. The result should feel intentional, not like a source checkout with a few extra scripts.

## 4. Work Breakdown
1. Decide the release packaging shape.
   1. Choose whether `0.1` ships as a packaged folder, installer, or another Windows-first distribution form.
   2. Confirm what runtime dependencies, if any, the end user still needs on the target machine.
2. Define the launch surface.
   1. Decide what the user actually clicks or runs after install/unpack.
   2. Ensure the hidden/background launch path is part of the supported experience, not just an advanced script.
3. Define configuration expectations.
   1. Decide how the user sets or confirms the configured app password on first use.
   2. Decide what defaults are acceptable without forcing immediate manual editing.
4. Design the first-run guidance.
   1. Show the local URL and LAN URL clearly.
   2. Make the user aware of the configured password.
   3. Guide them to open the same live session from a second device.
5. Define the first shared-session walkthrough.
   1. Open TermiWeb on the workstation.
   2. Log in.
   3. Use or create `Instance 1`.
   4. Open the LAN URL from a second device.
   5. Confirm both devices are attached to the same live shell.
6. Decide where that guidance lives.
   1. Release package docs
   2. app UI
   3. website download page
   4. or a deliberate combination
7. Package verification artifacts.
   1. install/unpack steps
   2. launch steps
   3. stop/restart steps
   4. first-run/two-device walkthrough

## 5. Verification Checklist
1. A fresh Windows machine or Windows user profile can start the shipped artifact without a development-oriented setup.
2. The user can identify the local URL, LAN URL, and password expectations without guessing.
3. The user can attach from a second device and see the same live shell.
4. The documented steps match the shipped artifact exactly.
5. The first-run path does not depend on hidden tribal knowledge from the repo.

## 6. Open Questions
1. What is the actual `0.1` distribution form: packaged folder, installer, or something lighter?
2. How much first-run guidance belongs in the app UI versus release docs?
3. Should the first-run flow explicitly create a new instance, or should it assume seeded `Instance 1`?
4. Do we want any convenience aid such as a QR code in `0.1`, or is that post-`0.1`?

## 7. Current Status
1. Created.
2. Not yet broken into concrete implementation tasks.
3. Waiting for the first M6 execution pass.
