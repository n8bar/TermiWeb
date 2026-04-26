# M8 Announcement Copy

Status: Draft reusable copy for `M8` outreach.

Date: 2026-04-26

## One-Line Blurbs

General:
- TermiWeb is an open-source browser terminal for a Windows host, built for browser-based PowerShell, shared live instances, and phone-friendly controls.

Search-focused:
- Browser-based PowerShell for a Windows host, with shared live terminal instances you can use from the workstation or another device.

Direct-share:
- I shipped TermiWeb `0.1`: a free, open-source Windows browser terminal for using the same live PowerShell session from your workstation or phone without remoting the desktop.

## Short Launch Post

I shipped TermiWeb `0.1`, an open-source browser terminal for a Windows host.

It runs on your workstation, exposes authenticated browser access for localhost or a trusted private network, and lets multiple browsers attach to shared live terminal instances. The main use case is simple: keep PowerShell or Windows CLI within reach from the host, a laptop, a tablet, or a phone without remoting the whole desktop.

Current scope:
- Windows x64 package
- Browser-based PowerShell
- Shared live terminal instances
- Phone-friendly modifier/navigation/copy/paste controls
- Single configured app password
- Local/private-network-first security posture

Site: https://termiweb.com/
Source: https://github.com/n8bar/TermiWeb

## Medium Launch Post

I shipped TermiWeb `0.1`, a free and open-source browser terminal for a Windows host.

The product is aimed at a specific workflow: you have a Windows workstation doing real work, and you want terminal access from a browser without remoting the entire desktop. TermiWeb runs on the host, gives you browser-based PowerShell, and lets more than one browser attach to the same live terminal instance.

What `0.1` supports:
- A packaged Windows x64 install/run surface.
- Shared live terminal instances in the browser.
- PowerShell 7 preference with Windows PowerShell fallback.
- Phone-friendly controls for terminal-essential keys, selection, copy, and paste.
- Authenticated browser sessions using one configured app password.
- Localhost, LAN, and trusted-private-network use by default.

What it is not:
- Not SSH hosting.
- Not a remote desktop replacement.
- Not a public-internet security product by itself.
- Not a team/fleet authorization system.

If your setup includes a Windows host you want to reach from another browser on your private network, this is the first release to try.

Download: https://termiweb.com/download/
Source: https://github.com/n8bar/TermiWeb

## Long Launch Writeup Draft

# TermiWeb `0.1`: Browser-Based PowerShell For A Windows Host

TermiWeb `0.1` is the first public release of a browser terminal for a Windows host.

The goal is not to replace SSH, remote desktop, or a full remote-access stack. The goal is narrower: keep a real Windows terminal session available through a browser so you can use the same live shell from the workstation or another device.

## Why This Exists

I wanted a workstation-first terminal workflow that still works when I step away from the desk. Remote desktop is heavier than needed when the task is terminal-only. SSH is not the natural default for every Windows workstation. A cloud relay or public tunnel is not the right default security posture for a local tool.

TermiWeb starts from a simpler assumption:
- one Windows host
- one trusted operator or small trusted group
- localhost, LAN, or another private network
- browser UI as the session of record

## What The First Release Does

The `0.1` release includes:
- Browser-based PowerShell on a Windows host.
- Shared live terminal instances that more than one browser can attach to.
- A packaged Windows x64 setup/start/stop/uninstall surface.
- Phone-friendly terminal controls for modifiers, navigation, copy, and paste.
- A shared per-instance terminal width so the same shell stays predictable across devices.
- A single configured app password suitable for trusted private deployments.

## What It Does Not Claim

TermiWeb `0.1` does not include built-in TLS, a full account system, multi-user authorization, SSH, relay hosting, or session resurrection after server restart.

WAN exposure is possible only as an operator-managed deployment pattern. If you put it on the internet, you own the surrounding TLS, auth, ingress, VPN, mesh, or equivalent controls.

## Who Should Try It

Try it if you have a Windows host and want browser-based PowerShell or Windows CLI access from another trusted device on your network.

Skip it if you need enterprise remote access, a public web SSH service, browser-based Linux server management, or a team collaboration terminal with link sharing and per-user permissions.

Download: https://termiweb.com/download/
Source: https://github.com/n8bar/TermiWeb

## Show HN Candidate

Title:
- Show HN: TermiWeb - browser-based PowerShell for a Windows host

Post:
- I built TermiWeb, an open-source browser terminal for a Windows host.
- It runs on the workstation, exposes authenticated browser access for localhost/LAN/trusted private networks, and lets multiple browsers attach to the same live PowerShell instance.
- The main use case is terminal access from another device without remoting the whole desktop.
- The `0.1` release is intentionally narrow: Windows x64 package, browser-based PowerShell, shared live instances, phone-friendly controls, and single-password auth for private deployments.
- It is not SSH hosting, not a remote desktop replacement, and not a complete public-internet security layer by itself.
- Site: https://termiweb.com/
- Source: https://github.com/n8bar/TermiWeb
