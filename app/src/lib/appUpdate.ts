import { useSyncExternalStore } from "react";
import { registerSW } from "virtual:pwa-register";

export type AppUpdateReason = "asset-load-failure" | "build-version" | "service-worker";

export type AppUpdateState = {
  detectedAt: number | null;
  latestBuildId?: string;
  reason: AppUpdateReason | null;
  updateRequired: boolean;
};

type VersionCheckResult = "confirmed-update" | "current" | "failed" | "pending-mismatch";

const BUILD_VERSION_PREFIX = "arcane-ledger-build:";
const LIFECYCLE_CHECK_COOLDOWN_MS = 60_000;
const LIFECYCLE_CHECK_DEBOUNCE_MS = 750;
const VERSION_CHECK_TIMEOUT_MS = 8_000;
const SERVICE_WORKER_WAITING_TIMEOUT_MS = 5_000;
const STALE_ASSET_FAILURE_STORAGE_KEY =
  `arcane-ledger.update.asset-load-failure.${__ARCANE_LEDGER_BUILD_ID__}`;

const initialState: AppUpdateState = {
  detectedAt: null,
  reason: null,
  updateRequired: false
};

const listeners = new Set<() => void>();

let state = initialState;
let updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;
let serviceWorkerRegistration: ServiceWorkerRegistration | undefined;
let isLifecycleInitialized = false;
let isVersionCheckRunning = false;
let lifecycleCheckTimerId: number | null = null;
let lastLifecycleCheckStartedAt = 0;
let lastVersionCheckResult: VersionCheckResult | null = null;
let pendingMismatchBuildId: string | null = null;
let pendingMismatchCount = 0;

function emitUpdateState() {
  listeners.forEach((listener) => listener());
}

function setUpdateRequired(reason: AppUpdateReason, latestBuildId?: string) {
  if (state.updateRequired) {
    return;
  }

  state = {
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

function shouldRunLifecycleVersionCheck(trigger: "boot" | "focus" | "online" | "visible") {
  if (state.updateRequired) {
    return false;
  }

  if (trigger === "boot") {
    return true;
  }

  const now = Date.now();
  const cooldownHasElapsed = now - lastLifecycleCheckStartedAt >= LIFECYCLE_CHECK_COOLDOWN_MS;

  return cooldownHasElapsed || (trigger === "online" && lastVersionCheckResult === "failed");
}

function scheduleLifecycleVersionCheck(trigger: "boot" | "focus" | "online" | "visible") {
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

export function initializeAppUpdateLifecycle() {
  if (isLifecycleInitialized || typeof window === "undefined") {
    return;
  }

  isLifecycleInitialized = true;
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      setUpdateRequired("service-worker");
    },
    onRegisteredSW(_swScriptUrl, registration) {
      serviceWorkerRegistration = registration;
    }
  });

  scheduleLifecycleVersionCheck("boot");
  window.addEventListener("focus", () => scheduleLifecycleVersionCheck("focus"));
  window.addEventListener("online", () => scheduleLifecycleVersionCheck("online"));
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

export function markAssetLoadFailureUpdateRequired() {
  if (typeof sessionStorage !== "undefined") {
    try {
      sessionStorage.setItem(STALE_ASSET_FAILURE_STORAGE_KEY, String(Date.now()));
    } catch {
      // Session storage is only used to guard repeated stale-asset handling.
    }
  }

  setUpdateRequired("asset-load-failure");
}

function waitForInstallingWorker(worker: ServiceWorker, resolve: (hasWaitingWorker: boolean) => void) {
  if (worker.state === "installed") {
    resolve(true);
    return;
  }

  worker.addEventListener("statechange", () => {
    if (worker.state === "installed") {
      resolve(true);
    }
  });
}

async function waitForWaitingServiceWorker(registration: ServiceWorkerRegistration) {
  if (registration.waiting) {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    const timeoutId = window.setTimeout(() => resolve(false), SERVICE_WORKER_WAITING_TIMEOUT_MS);

    const resolveOnce = (hasWaitingWorker: boolean) => {
      window.clearTimeout(timeoutId);
      resolve(hasWaitingWorker);
    };

    if (registration.installing) {
      waitForInstallingWorker(registration.installing, resolveOnce);
      return;
    }

    registration.addEventListener(
      "updatefound",
      () => {
        if (registration.installing) {
          waitForInstallingWorker(registration.installing, resolveOnce);
          return;
        }

        resolveOnce(false);
      },
      { once: true }
    );
  });
}

async function activateWaitingServiceWorker() {
  if (!updateSW || !serviceWorkerRegistration) {
    return false;
  }

  try {
    const registration = await serviceWorkerRegistration.update();
    const hasWaitingWorker = await waitForWaitingServiceWorker(registration);

    if (!hasWaitingWorker) {
      return false;
    }

    await updateSW(true);
    return true;
  } catch {
    return false;
  }
}

export async function reloadForAppUpdate() {
  if (updateSW && state.reason === "service-worker") {
    try {
      await updateSW(true);
      return;
    } catch {
      // Fall through to a normal reload if the waiting service worker cannot be activated.
    }
  }

  if (await activateWaitingServiceWorker()) {
    return;
  }

  window.location.reload();
}
