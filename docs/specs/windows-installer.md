# Windows Installer Spec

## Scope

A real Windows installer becomes the primary supported install path for TermiWeb on Windows hosts:

- A single downloadable installer executable, built with Inno Setup, that installs TermiWeb to Program Files, collects the TermiWeb app password, optionally enables before-sign-in auto-start, creates the firewall rule, and registers a normal Apps & Features uninstall entry.
- A redesign of before-sign-in auto-start registration so it never collects a Windows account password. This part applies to both the installer path and the existing portable zip layout.
- A split between binaries (Program Files) and config/state (ProgramData) so the installed app never writes under its own install directory.

Out of scope:

- Code signing. The installer ships unsigned; the distribution surface documents the SmartScreen flow instead. Signing remains a recorded future candidate in the plan.
- Windows-service hosting mode. The auto-start mechanism stays a scheduled task; service hosting remains a separate future candidate.
- Any change to the elevated-shells-only runtime posture or to non-Windows hosts.

## Motivation

Two independent users on Windows 11 could not complete the packaged-zip setup; both failures occurred immediately after setup collected their Windows account password for the auto-start task, and neither failure reproduced elsewhere (issue `#9`). The zip-plus-scripts distribution carries a family of machine-specific failure modes that are invisible on a machine where setup has already succeeded. An installer eliminates most of that family structurally, and the auto-start redesign eliminates the one that most likely caused the observed failures.

## Failure Modes This Installer Must Eliminate

Each design element below exists to kill a known failure mode of the current zip distribution:

1. Password-based scheduled-task registration fails on Windows 11 machines using Microsoft accounts with Hello-only sign-in, and PIN-only users cannot supply a valid account password at all. Eliminated by registering the auto-start task as `SYSTEM` with no stored credentials.
2. Users run `Set Up TermiWeb.cmd` from inside the zip preview in Explorer without extracting, so the script runs against a temp folder containing only itself. Eliminated by distributing a single installer executable.
3. Mark-of-the-Web on many extracted scripts triggers SmartScreen or execution-policy friction at unpredictable points mid-setup. Reduced to a single, documented SmartScreen prompt on the installer executable itself.
4. Extraction-location hazards: OneDrive-redirected folders, long paths, and per-folder permissions vary per machine. Eliminated by a fixed Program Files install location.
5. Users deny or miss the first-launch firewall prompt and LAN access silently fails. Eliminated by creating the firewall rule at install time under elevation.
6. Manual `.env` editing (copy the template, set the password) fails silently when skipped or mistyped. Eliminated by collecting the app password in the installer and writing the config for the user.

## Install Layout

- Binaries, the bundled Node runtime, built client/server output, and operational scripts install under Program Files (`%ProgramFiles%\TermiWeb`).
- Config and state live under `%ProgramData%\TermiWeb`: the `.env` file and the workspace data directory (the directory the data-dir setting names). Nothing at runtime writes under Program Files.
- Installed launch surfaces (Start Menu shortcuts and the auto-start task) run the server so that config and state resolve from the ProgramData directory. Setting the process working directory to the ProgramData directory is an acceptable mechanism, as is an explicit override; the portable zip layout must keep its current folder-relative resolution either way.
- The Start Menu group provides the equivalents of the packaged launchers: start, stop, restart, enable auto-start, and disable auto-start.

## Installer Flow

- The installer elevates once through the normal UAC consent flow and requires administrative install. There is no per-user, non-elevated install mode; the product itself requires elevation to run.
- On a fresh install, a required page collects the TermiWeb app password (non-empty) and the installer writes the ProgramData `.env` from the packaged template with that password set. The port stays at its default; changing it remains a config-file edit.
- An optional checkbox (default off, matching the current setup script's opt-in posture) enables before-sign-in auto-start. Enabling it never asks for a Windows account password.
- The installer creates an inbound firewall rule for the configured port on the private profile, named so upgrade and uninstall can find it.
- The finish page offers to start TermiWeb and open the local URL.

## Auto-Start Without a Windows Password

- The auto-start scheduled task runs as the `SYSTEM` principal with no stored credentials, triggered at startup, highest run level. Registration must succeed on machines where password validation is impossible (Hello-only or PIN-only sign-in).
- Under `SYSTEM` auto-start, the server and its spawned shells run as `SYSTEM` rather than the installing admin user. This is an accepted consequence for the before-sign-in path; the session-identity question is tracked separately in issue `#8`, and manual starts keep today's elevated-as-user behavior.
- The portable layout's enable-auto-start script adopts the same `SYSTEM` registration, so the fix for issue `#9` reaches zip users too.

## Upgrade and Uninstall

- Running a newer installer over an existing install replaces binaries, preserves the ProgramData config and workspace state, and skips the password page when a config with a password already exists.
- If an older password-based auto-start task exists at upgrade time, the installer replaces it with the `SYSTEM` task.
- Uninstalling from Apps & Features stops a running server, removes the auto-start task, the firewall rule, and the installed binaries. Config and state under ProgramData are removed only on an explicit uninstall-time choice; the default keeps them.
- Migration from an existing unpacked-zip install is documentation, not automation: the install docs describe copying the `.env` password and workspace state into ProgramData.

## Distribution Surface

- The installer executable is the primary download on the website and the GitHub release. The portable zip remains published as a secondary, clearly-labeled alternative.
- Because the installer is unsigned, the download page and the first-run docs show the SmartScreen "More info → Run anyway" flow with a screenshot, positioned where a user sees it before their first blocked launch.
- Release assembly produces both artifacts from one staged layout so the installer and the zip cannot drift apart.

## Acceptance Checks

- On a clean Windows 11 machine signed in with a Microsoft account and Hello-only sign-in, a downloaded installer completes end to end — including enabling before-sign-in auto-start — without ever prompting for a Windows account password, and TermiWeb is reachable at its configured port after a reboot with no one signed in.
- The installed app runs from Program Files with config and workspace state under ProgramData, and no runtime writes occur under Program Files.
- The auto-start task is registered as `SYSTEM` with no stored credentials, on both the installer path and the portable-zip path.
- After install, a device on the same LAN reaches the app without any firewall prompt having appeared on first launch.
- The app password collected during install is in effect on first launch; the default path requires no manual config editing.
- An upgrade install preserves the app password, port, and workspace state, and replaces any pre-existing password-based auto-start task with the `SYSTEM` task.
- After uninstall, no TermiWeb scheduled task, firewall rule, or Program Files directory remains; ProgramData contents follow the uninstall-time choice.
- The portable zip still works from any folder with folder-relative config and state, and its auto-start path never asks for a Windows account password.
- The published download page shows the SmartScreen guidance for the unsigned installer.

## Manual Verification

- Clean Windows 11 VM with a Microsoft account and Hello-only sign-in: download the installer through a browser, complete install with auto-start enabled, reboot, and attach from a phone on the same LAN before signing in on the host.
- Upgrade run: install over the previous install and confirm password, port, and workspace state survive and the task is the `SYSTEM` task afterward.
- Uninstall run: confirm the task, firewall rule, and binaries are gone, and ProgramData honored the removal choice.
- Portable regression: unpack the zip on the same machine profile, complete setup, and enable auto-start without any Windows password prompt.
- SmartScreen path: on a machine that has never seen the file, confirm the documented "More info → Run anyway" flow matches the published screenshot.

## Open Decisions

- Whether the portable zip stays published long-term or is retired once the installer has proven itself across a release cycle.
- Whether a later port change should get tooling that updates the firewall rule and task name, or stays a documented manual step.
- Whether shells spawned under `SYSTEM` auto-start need session/identity work sooner than the separate tracking in issue `#8` implies.
