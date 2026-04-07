import "@xterm/xterm/css/xterm.css";
import "./style.css";

import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";

import { parseServerEvent, type ServerEvent, type SessionSummary } from "../shared/protocol.js";
import {
  advanceModifierState,
  applyModifiersToInput,
  createModifierState,
  mobileControlButtons,
  terminalSequence,
  type ModifierKey,
  type ModifierState,
  type TerminalControlAction,
} from "./ui/mobileControls.js";
import { resolvePreferredSessionId } from "./ui/sessionSelection.js";
import { captureVisibleTerminalText } from "./ui/terminalSnapshot.js";
import {
  computeStageLayout,
  resolveEffectiveViewportWidth,
  shouldAutoCollapseSidebar,
} from "./ui/workspaceStage.js";
import {
  computeTerminalVisibleWidth,
  fitFontSizeToWidth,
  resolveTerminalRows,
  type TerminalRenderMetrics,
} from "./ui/terminalSizing.js";

type ConnectionState = "connecting" | "connected" | "offline" | "error";

function mustQuery<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }

  return element;
}

const loginPanel = mustQuery<HTMLElement>("#login-panel");
const workspacePanel = mustQuery<HTMLElement>("#workspace-panel");
const loginForm = mustQuery<HTMLFormElement>("#login-form");
const passwordInput = mustQuery<HTMLInputElement>("#password-input");
const loginMessage = mustQuery<HTMLElement>("#login-message");
const loginHostname = mustQuery<HTMLElement>("#login-hostname");
const loginAddress = mustQuery<HTMLElement>("#login-address");
const appHostname = mustQuery<HTMLElement>("#app-hostname");
const appAddress = mustQuery<HTMLElement>("#app-address");
const workspaceLayout = mustQuery<HTMLElement>("#workspace-layout");
const sessionList = mustQuery<HTMLElement>("#session-list");
const shellLabel = mustQuery<HTMLElement>("#shell-label");
const connectionStatus = mustQuery<HTMLElement>("#connection-status");
const activeSessionTitle = mustQuery<HTMLElement>("#active-session-title");
const activeSessionStatus = mustQuery<HTMLElement>("#active-session-status");
const terminalContainer = mustQuery<HTMLElement>("#terminal-container");
const workspaceStageViewport = mustQuery<HTMLElement>("#workspace-stage-viewport");
const workspaceStage = mustQuery<HTMLElement>("#workspace-stage");
const selectionPanel = mustQuery<HTMLElement>("#selection-panel");
const selectionText = mustQuery<HTMLTextAreaElement>("#selection-text");
const closeSelectionButton = mustQuery<HTMLButtonElement>("#close-selection-button");
const copySelectionButton = mustQuery<HTMLButtonElement>("#copy-selection-button");
const mobileControls = mustQuery<HTMLElement>("#mobile-controls");
const refreshButton = mustQuery<HTMLButtonElement>("#refresh-button");
const logoutButton = mustQuery<HTMLButtonElement>("#logout-button");
const newSessionButton = mustQuery<HTMLButtonElement>("#new-session-button");
const focusTerminalButton = mustQuery<HTMLButtonElement>("#focus-terminal-button");
const toggleSidebarButton = mustQuery<HTMLButtonElement>("#toggle-sidebar-button");

const terminal = new Terminal({
  cursorBlink: true,
  fontFamily: `"Cascadia Code", "Cascadia Mono", Consolas, monospace`,
  fontSize: 15,
  lineHeight: 1.18,
  theme: {
    background: "#050b10",
    foreground: "#edf7f3",
    selectionBackground: "rgba(122, 255, 178, 0.28)",
    cursor: "#7affb2",
    brightGreen: "#7affb2",
    yellow: "#f4d35e",
    brightYellow: "#ffd46f",
  },
  scrollback: 5_000,
  allowTransparency: true,
});

const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);
terminal.open(terminalContainer);

let ws: WebSocket | null = null;
let reconnectTimer: number | undefined;
let authenticated = false;
let sessions: SessionSummary[] = [];
let activeSessionId: string | null = null;
let workspaceActiveSessionId: string | null = null;
let modifierState: ModifierState = createModifierState();
let lastModifierTap:
  | {
      key: ModifierKey;
      atMs: number;
    }
  | null = null;
let sidebarCollapsed = false;
let sidebarPreferenceMode: "auto" | "manual" = "auto";
let selectionMode = false;
let fixedCols = 80;
const sidebarStorageKey = "termiweb.sidebar-collapsed";
const modifierDoubleTapWindowMs = 360;
const defaultTerminalFontSize = 15;

const statusLabels: Record<SessionSummary["status"], string> = {
  stopped: "Stopped",
  starting: "Starting",
  running: "Running",
  exited: "Exited",
  error: "Error",
};

function setConnectionState(state: ConnectionState, label?: string): void {
  connectionStatus.textContent =
    label ??
    {
      connecting: "Connecting",
      connected: "Connected",
      offline: "Offline",
      error: "Error",
    }[state];
  connectionStatus.className = `status-pill is-${state}`;
}

function setFormMessage(message: string, isError = false): void {
  loginMessage.textContent = message;
  loginMessage.classList.toggle("is-error", isError);
}

function setHostIdentity(hostname?: string): void {
  const machineName = hostname?.trim() || window.location.hostname || "Unknown host";
  const accessAddress = window.location.host || window.location.hostname || "Unknown address";

  loginHostname.textContent = machineName;
  appHostname.textContent = machineName;
  loginAddress.textContent = accessAddress;
  appAddress.textContent = accessAddress;
}

function setFixedCols(nextFixedCols?: number): void {
  if (typeof nextFixedCols === "number" && Number.isFinite(nextFixedCols)) {
    fixedCols = nextFixedCols;
  }
}

function setView(isAuthenticated: boolean): void {
  authenticated = isAuthenticated;
  loginPanel.classList.toggle("is-hidden", isAuthenticated);
  workspacePanel.classList.toggle("is-hidden", !isAuthenticated);

  if (isAuthenticated) {
    window.requestAnimationFrame(() => {
      updateAutoSidebarPreference();
      syncWorkspaceStage();
      currentSize();
    });
  }
}

function setSidebarCollapsed(
  collapsed: boolean,
  options: {
    persist?: boolean;
  } = {},
): void {
  sidebarCollapsed = collapsed;
  workspaceLayout.classList.toggle("is-sidebar-collapsed", collapsed);
  toggleSidebarButton.textContent = collapsed ? "»" : "«";
  toggleSidebarButton.setAttribute("aria-expanded", String(!collapsed));
  toggleSidebarButton.setAttribute(
    "aria-label",
    collapsed ? "Expand instances" : "Collapse instances",
  );
  toggleSidebarButton.title = collapsed ? "Expand instances" : "Collapse instances";

  if (options.persist ?? true) {
    try {
      window.localStorage.setItem(sidebarStorageKey, String(collapsed));
    } catch {
      // Ignore local storage failures and keep the state in-memory for this device.
    }
  }
}

function syncWorkspaceStage(): void {
  const layout = computeStageLayout({
    availableWidth: workspaceStageViewport.clientWidth,
    availableHeight: workspaceStageViewport.clientHeight,
  });

  workspaceStage.style.width = `${Math.ceil(layout.baseWidth)}px`;
  workspaceStage.style.height = `${Math.ceil(layout.baseHeight)}px`;
  workspaceStage.style.transform = `scale(${layout.scale})`;
}

function updateAutoSidebarPreference(): void {
  if (sidebarPreferenceMode !== "auto") {
    return;
  }

  const effectiveViewportWidth = resolveEffectiveViewportWidth({
    layoutWidth: window.innerWidth,
    visualWidth: window.visualViewport?.width ?? null,
    screenWidth: window.screen?.width ?? null,
  });

  setSidebarCollapsed(shouldAutoCollapseSidebar(effectiveViewportWidth), {
    persist: false,
  });
}

function currentTerminalFontSize(): number {
  return typeof terminal.options.fontSize === "number"
    ? terminal.options.fontSize
    : defaultTerminalFontSize;
}

function readTerminalRenderMetrics(): TerminalRenderMetrics | null {
  const terminalElement = terminal.element;
  const renderDimensions = (
    terminal as Terminal & {
      _core?: {
        _renderService?: {
          dimensions?: {
            css?: {
              cell?: {
                width?: number;
              };
            };
          };
        };
      };
    }
  )._core?._renderService?.dimensions;

  const cellWidth = renderDimensions?.css?.cell?.width;
  if (!terminalElement || typeof cellWidth !== "number" || !Number.isFinite(cellWidth) || cellWidth <= 0) {
    return null;
  }

  const terminalStyles = window.getComputedStyle(terminalElement);
  const paddingWidth =
    parseFloat(terminalStyles.getPropertyValue("padding-left")) +
    parseFloat(terminalStyles.getPropertyValue("padding-right"));

  return {
    cellWidth,
    paddingWidth,
    scrollbarWidth: 14,
  };
}

function fitTerminalWidth(): void {
  const targetWidth = terminalContainer.clientWidth;
  const metrics = readTerminalRenderMetrics();
  if (!metrics || targetWidth <= 0) {
    return;
  }

  const nextFontSize = fitFontSizeToWidth({
    currentFontSize: currentTerminalFontSize(),
    currentVisibleWidth: computeTerminalVisibleWidth(fixedCols, metrics),
    targetWidth,
  });

  if (Math.abs(nextFontSize - currentTerminalFontSize()) >= 0.1) {
    terminal.options.fontSize = nextFontSize;
  }
}

function initializeSidebarPreference(): void {
  try {
    const stored = window.localStorage.getItem(sidebarStorageKey);
    if (stored === "true" || stored === "false") {
      sidebarPreferenceMode = "manual";
      setSidebarCollapsed(stored === "true", {
        persist: false,
      });
      return;
    }
  } catch {
    // Fall through to auto mode.
  }

  sidebarPreferenceMode = "auto";
  updateAutoSidebarPreference();
}

function sendEvent(event: unknown): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
}

function currentSize() {
  const targetWidth = terminalContainer.clientWidth;
  const targetHeight = terminalContainer.clientHeight;
  const nextCols = fixedCols;
  const terminalElement = terminal.element;

  if (terminalElement) {
    terminalElement.style.width = "";
  }

  if (targetWidth <= 0 || targetHeight <= 0) {
    return {
      cols: nextCols,
      rows: Math.max(terminal.rows, 1),
    };
  }

  fitTerminalWidth();

  let proposed = fitAddon.proposeDimensions();
  let rows = resolveTerminalRows({
    proposedRows: proposed?.rows,
    fallbackRows: terminal.rows,
  });

  if (terminal.cols !== nextCols || terminal.rows !== rows) {
    terminal.resize(nextCols, rows);
  }

  fitTerminalWidth();
  proposed = fitAddon.proposeDimensions();
  const refinedRows = resolveTerminalRows({
    proposedRows: proposed?.rows,
    fallbackRows: rows,
  });
  if (refinedRows !== rows) {
    rows = refinedRows;
    terminal.resize(nextCols, rows);
  }

  return {
    cols: nextCols,
    rows,
  };
}

function syncSelectionText(): void {
  if (!selectionMode) {
    return;
  }

  selectionText.value = captureVisibleTerminalText(terminal);
}

function setSelectionMode(isOpen: boolean): void {
  selectionMode = isOpen;
  terminalContainer.classList.toggle("is-hidden", isOpen);
  selectionPanel.classList.toggle("is-hidden", !isOpen);

  if (isOpen) {
    syncSelectionText();
    selectionText.focus();
  } else {
    selectionText.blur();
    terminal.focus();
  }

  renderModifierControls();
}

async function copyCurrentSelection(): Promise<void> {
  const terminalSelection = terminal.getSelection();
  const textareaSelection =
    selectionText.selectionStart !== selectionText.selectionEnd
      ? selectionText.value.slice(selectionText.selectionStart, selectionText.selectionEnd)
      : "";
  const textToCopy =
    terminalSelection || textareaSelection || (selectionMode ? selectionText.value : "");

  if (!textToCopy) {
    setSelectionMode(true);
    return;
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
  } catch {
    setConnectionState("error", "Clipboard blocked");
  }
}

function renderModifierControls(): void {
  mobileControls.innerHTML = "";
  const mainControls = document.createElement("div");
  mainControls.className = "control-group control-group-main";
  const arrowControls = document.createElement("div");
  arrowControls.className = "control-group control-group-arrows";

  for (const button of mobileControlButtons) {
    const element = document.createElement("button");
    element.type = "button";
    element.className = "control-button";
    element.textContent = button.label;
    element.dataset.controlId = button.id;

    if (button.group === "arrow") {
      element.classList.add("is-square");
    }

    if (button.kind === "modifier") {
      const modifierKey = button.id as ModifierKey;
      const mode = modifierState[modifierKey];
      element.classList.toggle("is-active", mode !== "off");
      element.classList.toggle("is-armed", mode === "armed");
      element.classList.toggle("is-locked", mode === "locked");
      element.addEventListener("click", () => {
        const now = window.performance.now();
        const isDoubleTap =
          lastModifierTap?.key === modifierKey &&
          now - lastModifierTap.atMs <= modifierDoubleTapWindowMs;
        modifierState = advanceModifierState(modifierState, modifierKey, isDoubleTap);
        lastModifierTap = {
          key: modifierKey,
          atMs: now,
        };
        renderModifierControls();
        terminal.focus();
      });
    } else if (button.kind === "mode" && button.id === "select") {
      element.classList.toggle("is-active", selectionMode);
      element.addEventListener("click", () => {
        setSelectionMode(!selectionMode);
      });
    } else if (button.kind === "sequence") {
      const action = button.id as TerminalControlAction;
      element.addEventListener("click", () => {
        if (!activeSessionId) {
          return;
        }

        const transformed = applyModifiersToInput(terminalSequence(action), modifierState);

        sendEvent({
          type: "terminal/input",
          sessionId: activeSessionId,
          data: transformed.data,
        });
        modifierState = transformed.nextState;
        lastModifierTap = null;
        renderModifierControls();
        terminal.focus();
      });
    } else if (button.id === "copy") {
      element.addEventListener("click", async () => {
        try {
          await copyCurrentSelection();
        } catch {
          setConnectionState("error", "Clipboard blocked");
        } finally {
          if (!selectionMode) {
            terminal.focus();
          }
        }
      });
    } else if (button.id === "paste") {
      element.addEventListener("click", async () => {
        try {
          const pasted = await navigator.clipboard.readText();
          if (activeSessionId && pasted) {
            const transformed = applyModifiersToInput(pasted, modifierState);
            sendEvent({
              type: "terminal/input",
              sessionId: activeSessionId,
              data: transformed.data,
            });
            modifierState = transformed.nextState;
            lastModifierTap = null;
            renderModifierControls();
          }
        } catch {
          setConnectionState("error", "Clipboard blocked");
        } finally {
          terminal.focus();
        }
      });
    }

    if (button.group === "arrow") {
      arrowControls.append(element);
    } else {
      mainControls.append(element);
    }
  }

  mobileControls.append(mainControls, arrowControls);
}

function updateActiveSessionMeta(): void {
  const active = sessions.find((session) => session.id === activeSessionId) ?? sessions[0];
  activeSessionTitle.textContent = active?.title ?? "No active instance";
  activeSessionStatus.textContent = active ? statusLabels[active.status] : "Idle";
  activeSessionStatus.className = `status-pill ${active ? `is-${active.status}` : ""}`.trim();
  shellLabel.textContent = `Shell: ${active?.shell ?? "detecting..."}`;
}

function renderSessions(): void {
  sessionList.innerHTML = "";

  if (sessions.length === 0) {
    const empty = document.createElement("p");
    empty.className = "session-meta";
    empty.textContent = "No instances yet.";
    sessionList.append(empty);
    updateActiveSessionMeta();
    return;
  }

  for (const session of sessions) {
    const row = document.createElement("div");
    row.className = "session-row";

    const card = document.createElement("div");
    card.className = `session-card${session.id === activeSessionId ? " is-active" : ""}`;
    card.tabIndex = 0;
    card.role = "button";
    card.addEventListener("click", () => {
      attachToSession(session.id);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        attachToSession(session.id);
      }
    });

    const head = document.createElement("div");
    head.className = "session-card-head";
    const title = document.createElement("span");
    title.className = "session-title";
    title.textContent = session.title;
    const status = document.createElement("span");
    status.className = `status-pill is-${session.status}`;
    status.textContent = statusLabels[session.status];
    head.append(title, status);

    const meta = document.createElement("div");
    meta.className = "session-meta";
    meta.textContent = `${session.clientCount} attached | ${session.shell ?? "shell pending"}`;

    const caption = document.createElement("div");
    caption.className = "session-caption";
    caption.textContent =
      session.lastExitCode === null
        ? "Fresh shell when opened"
        : `Last exit code: ${session.lastExitCode}`;

    const close = document.createElement("button");
    close.type = "button";
    close.className = "ghost-button compact icon-button session-close";
    close.textContent = "×";
    close.setAttribute("aria-label", `Close ${session.title}`);
    close.title = `Close ${session.title}`;
    close.addEventListener("click", (event) => {
      event.stopPropagation();
      sendEvent({
        type: "session/close",
        sessionId: session.id,
      });
    });

    card.append(head, meta, caption);
    row.append(card, close);
    sessionList.append(row);
  }

  updateActiveSessionMeta();
}

function attachToSession(sessionId: string): void {
  activeSessionId = sessionId;
  setSelectionMode(false);
  terminal.reset();
  renderSessions();

  sendEvent({
    type: "session/select",
    sessionId,
    ...currentSize(),
  });
}

function maybeAttachDefaultSession(): void {
  if (sessions.length === 0) {
    activeSessionId = null;
    workspaceActiveSessionId = null;
    setSelectionMode(false);
    terminal.reset();
    renderSessions();
    return;
  }

  const preferredSessionId = resolvePreferredSessionId({
    sessions,
    localSessionId: activeSessionId,
    workspaceActiveSessionId,
  });

  if (!preferredSessionId || preferredSessionId === activeSessionId) {
    return;
  }

  attachToSession(preferredSessionId);
}

function handleServerEvent(event: ServerEvent): void {
  switch (event.type) {
    case "pong":
      return;
    case "error":
      setConnectionState("error", event.message);
      return;
    case "session/list":
      workspaceActiveSessionId = event.activeSessionId;
      sessions = event.sessions;
      renderSessions();
      maybeAttachDefaultSession();
      return;
    case "session/created":
      attachToSession(event.session.id);
      return;
    case "session/snapshot":
      if (event.snapshot.session.id !== activeSessionId) {
        return;
      }
      setSelectionMode(false);
      terminal.reset();
      terminal.write(event.snapshot.history);
      renderSessions();
      terminal.focus();
      return;
    case "session/output":
      if (event.sessionId === activeSessionId) {
        terminal.write(event.data);
      }
      return;
  }
}

function connectSocket(): void {
  if (!authenticated) {
    return;
  }

  ws?.close();
  setConnectionState("connecting");

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  ws = new WebSocket(`${protocol}://${window.location.host}/ws`);

  ws.addEventListener("open", () => {
    setConnectionState("connected");
    sendEvent({ type: "session/list.request" });
    terminal.focus();
  });

  ws.addEventListener("message", (message) => {
    const parsed = parseServerEvent(JSON.parse(message.data as string));
    handleServerEvent(parsed);
  });

  ws.addEventListener("close", () => {
    setConnectionState("offline");
    if (!authenticated) {
      return;
    }

    reconnectTimer = window.setTimeout(() => {
      connectSocket();
    }, 1_200);
  });
}

async function refreshAuthState(): Promise<void> {
  const response = await fetch("/api/auth/session", {
    credentials: "same-origin",
  });
  const body = (await response.json()) as {
    authenticated: boolean;
    hostname?: string;
    fixedCols?: number;
  };
  setHostIdentity(body.hostname);
  setFixedCols(body.fixedCols);
  setView(body.authenticated);
  if (body.authenticated) {
    setConnectionState("connecting");
    connectSocket();
  } else {
    setConnectionState("offline");
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormMessage("");

  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password: passwordInput.value,
    }),
  });

  const body = (await response.json()) as {
    authenticated?: boolean;
    error?: string;
    hostname?: string;
    fixedCols?: number;
  };
  if (!response.ok) {
    setFormMessage(body.error ?? "Unable to authenticate.", true);
    return;
  }

  setHostIdentity(body.hostname);
  setFixedCols(body.fixedCols);
  passwordInput.value = "";
  setView(true);
  connectSocket();
});

logoutButton.addEventListener("click", async () => {
  authenticated = false;
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  });

  window.clearTimeout(reconnectTimer);
  ws?.close();
  ws = null;
  sessions = [];
  activeSessionId = null;
  workspaceActiveSessionId = null;
  setSelectionMode(false);
  terminal.reset();
  setView(false);
  setConnectionState("offline");
});

refreshButton.addEventListener("click", () => {
  sendEvent({ type: "session/list.request" });
});

newSessionButton.addEventListener("click", () => {
  sendEvent({ type: "session/create" });
});

focusTerminalButton.addEventListener("click", () => {
  setSelectionMode(false);
  terminal.focus();
});

toggleSidebarButton.addEventListener("click", () => {
  sidebarPreferenceMode = "manual";
  setSidebarCollapsed(!sidebarCollapsed);
  syncWorkspaceStage();
});

copySelectionButton.addEventListener("click", async () => {
  await copyCurrentSelection();
});

closeSelectionButton.addEventListener("click", () => {
  setSelectionMode(false);
});

terminal.onData((data) => {
  if (!activeSessionId) {
    return;
  }

  const transformed = applyModifiersToInput(data, modifierState);
  modifierState = transformed.nextState;
  lastModifierTap = null;
  renderModifierControls();

  sendEvent({
    type: "terminal/input",
    sessionId: activeSessionId,
    data: transformed.data,
  });
});

const resizeObserver = new ResizeObserver(() => {
  const size = currentSize();
  if (activeSessionId) {
    sendEvent({
      type: "terminal/resize",
      sessionId: activeSessionId,
      ...size,
    });
  }
});

resizeObserver.observe(terminalContainer);
const stageViewportObserver = new ResizeObserver(() => {
  syncWorkspaceStage();
});

stageViewportObserver.observe(workspaceStageViewport);

const handleViewportResize = () => {
  updateAutoSidebarPreference();
  syncWorkspaceStage();
};

window.addEventListener("resize", handleViewportResize);
window.visualViewport?.addEventListener("resize", handleViewportResize);

initializeSidebarPreference();
renderModifierControls();
syncWorkspaceStage();
currentSize();
await refreshAuthState();
