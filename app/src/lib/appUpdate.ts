import { useSyncExternalStore } from "react";
import {
  abortable,
  activateAppWorker,
  prepareAppWorker,
  readWorkerBuildId
} from "./appUpdateServiceWorker";
import {
  clearAppUpdateNavigation,
  createAppUpdateNavigation,
  navigateToAppUpdate,
  readAppUpdateNavigation
} from "./appUpdateNavigation";

export type AppUpdateReason = "asset-load-failure" | "build-version" | "service-worker";

export type AppUpdateState = {
  detectedAt: number | null;
  phase: "available" | "preparing" | "activating" | "failed";
  error?: string;
  latestBuildId?: string;
  reason: AppUpdateReason | null;
  updateRequired: boolean;
};

type VersionCheckResult = "confirmed-update" | "current" | "failed" | "pending-mismatch";
type LifecycleVersionCheckTrigger = "boot" | "focus" | "online" | "visible";

const BUILD_VERSION_PREFIX = "arcane-ledger-build:";
const LIFECYCLE_CHECK_COOLDOWN_MS = 60_000;
const LIFECYCLE_CHECK_DEBOUNCE_MS = 750;
const VERSION_CHECK_TIMEOUT_MS = 8_000;
const UPDATE_TIMEOUT_MS = 45_000;

const initialState: AppUpdateState = {
  detectedAt: null,
  phase: "available",
  reason: null,
  updateRequired: false
};

const listeners = new Set<() => void>();

let state = initialState;
let registrationPromise: Promise<ServiceWorkerRegistration> | undefined;
const watchedRegistrations = new WeakSet<ServiceWorkerRegistration>();
const watchedWorkers = new WeakSet<ServiceWorker>();
let updateAttempt: Promise<void> | null = null;
let isLifecycleInitialized = false;
let isVersionCheckRunning = false;
let lifecycleCheckTimerId: number | null = null;
let lastLifecycleCheckStartedAt = 0;
let lastVersionCheckResult: VersionCheckResult | null = null;
let pendingMismatchBuildId: string | null = null;
let pendingMismatchCount = 0;
let hasReloadNavigationStarted = false;

function isLocalVersionCheckHost() {
  const localHostnames = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]);

  return localHostnames.has(window.location.hostname);
}

function shouldSkipBuildVersionChecks() {
  return import.meta.env.DEV || isLocalVersionCheckHost();
}

function emitUpdateState() {
  listeners.forEach((listener) => listener());
}

function setUpdateRequired(reason: AppUpdateReason, latestBuildId?: string) {
  if (state.updateRequired) return;

  state = {
    phase: "available",
    detectedAt: Date.now(),
    latestBuildId,
    reason,
    updateRequired: true
  };
  emitUpdateState();
}

function getCurrentSnapshot() {
  return state;
}

function getServerSnapshot() {
  return initialState;
}

export function subscribeToAppUpdateState(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useAppUpdateState() {
  return useSyncExternalStore(subscribeToAppUpdateState, getCurrentSnapshot, getServerSnapshot);
}

function normalizeBuildVersionText(text: string) {
  const trimmedText = text.trim();

  if (
    !trimmedText ||
    trimmedText.length > 180 ||
    trimmedText.startsWith("<") ||
    trimmedText.toLowerCase().includes("<!doctype") ||
    !trimmedText.startsWith(BUILD_VERSION_PREFIX)
  ) {
    return null;
  }

  const nextBuildId = trimmedText.slice(BUILD_VERSION_PREFIX.length).trim();

  if (!nextBuildId || nextBuildId.includes("<") || nextBuildId.includes(">")) {
    return null;
  }

  return nextBuildId;
}

function resetPendingMismatch() {
  pendingMismatchBuildId = null;
  pendingMismatchCount = 0;
}

function recordPendingMismatch(latestBuildId: string) {
  if (pendingMismatchBuildId === latestBuildId) {
    pendingMismatchCount += 1;
  } else {
    pendingMismatchBuildId = latestBuildId;
    pendingMismatchCount = 1;
  }

  return pendingMismatchCount >= 2;
}

async function fetchLatestBuildId() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), VERSION_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(`/version.txt?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        Accept: "text/plain"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    return normalizeBuildVersionText(await response.text());
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function checkForBuildVersionUpdate(): Promise<VersionCheckResult> {
  if (state.updateRequired || isVersionCheckRunning || typeof window === "undefined") {
    return state.updateRequired ? "confirmed-update" : "failed";
  }

  isVersionCheckRunning = true;

  try {
    const latestBuildId = await fetchLatestBuildId();

    if (!latestBuildId) {
      return "failed";
    }

    if (latestBuildId === __ARCANE_LEDGER_BUILD_ID__) {
      resetPendingMismatch();
      return "current";
    }

    if (recordPendingMismatch(latestBuildId)) {
      setUpdateRequired("build-version", latestBuildId);
      return "confirmed-update";
    }

    const confirmationBuildId = await fetchLatestBuildId();

    if (!confirmationBuildId) {
      return "failed";
    }

    if (confirmationBuildId === __ARCANE_LEDGER_BUILD_ID__) {
      resetPendingMismatch();
      return "current";
    }

    if (recordPendingMismatch(confirmationBuildId)) {
      setUpdateRequired("build-version", confirmationBuildId);
      return "confirmed-update";
    }

    return "pending-mismatch";
  } finally {
    isVersionCheckRunning = false;
  }
}

function shouldRunLifecycleVersionCheck(trigger: LifecycleVersionCheckTrigger) {
  if (state.updateRequired || shouldSkipBuildVersionChecks()) {
    return false;
  }

  if (trigger === "boot") {
    return true;
  }

  const now = Date.now();
  const cooldownHasElapsed = now - lastLifecycleCheckStartedAt >= LIFECYCLE_CHECK_COOLDOWN_MS;

  return cooldownHasElapsed || (trigger === "online" && lastVersionCheckResult === "failed");
}

function scheduleLifecycleVersionCheck(trigger: LifecycleVersionCheckTrigger) {
  if (!shouldRunLifecycleVersionCheck(trigger)) {
    return;
  }

  if (lifecycleCheckTimerId !== null) {
    window.clearTimeout(lifecycleCheckTimerId);
  }

  const delay = trigger === "boot" ? 0 : LIFECYCLE_CHECK_DEBOUNCE_MS;

  lifecycleCheckTimerId = window.setTimeout(() => {
    lifecycleCheckTimerId = null;
    lastLifecycleCheckStartedAt = Date.now();
    void checkForBuildVersionUpdate().then((result) => {
      lastVersionCheckResult = result;
    });
  }, delay);
}

function handleVisibilityChange() {
  if (document.visibilityState === "visible") {
    scheduleLifecycleVersionCheck("visible");
  }
}

function updateState(patch: Partial<AppUpdateState>) {
  state = { ...state, ...patch };
  emitUpdateState();
}

async function inspectWorker(worker: ServiceWorker | null) {
  if (!worker || !["installed", "activated"].includes(worker.state)) return;
  const buildId = await readWorkerBuildId(worker, new AbortController().signal);
  if (buildId && buildId !== __ARCANE_LEDGER_BUILD_ID__) {
    setUpdateRequired("service-worker", buildId);
  }
}

function watchRegistration(registration: ServiceWorkerRegistration) {
  if (watchedRegistrations.has(registration)) return;
  watchedRegistrations.add(registration);
  const watch = () => {
    const worker = registration.installing ?? registration.waiting;
    if (worker && !watchedWorkers.has(worker)) {
      watchedWorkers.add(worker);
      worker.addEventListener("statechange", () => {
        void inspectWorker(worker);
      });
      void inspectWorker(worker);
    }
  };
  registration.addEventListener("updatefound", watch);
  watch();
  void inspectWorker(navigator.serviceWorker.controller);
}

function registerAppWorker() {
  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none"
    });
    void registrationPromise.then(watchRegistration).catch(() => {
      registrationPromise = undefined;
    });
  }
  return registrationPromise;
}

export function initializeAppUpdateLifecycle() {
  if (isLifecycleInitialized || typeof window === "undefined") return;
  isLifecycleInitialized = true;

  const url = new URL(window.location.href);
  const previous = readAppUpdateNavigation(url);
  if (previous) {
    if (previous.targetBuildId === __ARCANE_LEDGER_BUILD_ID__) {
      // A same-build asset recovery keeps its receipt, so a second asset failure
      // cannot offer an endless sequence of successful-looking reloads.
      if (previous.fromBuildId !== previous.targetBuildId) {
        window.history.replaceState(window.history.state, "", clearAppUpdateNavigation(url));
      }
    } else {
      setUpdateRequired("build-version", previous.targetBuildId);
      updateState({
        phase: "failed",
        error: "The new version did not load. Try again, or close and reopen the app."
      });
    }
  }

  if (!import.meta.env.DEV && navigator.serviceWorker) {
    void registerAppWorker();
    // Existing registrations are available even while register() waits for a slow
    // installation. Never make the Update button depend on that callback alone.
    void navigator.serviceWorker
      .getRegistration("/")
      .then((registration) => {
        if (registration) watchRegistration(registration);
      })
      .catch(() => {});
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // A different tab can activate a worker. Prompt here, but do not reload this
      // tab without its user's acceptance and the usual persistence lifecycle.
      void inspectWorker(navigator.serviceWorker.controller);
    });
  }
  scheduleLifecycleVersionCheck("boot");
  window.addEventListener("focus", () => scheduleLifecycleVersionCheck("focus"));
  window.addEventListener("online", () => scheduleLifecycleVersionCheck("online"));
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

export function markAssetLoadFailureUpdateRequired() {
  setUpdateRequired("asset-load-failure");
}

async function prepareNetworkNavigation(signal: AbortSignal, allowCurrentBuild = false) {
  // Browsers without a worker must also demonstrate that a new shell exists.
  const response = await fetch(`/index.html?update-check=${Date.now()}`, {
    cache: "no-store",
    signal
  });
  if (!response.ok) throw new Error("The update could not be downloaded. Please try again.");
  const document = new DOMParser().parseFromString(await response.text(), "text/html");
  const buildId = document
    .querySelector('meta[name="arcane-ledger-build"]')
    ?.getAttribute("content");
  if (!buildId || (!allowCurrentBuild && buildId === __ARCANE_LEDGER_BUILD_ID__)) {
    throw new Error("The new version is not ready yet. Please try again shortly.");
  }
  return buildId;
}

async function performAppUpdate() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), UPDATE_TIMEOUT_MS);
  updateState({ phase: "preparing", error: undefined });
  try {
    let targetBuildId: string;
    if (navigator.serviceWorker) {
      let registration = await abortable(
        navigator.serviceWorker.getRegistration("/"),
        controller.signal
      );
      if (!registration) {
        try {
          registration = await abortable(registerAppWorker(), controller.signal);
        } catch (error) {
          if (controller.signal.aborted || navigator.serviceWorker.controller) throw error;
          // Registration may be disabled by browser policy even when the API is
          // present. Only an uncontrolled page without a registration can use
          // the verified network-shell path.
        }
      }
      if (registration) {
        watchRegistration(registration);
        const prepared = await prepareAppWorker(
          registration,
          __ARCANE_LEDGER_BUILD_ID__,
          controller.signal,
          state.reason === "asset-load-failure"
            ? async () => {
                try {
                  return (
                    (await prepareNetworkNavigation(controller.signal, true)) ===
                    __ARCANE_LEDGER_BUILD_ID__
                  );
                } catch {
                  return false;
                }
              }
            : undefined
        );
        updateState({ phase: "activating", latestBuildId: prepared.buildId });
        await activateAppWorker(registration, prepared.worker, controller.signal);
        targetBuildId = prepared.buildId;
      } else {
        targetBuildId = await prepareNetworkNavigation(
          controller.signal,
          state.reason === "asset-load-failure"
        );
      }
    } else {
      targetBuildId = await prepareNetworkNavigation(
        controller.signal,
        state.reason === "asset-load-failure"
      );
    }
    if (controller.signal.aborted)
      throw new Error("The update could not finish. Please try again.");
    const destination = createAppUpdateNavigation(
      new URL(window.location.href),
      __ARCANE_LEDGER_BUILD_ID__,
      targetBuildId
    );
    hasReloadNavigationStarted = true;
    // Exactly one navigation after control is confirmed. The next boot validates
    // the receipt against the build that actually started.
    navigateToAppUpdate(destination, () => {
      hasReloadNavigationStarted = false;
      updateState({
        phase: "failed",
        error: "The updated app could not be opened. Check your connection and try again."
      });
    });
  } catch (error) {
    hasReloadNavigationStarted = false;
    updateState({
      phase: "failed",
      error:
        error instanceof Error ? error.message : "The update could not finish. Please try again."
    });
  } finally {
    window.clearTimeout(timeoutId);
    controller.abort();
  }
}

export function reloadForAppUpdate(): Promise<void> {
  if (hasReloadNavigationStarted) return Promise.resolve();
  if (!updateAttempt) {
    updateAttempt = performAppUpdate().finally(() => {
      updateAttempt = null;
    });
  }
  return updateAttempt;
}
