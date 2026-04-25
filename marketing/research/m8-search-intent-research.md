# M8 Search Intent Research

Status: Draft research snapshot. Review before treating this as approved `M8` direction.

Date: 2026-04-24

Question: What search intent should the live TermiWeb homepage target first, and which phrases look realistic for the current product to compete on?

## Scope

This pass focuses on the shipped `0.1` product and the current public website, not hypothetical later features. The goal is to find a realistic first search position for the homepage, not to produce a full long-term content strategy in one pass.

## Method

- Reviewed current search-result mixes for query families around:
  - browser terminal / web terminal
  - browser terminal for Windows / PowerShell in browser
  - collaborative or shared terminal in the browser
- Opened and sampled the current positioning of the most relevant results.
- Looked for:
  - what problem those pages claim to solve
  - what vocabulary they lead with
  - whether they target SSH, enterprise remote access, automation, collaboration, or local/self-hosted workflows
  - where the current TermiWeb product obviously fits or obviously does not fit

## What The Search Results Look Like

### Broad browser-terminal terms are crowded and skew remote

Broad terms like `browser terminal`, `web terminal`, and related queries are mostly occupied by products that promise remote access, SSH, or cloud-hosted terminal workflows.

Observed examples:
- [MyTermWeb](https://mytermweb.com/) leads with access from anywhere, firewall bypassing, and relay-server language.
- [Coder Web Terminal docs](https://coder.com/docs/user-guides/workspace-access/web-terminal) frame the browser terminal as workspace access inside a broader hosted development product.
- [CloudSSH](https://cloudssh.io/) and similar products frame the browser terminal as secure SSH access, often paired with file transfer or remote admin features.

Implication:
- TermiWeb should not try to win the broad `web terminal` or `browser terminal` category head-on with the current one-page site.
- Those terms attract expectations around SSH, hosted relays, cloud workspaces, or internet-facing remote access that do not match TermiWeb's current public story.

### Windows-specific browser-terminal terms are more promising

When the search language becomes Windows-specific or PowerShell-specific, the field narrows and the positioning becomes more relevant to TermiWeb.

Observed examples:
- [ShellAccess](https://shellaccess.io/) leads with `browser-based PowerShell` for managed Windows estates.
- [Termio](https://termio.soft-jp.com/) leads with `Your Windows CLI, right in the browser` and `A terminal server for Windows — operated from any browser`.
- [PowerShell Universal](https://powershelluniversal.com/) includes in-browser terminals, but as one part of a much larger automation platform.
- [Windows PowerShell Web Access](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/hh831417%28v%3Dws.11%29) shows that there is long-standing search intent around PowerShell in a browser, even if the specific product path is older.

Implication:
- The strongest immediate search opportunity is not generic `web terminal`.
- It is closer to:
  - browser terminal for Windows
  - browser-based PowerShell
  - PowerShell in the browser
  - Windows CLI in the browser

### Shared-terminal terms are real, but they lean collaborative

Queries around `shared terminal`, `collaborative terminal`, and similar language do surface relevant products, but they usually emphasize multiplayer collaboration or shared links.

Observed examples:
- [sshx](https://sshx.io/) leads with `A secure web-based, collaborative terminal` and link-sharing collaboration.
- [Devsession terminal sharing](https://devsession.is/terminal-sharing/) leads with collaboration across any terminal or browser.
- [Oracle Shared Shell](https://www.oracle.com/support/shared-shell.html) is explicitly framed as a shared support collaboration tool.

Implication:
- `shared terminal` is still useful vocabulary for TermiWeb, but it should not be the only or primary homepage position.
- If the homepage leads too hard with collaboration language, it risks implying multi-user/shared-control features that are stronger in tools like sshx than in the current `0.1` product.

## What Looks Like The Best Homepage Target

The homepage should target the Windows-hosted, browser-based terminal angle first.

Best first-position framing:
- browser-first terminal for a Windows host
- Windows terminal or PowerShell in the browser
- use the same live shell from the host or another device without remoting the whole desktop

That aligns with:
- the actual shipped `0.1` product
- the current public website
- the Terms and product boundaries we can defend honestly

## Recommended Phrase Cluster

### Primary phrase family

These are the phrases most worth supporting on the homepage now:
- browser terminal for Windows
- browser-based PowerShell
- PowerShell in the browser
- Windows CLI in the browser
- browser-first terminal for a Windows host

### Secondary phrase family

These fit the product but should support the page rather than dominate it:
- shared terminal in the browser
- live terminal across devices
- terminal from your phone browser
- browser terminal on your LAN
- browser terminal without remote desktop

### Phrases to avoid leading with

These create the wrong expectations for the shipped product:
- web SSH
- SSH client
- access from anywhere
- bypass firewalls
- zero-trust remote access
- collaborative terminal
- team terminal sharing

The current product may overlap with some of those ideas in edge cases, but they are not the honest center of gravity for the live release site.

## Recommendation For `M8.1.1.1`

For the current homepage, the best first search-intent decision is:

- Target Windows-hosted browser-terminal intent first.
- Support that with browser-based PowerShell and Windows CLI language.
- Treat shared-terminal and cross-device continuation as supporting proof, not the primary search target.

In plainer terms:
- The homepage should try to become the clearest page for `browser terminal for a Windows host` and adjacent PowerShell-in-browser searches, not a broad remote-shell or SSH page.

## Likely Follow-On Work

If `M8` later grows beyond a one-page site, the next useful search-supporting pages would likely be:
- using PowerShell from your phone browser on your LAN
- why use a browser terminal instead of remoting the whole desktop
- shared terminal access on a Windows host without turning the site into an SSH story

Those are not homepage requirements yet. They are follow-on opportunities once the homepage target is settled.

## Sources Reviewed

- Search-result snapshots collected on 2026-04-24 for:
  - `browser terminal windows`
  - `shared terminal browser`
  - `web terminal windows browser`
  - `browser powershell terminal`
  - `browser based powershell`
  - `in browser powershell`
  - `web powershell terminal`
  - `shared powershell browser`
  - `shared terminal browser collaboration`
  - `collaborative terminal browser`
  - `shared shell browser`
- Sampled pages:
  - [ShellAccess](https://shellaccess.io/)
  - [MyTermWeb](https://mytermweb.com/)
  - [Termio](https://termio.soft-jp.com/)
  - [sshx](https://sshx.io/)
  - [PowerShell Universal](https://powershelluniversal.com/)
  - [Windows PowerShell Web Access](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/hh831417%28v%3Dws.11%29)
