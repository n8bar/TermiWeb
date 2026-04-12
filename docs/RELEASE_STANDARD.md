# Release Standard

## Purpose

Dogfooding alone is not the release bar.

`0.1` should ship when TermiWeb is polished enough to feel trustworthy and professional for the workflows it explicitly claims to support.

## 0.1 Release Standard

### 1. Core Workflow Reliability

These flows should work repeatedly without surprises:

- login and logout
- create, select, and close instances
- shared typing into the same live terminal
- copy and select mode
- keyboard tray collapse and restore
- hidden start, restart, and stop on Windows
- reconnect-after-restart page recovery

### 2. Cross-Device Stability

Workstation and phone use should be stable in real use:

- attached devices can share an instance cleanly
- device-local UI state stays device-local
- mobile controls stay usable
- scaling stays coherent across workstation and phone browsers

### 3. Rendering Integrity

Normal interactive terminal use must not look broken or dirty.

- screen updates should stay visually coherent
- interactive CLI tools should not regularly leave ghost text or corrupt the viewport
- cosmetic rendering glitches that make the terminal feel untrustworthy are release blockers for `0.1`

### 4. Windows Operational Experience

The Windows run story should feel intentional:

- the app can be started, restarted, and stopped predictably
- hidden/background launch should not spawn an extra empty console window
- logs should exist and be usable
- the documented LAN access path should work

### 5. Security And Documentation Honesty

The release should be clear about what it is and is not:

- trusted-network-first default is explicit
- advanced operator-managed WAN guidance is explicit
- docs do not imply built-in security or hosting features that do not exist

### 6. Findings Discipline

Open findings should be under control:

- no open trust-breaking or high-severity findings
- remaining open findings should be polish-level, not core correctness failures

### 7. Dogfood Duration

The app should survive real use before release:

- enough real usage to expose recurring friction
- findings should trend toward polish rather than architecture or correctness problems

## Current Assessment

TermiWeb is close to a `0.1` release candidate, but not there yet.

### Current Strengths

- core shared-session workflow exists and is usable
- cross-device use is materially better than the first working build
- Windows background launch is now cleaner
- `0.1` release polish has materially improved the dogfoodability of the product rather than just adding cosmetic churn
- docs are much more honest and directionally aligned than they were at bootstrap

### Current Risks

- `Finding 5` is the most serious known release risk right now:
  - interactive CLI rendering can still place typed text and generated output in the wrong place, leave ghost text behind, and shift visible terminal content in ways that make primary CLI workflows feel untrustworthy

## Out Of Scope For 0.1

These are not required to call `0.1` complete:

- password-change UI
- browser-session instances
- Brave profile or sync integration
- a full MSI-style installer

## Preferred 0.1 Packaging Direction

A full installer is not required for `0.1`, but the Windows release story should be cleaner than a pure development workflow.

At minimum:

- the release should not depend on users discovering ad hoc terminal commands
- hidden/background launch should be documented and usable

Preferred:

- a packaged Windows distribution that does not require a development-oriented setup
