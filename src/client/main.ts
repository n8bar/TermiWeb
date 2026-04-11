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
  computeRequiredTerminalWidth,
  fitFontSizeToCols,
  resolveTerminalRows,
} from "./ui/terminalSizing.js";
import { applyTerminalInputAttributes } from "./ui/terminalInput.js";
import { attachTerminalTouchScroll } from "./ui/terminalScroll.js";
import { getDisplaySessionTitle } from "./ui/sessionTitle.js";
import { toDisplayVersion } from "./ui/version.js";

type ConnectionState = "connecting" | "connected" | "offline" | "error";
type ManagedWebSocket = WebSocket & {
  intentionalClose?: boolean;
};

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
const loginVersion = mustQuery<HTMLElement>("#login-version");
const appHostname = mustQuery<HTMLElement>("#app-hostname");
const appAddress = mustQuery<HTMLElement>("#app-address");
const appVersion = mustQuery<HTMLElement>("#app-version");
const workspaceLayout = mustQuery<HTMLElement>("#workspace-layout");
const sessionList = mustQuery<HTMLElement>("#session-list");
const shellLabel = mustQuery<HTMLElement>("#shell-label");
const connectionStatus = mustQuery<HTMLElement>("#connection-status");
const activeSessionTitle = mustQuery<HTMLElement>("#active-session-title");
const activeSessionStatus = mustQuery<HTMLElement>("#active-session-status");
const sessionWidthButton = mustQuery<HTMLButtonElement>("#session-width-button");
const sessionWidthPopover = mustQuery<HTMLElement>("#session-width-popover");
const sessionWidthForm = mustQuery<HTMLFormElement>("#session-width-form");
const sessionWidthInput = mustQuery<HTMLInputElement>("#session-width-input");
const sessionWidthApply = mustQuery<HTMLButtonElement>("#session-width-apply");
const sessionWidthPresetButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>(".session-width-preset"),
);
const terminalShell = mustQuery<HTMLElement>("#terminal-shell");
const terminalContainer = mustQuery<HTMLElement>("#terminal-container");
const workspaceStageViewport = mustQuery<HTMLElement>("#workspace-stage-viewport");
const workspaceStage = mustQuery<HTMLElement>("#workspace-stage");
const selectionPanel = mustQuery<HTMLElement>("#selection-panel");
const selectionText = mustQuery<HTMLTextAreaElement>("#selection-text");
const closeSelectionButton = mustQuery<HTMLButtonElement>("#close-selection-button");
const copySelectionButton = mustQuery<HTMLButtonElement>("#copy-selection-button");
const controlTray = mustQuery<HTMLElement>("#control-tray");
const mobileControls = mustQuery<HTMLElement>("#mobile-controls");
const refreshButton = mustQuery<HTMLButtonElement>("#refresh-button");
const logoutButton = mustQuery<HTMLButtonElement>("#logout-button");
const newSessionButton = mustQuery<HTMLButtonElement>("#new-session-button");
const focusTerminalButton = mustQuery<HTMLButtonElement>("#focus-terminal-button");
const toggleControlsButton = mustQuery<HTMLButtonElement>("#toggle-controls-button");
const toggleSidebarButton = mustQuery<HTMLButtonElement>("#toggle-sidebar-button");

const terminal = new Terminal({
  cursorBlink: false,
  cursorStyle: "bar",
  cursorInactiveStyle: "none",
  cursorWidth: 2,
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
if (terminal.textarea) {
  applyTerminalInputAttributes(terminal.textarea);
}
if (terminal.element) {
  attachTerminalTouchScroll({
    surface: terminal.element,
    terminal,
    getCellHeight: () => {
      const renderDimensions = (
        terminal as Terminal & {
          _core?: {
            _renderService?: {
              dimensions?: {
                css?: {
                  cell?: {
                    height?: number;
                  };
                };
              };
            };
          };
        }
      )._core?._renderService?.dimensions;

      const cellHeight = renderDimensions?.css?.cell?.height;
      if (typeof cellHeight === "number" && Number.isFinite(cellHeight) && cellHeight > 0) {
        return cellHeight;
      }

      return currentTerminalFontSize() * (terminal.options.lineHeight ?? 1);
    },
  });
}

let ws: WebSocket | null = null;
let reconnectTimer: number | undefined;
let viewportRefitTimer: number | undefined;
let terminalResyncTimer: number | undefined;
let recoveryPollTimer: number | undefined;
let authenticated = false;
let sessions: SessionSummary[] = [];
let activeSessionId: string | null = null;
let workspaceActiveSessionId: string | null = null;
let modifierState: ModifierState = createModifierState();
let hadLiveSocketConnection = false;
let recoveryReloadRequested = false;
let lastModifierTap:
  | {
      key: ModifierKey;
      atMs: number;
    }
  | null = null;
let sidebarCollapsed = false;
let sidebarPreferenceMode: "auto" | "manual" = "auto";
let controlsCollapsed = false;
let selectionMode = false;
let fixedCols = 80;
let lastEmittedTerminalResize:
  | {
      sessionId: string;
      cols: number;
      rows: number;
    }
  | null = null;
let pendingViewportResizeBroadcast = false;
let pendingViewportScrollReset = false;
let pendingViewportSnapshotResync = false;
const sidebarStorageKey = "termiweb.sidebar-collapsed";
const controlsStorageKey = "termiweb.controls-collapsed";
const modifierDoubleTapWindowMs = 360;
const defaultTerminalFontSize = 15;
const minTerminalFontSize = 6;
const minSessionCols = 20;
const maxSessionCols = 240;
const displayVersion = toDisplayVersion(
  (
    globalThis as typeof globalThis & {
      __TERMIWEB_VERSION__?: string;
    }
  ).__TERMIWEB_VERSION__ ?? "0.1.0",
);

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

function setVersionIdentity(): void {
  const versionLabel = `v${displayVersion}`;
  loginVersion.textContent = versionLabel;
  appVersion.textContent = versionLabel;
  document.title = `TermiWeb ${versionLabel}`;
}

function setFixedCols(nextFixedCols?: number): void {
  if (typeof nextFixedCols === "number" && Number.isFinite(nextFixedCols)) {
    fixedCols = nextFixedCols;
  }

  syncSessionWidthControl();
}

function setView(isAuthenticated: boolean): void {
  authenticated = isAuthenticated;
  loginPanel.classList.toggle("is-hidden", isAuthenticated);
  workspacePanel.classList.toggle("is-hidden", !isAuthenticated);

  if (isAuthenticated) {
    window.requestAnimationFrame(() => {
      syncViewportLayout();
    });
  }
}

function getActiveSession(): SessionSummary | null {
  return sessions.find((session) => session.id === activeSessionId) ?? sessions[0] ?? null;
}

function syncSessionWidthControl(): void {
  const active = getActiveSession();
  const cols = active?.fixedCols ?? fixedCols;
  const isEnabled = Boolean(active);

  sessionWidthButton.textContent = `Cols ${cols}`;
  sessionWidthButton.disabled = !isEnabled;
  sessionWidthApply.disabled = !isEnabled;
  sessionWidthInput.value = String(cols);

  for (const button of sessionWidthPresetButtons) {
    button.classList.toggle("is-active", Number(button.dataset.cols) === cols);
    button.disabled = !isEnabled;
  }
}

function setSessionWidthPopoverOpen(isOpen: boolean): void {
  sessionWidthPopover.classList.toggle("is-hidden", !isOpen);
  sessionWidthButton.setAttribute("aria-expanded", String(isOpen));

  if (isOpen) {
    syncSessionWidthControl();
    window.requestAnimationFrame(() => {
      sessionWidthInput.focus();
      sessionWidthInput.select();
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
  renderSessions();
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

function setControlsCollapsed(
  collapsed: boolean,
  options: {
    persist?: boolean;
  } = {},
): void {
  controlsCollapsed = collapsed;
  terminalShell.classList.toggle("is-controls-collapsed", collapsed);
  controlTray.classList.toggle("is-collapsed", collapsed);
  toggleControlsButton.textContent = collapsed ? "⌃\n⌃" : "⌄\n⌄";
  toggleControlsButton.setAttribute("aria-expanded", String(!collapsed));
  toggleControlsButton.setAttribute(
    "aria-label",
    collapsed ? "Expand keyboard controls" : "Collapse keyboard controls",
  );
  toggleControlsButton.title = collapsed ? "Expand keyboard controls" : "Collapse keyboard controls";

  if (options.persist ?? true) {
    try {
      window.localStorage.setItem(controlsStorageKey, String(collapsed));
    } catch {
      // Ignore local storage failures and keep the state in-memory for this device.
    }
  }
}

function syncAppViewportHeight(): void {
  const viewportHeight = Math.max(
    0,
    Math.floor(window.visualViewport?.height ?? window.innerHeight),
  );

  if (viewportHeight > 0) {
    document.documentElement.style.setProperty("--app-viewport-height", `${viewportHeight}px`);
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

function setSidebarForceCollapsed(forceCollapsed: boolean): void {
  workspaceLayout.classList.toggle("is-sidebar-force-collapsed", forceCollapsed);
}

function updateAutoSidebarPreference(): void {
  const effectiveViewportWidth = resolveEffectiveViewportWidth({
    layoutWidth: window.innerWidth,
    visualWidth: window.visualViewport?.width ?? null,
    screenWidth: window.screen?.width ?? null,
  });
  const shouldForceCollapse = shouldAutoCollapseSidebar(effectiveViewportWidth);
  setSidebarForceCollapsed(shouldForceCollapse);

  if (shouldForceCollapse) {
    setSidebarCollapsed(true, {
      persist: false,
    });
    return;
  }

  if (sidebarPreferenceMode !== "auto") {
    return;
  }

  setSidebarCollapsed(false, {
    persist: false,
  });
}

function currentTerminalFontSize(): number {
  return typeof terminal.options.fontSize === "number"
    ? terminal.options.fontSize
    : defaultTerminalFontSize;
}

function isCoarsePointerDevice(): boolean {
  return (
    window.matchMedia?.("(pointer: coarse)").matches === true ||
    window.matchMedia?.("(hover: none)").matches === true
  );
}

function registerControlButtonFocusBehavior(element: HTMLButtonElement): void {
  const preserveTerminalFocus = (event: Event) => {
    if (event.cancelable) {
      event.preventDefault();
    }
  };

  element.addEventListener("pointerdown", (event) => {
    preserveTerminalFocus(event);
  }, { passive: false });

  element.addEventListener("mousedown", (event) => {
    preserveTerminalFocus(event);
  }, { passive: false });

  element.addEventListener("touchstart", (event) => {
    preserveTerminalFocus(event);
  }, { passive: false });

  element.addEventListener("focus", () => {
    if (selectionMode) {
      return;
    }

    if (document.activeElement !== element) {
      return;
    }

    window.requestAnimationFrame(() => {
      if (document.activeElement === element) {
        terminal.focus();
      }
    });
  });
}

function bindControlButtonActivation(
  element: HTMLButtonElement,
  handler: () => void,
): void {
  const activate = (event: Event) => {
    if (event.cancelable) {
      event.preventDefault();
    }

    handler();
  };

  element.addEventListener("pointerup", (event) => {
    if (event.button !== 0) {
      return;
    }

    activate(event);
  });

  if (!("PointerEvent" in window)) {
    element.addEventListener("mouseup", (event) => {
      if (event.button !== 0) {
        return;
      }

      activate(event);
    });

    element.addEventListener(
      "touchend",
      (event) => {
        activate(event);
      },
      { passive: false },
    );
  }

  element.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    activate(event);
  });
}

function maybeRefocusTerminalAfterControl(): void {
  const shouldFocusTerminal =
    !selectionMode && document.activeElement !== terminal.textarea;
  if (shouldFocusTerminal) {
    window.requestAnimationFrame(() => {
      terminal.focus();
    });
  }
}

function requestSessionWidthChange(nextCols: number): void {
  const active = getActiveSession();
  if (!active) {
    return;
  }

  const clampedCols = Math.max(minSessionCols, Math.min(maxSessionCols, Math.round(nextCols)));
  if (clampedCols === active.fixedCols) {
    setSessionWidthPopoverOpen(false);
    maybeRefocusTerminalAfterControl();
    return;
  }

  if (
    active.clientCount > 1 &&
    !window.confirm(
      `${active.clientCount} devices are attached to this instance. Change width to ${clampedCols} columns for all of them?`,
    )
  ) {
    return;
  }

  const nextSessions = sessions.map((session) =>
    session.id === active.id
      ? {
          ...session,
          fixedCols: clampedCols,
        }
      : session,
  );
  sessions = nextSessions;
  setFixedCols(clampedCols);
  const size = currentSize();
  sendEvent({
    type: "session/cols",
    sessionId: active.id,
    cols: clampedCols,
    rows: size.rows,
  });
  scheduleTerminalResync(140);
  renderSessions();
  setSessionWidthPopoverOpen(false);
  maybeRefocusTerminalAfterControl();
}

function readTerminalWidthMetrics(): { cellWidth: number; horizontalPadding: number } | null {
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
  if (
    !terminalElement ||
    typeof cellWidth !== "number" ||
    !Number.isFinite(cellWidth) ||
    cellWidth <= 0
  ) {
    return null;
  }

  const terminalStyles = window.getComputedStyle(terminalElement);
  const horizontalPadding =
    parseFloat(terminalStyles.getPropertyValue("padding-left")) +
    parseFloat(terminalStyles.getPropertyValue("padding-right"));

  return {
    cellWidth,
    horizontalPadding,
  };
}

function resetTerminalHorizontalOverflow(): void {
  terminalContainer.classList.remove("is-horizontal-overflow");
  if (terminal.element) {
    terminal.element.style.width = "";
  }
}

function fitTerminalWidth(): boolean {
  const proposed = fitAddon.proposeDimensions();
  const fittedCols = proposed?.cols;
  if (
    typeof fittedCols !== "number" ||
    !Number.isFinite(fittedCols) ||
    fittedCols <= 0
  ) {
    return false;
  }

  const nextFontSize = fitFontSizeToCols({
    currentFontSize: currentTerminalFontSize(),
    fittedCols,
    targetCols: fixedCols,
    minFontSize: minTerminalFontSize,
  });

  if (Math.abs(nextFontSize - currentTerminalFontSize()) >= 0.1) {
    terminal.options.fontSize = nextFontSize;
    return true;
  }

  return false;
}

function syncTerminalHorizontalOverflow(): boolean {
  const proposed = fitAddon.proposeDimensions();
  const fittedCols = proposed?.cols;
  if (
    currentTerminalFontSize() > minTerminalFontSize + 0.01 ||
    typeof fittedCols !== "number" ||
    !Number.isFinite(fittedCols) ||
    fittedCols >= fixedCols
  ) {
    return false;
  }

  const metrics = readTerminalWidthMetrics();
  if (!metrics) {
    return false;
  }

  const requiredWidth = Math.ceil(
    computeRequiredTerminalWidth({
      cols: fixedCols,
      cellWidth: metrics.cellWidth,
      horizontalPadding: metrics.horizontalPadding,
    }) + 1,
  );

  terminalContainer.classList.add("is-horizontal-overflow");
  if (terminal.element) {
    terminal.element.style.width = `${requiredWidth}px`;
  }

  return true;
}

function emitTerminalResize(size: { cols: number; rows: number }): void {
  if (!activeSessionId) {
    return;
  }

  if (
    lastEmittedTerminalResize?.sessionId === activeSessionId &&
    lastEmittedTerminalResize.cols === size.cols &&
    lastEmittedTerminalResize.rows === size.rows
  ) {
    return;
  }

  lastEmittedTerminalResize = {
    sessionId: activeSessionId,
    cols: size.cols,
    rows: size.rows,
  };

  sendEvent({
    type: "terminal/resize",
    sessionId: activeSessionId,
    ...size,
  });
}

function syncViewportLayout(options: {
  sendResize?: boolean;
  scrollToOrigin?: boolean;
} = {}): void {
  syncAppViewportHeight();
  updateAutoSidebarPreference();
  syncWorkspaceStage();

  const size = currentSize();
  if (options.sendResize) {
    emitTerminalResize(size);
  }

  if (selectionMode) {
    syncSelectionText();
  }

  if (options.scrollToOrigin) {
    window.scrollTo(0, 0);
  }
}

function scheduleViewportLayoutSync(
  delayMs: number,
  options: {
    sendResize?: boolean;
    scrollToOrigin?: boolean;
    requestSnapshot?: boolean;
  } = {},
): void {
  pendingViewportResizeBroadcast ||= options.sendResize === true;
  pendingViewportScrollReset ||= options.scrollToOrigin === true;
  pendingViewportSnapshotResync ||= options.requestSnapshot === true;
  window.clearTimeout(viewportRefitTimer);
  viewportRefitTimer = window.setTimeout(() => {
    const layoutOptions = {
      sendResize: pendingViewportResizeBroadcast,
      scrollToOrigin: pendingViewportScrollReset,
    };
    const shouldRequestSnapshot = pendingViewportSnapshotResync;
    pendingViewportResizeBroadcast = false;
    pendingViewportScrollReset = false;
    pendingViewportSnapshotResync = false;
    syncViewportLayout(layoutOptions);
    if (shouldRequestSnapshot) {
      scheduleTerminalResync(120);
    }
  }, delayMs);
}

function clearTerminalResyncTimer(): void {
  window.clearTimeout(terminalResyncTimer);
  terminalResyncTimer = undefined;
}

function requestActiveSessionSnapshot(): void {
  if (!activeSessionId) {
    return;
  }
  sendEvent({
    type: "session/snapshot.request",
    sessionId: activeSessionId,
  });
}

function scheduleTerminalResync(delayMs = 120): void {
  clearTerminalResyncTimer();
  terminalResyncTimer = window.setTimeout(() => {
    if (!authenticated || !activeSessionId) {
      return;
    }

    requestActiveSessionSnapshot();
  }, delayMs);
}

function initializeSidebarPreference(): void {
  const effectiveViewportWidth = resolveEffectiveViewportWidth({
    layoutWidth: window.innerWidth,
    visualWidth: window.visualViewport?.width ?? null,
    screenWidth: window.screen?.width ?? null,
  });
  const shouldForceCollapse = shouldAutoCollapseSidebar(effectiveViewportWidth);
  setSidebarForceCollapsed(shouldForceCollapse);

  try {
    const stored = window.localStorage.getItem(sidebarStorageKey);
    if (stored === "true" || stored === "false") {
      sidebarPreferenceMode = "manual";
      setSidebarCollapsed(shouldForceCollapse ? true : stored === "true", {
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

function initializeControlsPreference(): void {
  try {
    const stored = window.localStorage.getItem(controlsStorageKey);
    if (stored === "true" || stored === "false") {
      setControlsCollapsed(stored === "true", {
        persist: false,
      });
      return;
    }
  } catch {
    // Fall through to default expanded state.
  }

  setControlsCollapsed(false, {
    persist: false,
  });
}

function sendEvent(event: unknown): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
}

function clearReconnectTimer(): void {
  window.clearTimeout(reconnectTimer);
  reconnectTimer = undefined;
}

function clearRecoveryPollTimer(): void {
  window.clearTimeout(recoveryPollTimer);
  recoveryPollTimer = undefined;
}

function closeSocket(intentional = false): void {
  if (!ws) {
    return;
  }

  clearTerminalResyncTimer();
  lastEmittedTerminalResize = null;
  const managedSocket = ws as ManagedWebSocket;
  managedSocket.intentionalClose = intentional;
  ws.close();
  ws = null;
}

async function checkServerRecovery(): Promise<void> {
  if (!authenticated || recoveryReloadRequested) {
    return;
  }

  try {
    const response = await fetch(`/api/health?ts=${Date.now()}`, {
      cache: "no-store",
      credentials: "same-origin",
    });

    if (!response.ok) {
      throw new Error("Server unavailable");
    }

    recoveryReloadRequested = true;
    setConnectionState("connecting", "Refreshing");
    window.location.reload();
  } catch {
    recoveryPollTimer = window.setTimeout(() => {
      void checkServerRecovery();
    }, 1_200);
  }
}

function beginServerRecovery(): void {
  if (!authenticated || recoveryReloadRequested) {
    return;
  }

  clearReconnectTimer();
  clearRecoveryPollTimer();
  setConnectionState("offline", "Waiting for server");
  void checkServerRecovery();
}

function currentSize() {
  const targetWidth = terminalContainer.clientWidth;
  const targetHeight = terminalContainer.clientHeight;
  const nextCols = fixedCols;

  if (targetWidth <= 0 || targetHeight <= 0) {
    return {
      cols: nextCols,
      rows: Math.max(terminal.rows, 1),
    };
  }

  resetTerminalHorizontalOverflow();

  let rows = Math.max(terminal.rows, 1);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    fitTerminalWidth();

    const proposed = fitAddon.proposeDimensions();
    const nextRows = resolveTerminalRows({
      proposedRows: proposed?.rows,
      fallbackRows: rows,
    });

    if (terminal.cols !== nextCols || terminal.rows !== nextRows) {
      terminal.resize(nextCols, nextRows);
    }

    rows = nextRows;
  }

  if (syncTerminalHorizontalOverflow()) {
    const overflowRows = resolveTerminalRows({
      proposedRows: fitAddon.proposeDimensions()?.rows,
      fallbackRows: rows,
    });

    if (terminal.cols !== nextCols || terminal.rows !== overflowRows) {
      terminal.resize(nextCols, overflowRows);
    }

    rows = overflowRows;
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

  for (const button of mobileControlButtons) {
    const element = document.createElement("button");
    element.type = "button";
    element.className = "control-button";
    element.textContent = button.label;
    element.dataset.controlId = button.id;

    if (button.group === "arrow") {
      element.classList.add("is-square");
    }

    registerControlButtonFocusBehavior(element);

    if (button.kind === "modifier") {
      const modifierKey = button.id as ModifierKey;
      const mode = modifierState[modifierKey];
      element.classList.toggle("is-active", mode !== "off");
      element.classList.toggle("is-armed", mode === "armed");
      element.classList.toggle("is-locked", mode === "locked");
      bindControlButtonActivation(element, () => {
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
        maybeRefocusTerminalAfterControl();
      });
    } else if (button.kind === "mode" && button.id === "select") {
      element.classList.toggle("is-active", selectionMode);
      bindControlButtonActivation(element, () => {
        setSelectionMode(!selectionMode);
      });
    } else if (button.kind === "sequence") {
      const action = button.id as TerminalControlAction;
      bindControlButtonActivation(element, () => {
        if (!activeSessionId) {
          return;
        }

        const transformed = applyModifiersToInput(
          terminalSequence(action, {
            applicationCursorKeysMode: terminal.modes.applicationCursorKeysMode,
            includeHomeEndFallback: action === "home" || action === "end",
          }),
          modifierState,
        );

        sendEvent({
          type: "terminal/input",
          sessionId: activeSessionId,
          data: transformed.data,
        });
        modifierState = transformed.nextState;
        lastModifierTap = null;
        renderModifierControls();
        maybeRefocusTerminalAfterControl();
      });
    } else if (button.id === "copy") {
      bindControlButtonActivation(element, async () => {
        try {
          await copyCurrentSelection();
        } catch {
          setConnectionState("error", "Clipboard blocked");
        } finally {
          if (!selectionMode) {
            maybeRefocusTerminalAfterControl();
          }
        }
      });
    } else if (button.id === "paste") {
      bindControlButtonActivation(element, async () => {
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
          maybeRefocusTerminalAfterControl();
        }
      });
    }

    mobileControls.append(element);
  }
}

function updateActiveSessionMeta(): void {
  const active = getActiveSession();
  activeSessionTitle.textContent = active?.title ?? "No active instance";
  activeSessionStatus.textContent = active ? statusLabels[active.status] : "Idle";
  activeSessionStatus.className = `status-pill ${active ? `is-${active.status}` : ""}`.trim();
  shellLabel.textContent = `Shell: ${active?.shell ?? "detecting..."}`;
  syncSessionWidthControl();
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
    row.className = `session-row${session.id === activeSessionId ? " is-active" : ""}`;

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
    title.textContent = getDisplaySessionTitle(session.title, sidebarCollapsed);
    const status = document.createElement("span");
    status.className = `status-pill is-${session.status}`;
    status.textContent = statusLabels[session.status];
    head.append(title, status);

    const meta = document.createElement("div");
    meta.className = "session-meta";
    meta.textContent = `${session.clientCount} attached\n${session.shell ?? "shell pending"}`;

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

    card.append(head, meta);
    row.append(card, close);
    sessionList.append(row);
  }

  updateActiveSessionMeta();
}

function attachToSession(sessionId: string): void {
  const targetSession = sessions.find((session) => session.id === sessionId);
  if (targetSession) {
    setFixedCols(targetSession.fixedCols);
  }

  activeSessionId = sessionId;
  lastEmittedTerminalResize = null;
  setSessionWidthPopoverOpen(false);
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
    const active = getActiveSession();
    if (active && active.fixedCols !== fixedCols) {
      setFixedCols(active.fixedCols);
      syncViewportLayout();
    }
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
      setFixedCols(event.session.fixedCols);
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

  clearReconnectTimer();
  clearRecoveryPollTimer();
  closeSocket(true);
  setConnectionState("connecting");

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${window.location.host}/ws`) as ManagedWebSocket;
  ws = socket;

  socket.addEventListener("open", () => {
    if (ws !== socket) {
      return;
    }

    hadLiveSocketConnection = true;
    recoveryReloadRequested = false;
    clearRecoveryPollTimer();
    setConnectionState("connected");
    sendEvent({ type: "session/list.request" });
    terminal.focus();
  });

  socket.addEventListener("message", (message) => {
    const parsed = parseServerEvent(JSON.parse(message.data as string));
    handleServerEvent(parsed);
  });

  socket.addEventListener("close", () => {
    if (ws === socket) {
      ws = null;
    }

    if (socket.intentionalClose || !authenticated) {
      return;
    }

    if (hadLiveSocketConnection) {
      beginServerRecovery();
      return;
    }

    setConnectionState("offline");
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
    recoveryReloadRequested = false;
    setConnectionState("connecting");
    connectSocket();
  } else {
    clearReconnectTimer();
    clearRecoveryPollTimer();
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

  clearReconnectTimer();
  clearRecoveryPollTimer();
  recoveryReloadRequested = false;
  hadLiveSocketConnection = false;
  closeSocket(true);
  sessions = [];
  activeSessionId = null;
  workspaceActiveSessionId = null;
  setSelectionMode(false);
  terminal.reset();
  setView(false);
  setConnectionState("offline");
});

refreshButton.addEventListener("click", () => {
  setSessionWidthPopoverOpen(false);
  sendEvent({ type: "session/list.request" });
});

newSessionButton.addEventListener("click", () => {
  sendEvent({ type: "session/create" });
});

focusTerminalButton.addEventListener("click", () => {
  setSessionWidthPopoverOpen(false);
  setSelectionMode(false);
  terminal.focus();
});

toggleSidebarButton.addEventListener("click", () => {
  setSessionWidthPopoverOpen(false);
  const effectiveViewportWidth = resolveEffectiveViewportWidth({
    layoutWidth: window.innerWidth,
    visualWidth: window.visualViewport?.width ?? null,
    screenWidth: window.screen?.width ?? null,
  });
  if (shouldAutoCollapseSidebar(effectiveViewportWidth)) {
    sidebarPreferenceMode = "auto";
    setSidebarCollapsed(true, {
      persist: false,
    });
    syncViewportLayout({
      sendResize: true,
    });
    return;
  }
  sidebarPreferenceMode = "manual";
  setSidebarCollapsed(!sidebarCollapsed);
  syncViewportLayout({
    sendResize: true,
  });
});

sessionWidthButton.addEventListener("click", () => {
  setSessionWidthPopoverOpen(sessionWidthPopover.classList.contains("is-hidden"));
});

for (const button of sessionWidthPresetButtons) {
  button.addEventListener("click", () => {
    const nextCols = Number(button.dataset.cols);
    if (!Number.isFinite(nextCols)) {
      return;
    }

    requestSessionWidthChange(nextCols);
  });
}

sessionWidthForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nextCols = Number(sessionWidthInput.value);
  if (!Number.isFinite(nextCols)) {
    return;
  }

  requestSessionWidthChange(nextCols);
});

registerControlButtonFocusBehavior(toggleControlsButton);
bindControlButtonActivation(toggleControlsButton, () => {
  setControlsCollapsed(!controlsCollapsed);
  syncViewportLayout({
    sendResize: true,
  });
  maybeRefocusTerminalAfterControl();
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
  currentSize();
  if (selectionMode) {
    syncSelectionText();
  }
});

resizeObserver.observe(terminalContainer);
const stageViewportObserver = new ResizeObserver(() => {
  syncWorkspaceStage();
});

stageViewportObserver.observe(workspaceStageViewport);

const handleViewportResize = () => {
  const coarsePointer = isCoarsePointerDevice();
  syncViewportLayout({
    sendResize: !coarsePointer,
  });
  scheduleViewportLayoutSync(coarsePointer ? 220 : 140, {
    sendResize: !coarsePointer,
    requestSnapshot: coarsePointer,
  });
};

window.addEventListener("resize", handleViewportResize);
window.addEventListener("pointerdown", (event) => {
  const target = event.target;
  if (!(target instanceof Node)) {
    return;
  }

  if (
    sessionWidthPopover.classList.contains("is-hidden") ||
    sessionWidthPopover.contains(target) ||
    sessionWidthButton.contains(target)
  ) {
    return;
  }

  setSessionWidthPopoverOpen(false);
});
window.visualViewport?.addEventListener("resize", handleViewportResize);

initializeSidebarPreference();
initializeControlsPreference();
renderModifierControls();
setVersionIdentity();
syncViewportLayout();
await refreshAuthState();
