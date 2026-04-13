# Third-Party Notices

This file records the current direct production dependencies used by TermiWeb and their published licenses.

For `0.1`, the packaged release should include this file or a generated equivalent that matches the actual shipped production dependency set. That release-time inventory should be checked against the packaged dependency graph, including transitives if they are part of the shipped artifact.

## Current Direct Production Dependencies

1. `@xterm/xterm`
   - Version: `6.0.0`
   - License: `MIT`
   - URL: `https://github.com/xtermjs/xterm.js`
   - Usage: terminal rendering in the browser client

2. `@xterm/addon-fit`
   - Version: `0.11.0`
   - License: `MIT`
   - URL: `https://github.com/xtermjs/xterm.js/tree/master/addons/addon-fit`
   - Usage: fit xterm to the available client viewport

3. `express`
   - Version: `5.2.1`
   - License: `MIT`
   - URL: `https://expressjs.com/`
   - Usage: HTTP server and app routing

4. `node-pty`
   - Version: `1.1.0`
   - License: `MIT`
   - URL: `https://github.com/microsoft/node-pty`
   - Usage: Windows PTY integration for shared shell instances

5. `ws`
   - Version: `8.20.0`
   - License: `MIT`
   - URL: `https://github.com/websockets/ws`
   - Usage: WebSocket transport for live terminal session traffic

6. `zod`
   - Version: `4.3.6`
   - License: `MIT`
   - URL: `https://zod.dev`
   - Usage: protocol and configuration validation

7. `dotenv`
   - Version: `17.4.1`
   - License: `BSD-2-Clause`
   - URL: `https://github.com/motdotla/dotenv#readme`
   - Usage: `.env` loading for runtime configuration

8. `cookie`
   - Version: `1.1.1`
   - License: `MIT`
   - URL: `https://github.com/jshttp/cookie`
   - Usage: HTTP cookie parsing and serialization
