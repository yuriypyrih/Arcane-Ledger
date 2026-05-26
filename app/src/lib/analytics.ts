import { getApiBaseUrl } from "../api/baseUrl";
import { captureAppError } from "./sentry";

type AnalyticsEventName =
  | "app_boot"
  | "session_start"
  | "page_view"
  | "offline_seen"
  | "online_restored"
  | "api_client_failure"
  | "character_created"
  | "character_sheet_opened"
  | "codex_search_submitted"
  | "support_feedback_submitted";

type AnalyticsPrimitive = string | number | boolean;

type AnalyticsEvent = {
  id: string;
  name: AnalyticsEventName;
  occurredAt: string;
  sessionId: string;
  visitorId: string;
  route: string;
  props?: Record<string, AnalyticsPrimitive>;
  metrics?: Record<string, number>;
  device?: Record<string, AnalyticsPrimitive>;
};

type TrackAnalyticsOptions = {
  metrics?: Record<string, number>;
  props?: Record<string, AnalyticsPrimitive | null | undefined>;
  route?: string;
};

const ANALYTICS_VISITOR_STORAGE_KEY = "arcane-ledger.analytics.visitorId";
const ANALYTICS_SESSION_STORAGE_KEY = "arcane-ledger.analytics.sessionId";
const ANALYTICS_FLUSH_DELAY_MS = 10_000;
const ANALYTICS_BATCH_LIMIT = 20;
const analyticsQueue: AnalyticsEvent[] = [];

let flushTimerId: number | null = null;
let analyticsBootstrapped = false;
let offlineStateTracked = false;

function isBrowserOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

function createAnalyticsId(prefix: string) {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}_${randomId}`;
}

function readStorageValue(storage: Storage | undefined, key: string) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorageValue(storage: Storage | undefined, key: string, value: string) {
  try {
    storage?.setItem(key, value);
  } catch {
    // Analytics storage is best effort only.
  }
}

function getStoredAnalyticsId(options: {
  fallbackPrefix: string;
  key: string;
  storage: Storage | undefined;
}) {
  const existingId = readStorageValue(options.storage, options.key);

  if (existingId) {
    return existingId;
  }

  const nextId = createAnalyticsId(options.fallbackPrefix);
  writeStorageValue(options.storage, options.key, nextId);
  return nextId;
}

function getVisitorId() {
  return getStoredAnalyticsId({
    fallbackPrefix: "visitor",
    key: ANALYTICS_VISITOR_STORAGE_KEY,
    storage: typeof localStorage === "undefined" ? undefined : localStorage
  });
}

function getSessionId() {
  return getStoredAnalyticsId({
    fallbackPrefix: "session",
    key: ANALYTICS_SESSION_STORAGE_KEY,
    storage: typeof sessionStorage === "undefined" ? undefined : sessionStorage
  });
}

function getCurrentRoute() {
  if (typeof location === "undefined") {
    return "unknown";
  }

  return location.pathname || "/";
}

function getPwaMode() {
  if (typeof matchMedia === "undefined") {
    return "browser";
  }

  return matchMedia("(display-mode: standalone)").matches ? "standalone" : "browser";
}

function getUserAgentFamily() {
  if (typeof navigator === "undefined") {
    return "unknown";
  }

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("firefox")) {
    return "firefox";
  }

  if (userAgent.includes("edg/")) {
    return "edge";
  }

  if (userAgent.includes("chrome")) {
    return "chrome";
  }

  if (userAgent.includes("safari")) {
    return "safari";
  }

  return "other";
}

function getDeviceAnalytics() {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  return {
    locale: navigator.language,
    platform: navigator.platform,
    pwaMode: getPwaMode(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    userAgentFamily: getUserAgentFamily(),
    viewportHeight: typeof window === "undefined" ? 0 : window.innerHeight,
    viewportWidth: typeof window === "undefined" ? 0 : window.innerWidth
  };
}

function sanitizePrimitiveRecord(
  value: Record<string, AnalyticsPrimitive | null | undefined> | undefined
) {
  if (!value) {
    return undefined;
  }

  const sanitized = Object.entries(value).reduce<Record<string, AnalyticsPrimitive>>(
    (nextValue, [key, entryValue]) => {
      if (entryValue === null || entryValue === undefined) {
        return nextValue;
      }

      if (typeof entryValue === "string") {
        const trimmedValue = entryValue.trim();

        if (trimmedValue) {
          nextValue[key] = trimmedValue.slice(0, 160);
        }

        return nextValue;
      }

      if (typeof entryValue === "number" && Number.isFinite(entryValue)) {
        nextValue[key] = entryValue;
        return nextValue;
      }

      if (typeof entryValue === "boolean") {
        nextValue[key] = entryValue;
      }

      return nextValue;
    },
    {}
  );

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function captureAnalyticsSendError(error: unknown) {
  if (isBrowserOffline()) {
    return;
  }

  captureAppError(error, {
    area: "analytics",
    action: "send",
    level: "warning"
  });
}

async function sendAnalyticsBatch(events: AnalyticsEvent[]) {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl || isBrowserOffline()) {
    return;
  }

  const requestUrl = new URL("analytics/events", apiBaseUrl).toString();

  try {
    const response = await fetch(requestUrl, {
      method: "POST",
      credentials: "include",
      keepalive: true,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ events })
    });

    if (!response.ok && response.status !== 429) {
      throw new Error(`Analytics request failed with status ${response.status}.`);
    }
  } catch (error) {
    captureAnalyticsSendError(error);
  }
}

function clearFlushTimer() {
  if (flushTimerId === null) {
    return;
  }

  window.clearTimeout(flushTimerId);
  flushTimerId = null;
}

export function flushAnalytics() {
  clearFlushTimer();

  if (analyticsQueue.length === 0 || isBrowserOffline()) {
    analyticsQueue.length = 0;
    return;
  }

  const events = analyticsQueue.splice(0, ANALYTICS_BATCH_LIMIT);
  void sendAnalyticsBatch(events);

  if (analyticsQueue.length > 0) {
    flushTimerId = window.setTimeout(flushAnalytics, ANALYTICS_FLUSH_DELAY_MS);
  }
}

function scheduleAnalyticsFlush() {
  if (analyticsQueue.length >= ANALYTICS_BATCH_LIMIT) {
    flushAnalytics();
    return;
  }

  if (flushTimerId !== null || typeof window === "undefined") {
    return;
  }

  flushTimerId = window.setTimeout(flushAnalytics, ANALYTICS_FLUSH_DELAY_MS);
}

export function trackAnalyticsEvent(name: AnalyticsEventName, options: TrackAnalyticsOptions = {}) {
  if (isBrowserOffline()) {
    return;
  }

  analyticsQueue.push({
    id: createAnalyticsId("event"),
    name,
    occurredAt: new Date().toISOString(),
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    route: options.route ?? getCurrentRoute(),
    props: sanitizePrimitiveRecord(options.props),
    metrics: options.metrics,
    device: getDeviceAnalytics()
  });
  scheduleAnalyticsFlush();
}

export function trackApiClientFailure(options: { path: string; status?: number }) {
  trackAnalyticsEvent("api_client_failure", {
    props: {
      path: options.path.split("?")[0]?.split("#")[0] ?? options.path,
      status: options.status ?? 0
    }
  });
}

export function bootstrapAnalytics() {
  if (analyticsBootstrapped || typeof window === "undefined") {
    return;
  }

  analyticsBootstrapped = true;
  trackAnalyticsEvent("app_boot", {
    props: {
      pwaMode: getPwaMode()
    }
  });
  trackAnalyticsEvent("session_start");

  window.addEventListener("offline", () => {
    offlineStateTracked = true;
  });
  window.addEventListener("online", () => {
    if (offlineStateTracked) {
      trackAnalyticsEvent("offline_seen");
      trackAnalyticsEvent("online_restored");
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushAnalytics();
    }
  });
}
