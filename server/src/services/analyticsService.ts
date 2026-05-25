import { createHash } from "node:crypto";
import type { Request } from "express";
import type { Types } from "mongoose";
import { AnalyticsDailyRollup, AnalyticsEvent } from "../models/Analytics.js";
import type {
  AnalyticsDeviceRecord,
  AnalyticsEventRecord,
  AnalyticsGeoRecord,
  AnalyticsRollupRecord
} from "../models/Analytics.js";
import { getAnalyticsGeo } from "./analyticsGeoService.js";
import { captureServerError } from "../sentry.js";

export const frontendAnalyticsEventNames = [
  "app_boot",
  "session_start",
  "page_view",
  "offline_seen",
  "online_restored",
  "api_client_failure",
  "character_created",
  "character_sheet_opened",
  "codex_search_submitted",
  "support_feedback_submitted"
] as const;

export type FrontendAnalyticsEventName = (typeof frontendAnalyticsEventNames)[number];

export type AnalyticsEventInput = {
  id: string;
  name: string;
  occurredAt: string;
  sessionId: string;
  visitorId: string;
  route?: string;
  props?: unknown;
  metrics?: unknown;
  device?: unknown;
};

export type AnalyticsBatchResult = {
  accepted: number;
  dropped: number;
};

type VisitorType = AnalyticsRollupRecord["visitorType"];

type RollupIncrement = {
  count?: number;
  country?: string;
  eventName: string;
  latencyBucket?: string;
  method?: string;
  region?: string;
  city?: string;
  route?: string;
  sessionId?: string;
  source: AnalyticsRollupRecord["source"];
  statusFamily?: string;
  visitorId?: string;
  visitorType: VisitorType;
};

type RollupFilter = ReturnType<typeof getRollupFilter>;

const ANALYTICS_BATCH_LIMIT = 20;
const ANALYTICS_PAYLOAD_LIMIT_BYTES = 30_000;
const MAX_STRING_LENGTH = 160;
const MAX_ROUTE_LENGTH = 180;
const MAX_OBJECT_KEYS = 12;
const UNIQUE_KEY_CAP = 1000;
const BACKEND_ROLLUP_FLUSH_DELAY_MS = 15_000;
const BACKEND_ROLLUP_FLUSH_BUCKET_LIMIT = 50;
const frontendEventNameSet = new Set<string>(frontendAnalyticsEventNames);
const pendingBackendRollups = new Map<string, { count: number; filter: RollupFilter }>();

let backendRollupFlushTimer: NodeJS.Timeout | null = null;

const eventPropAllowlist: Record<FrontendAnalyticsEventName, Set<string>> = {
  app_boot: new Set(["pwaMode"]),
  session_start: new Set([]),
  page_view: new Set(["referrerOrigin"]),
  offline_seen: new Set([]),
  online_restored: new Set([]),
  api_client_failure: new Set(["path", "status"]),
  character_created: new Set(["className", "level", "species"]),
  character_sheet_opened: new Set(["className", "level", "species"]),
  codex_search_submitted: new Set(["category", "queryLength"]),
  support_feedback_submitted: new Set([])
};

const analyticsDeviceKeys = new Set([
  "locale",
  "platform",
  "pwaMode",
  "timezone",
  "userAgentFamily",
  "viewportHeight",
  "viewportWidth"
]);

function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function normalizeAnalyticsString(value: unknown, maxLength = MAX_STRING_LENGTH): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue.slice(0, maxLength);
}

function normalizeRoute(value: unknown) {
  const route = normalizeAnalyticsString(value, MAX_ROUTE_LENGTH);

  if (!route) {
    return "unknown";
  }

  return route.split("?")[0]?.split("#")[0] ?? "unknown";
}

function normalizeOccurredAt(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const occurredAt = new Date(value);
  const occurredAtTime = occurredAt.getTime();

  if (!Number.isFinite(occurredAtTime)) {
    return null;
  }

  const now = Date.now();
  const oldestAcceptedTime = now - 7 * 24 * 60 * 60 * 1000;
  const newestAcceptedTime = now + 5 * 60 * 1000;

  if (occurredAtTime < oldestAcceptedTime || occurredAtTime > newestAcceptedTime) {
    return null;
  }

  return occurredAt;
}

function normalizePrimitiveRecord(value: unknown, allowedKeys: Set<string>) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([key]) => allowedKeys.has(key))
    .slice(0, MAX_OBJECT_KEYS);
  const normalizedEntries = entries.reduce<Record<string, string | number | boolean>>(
    (nextValue, [key, entryValue]) => {
      if (typeof entryValue === "boolean") {
        nextValue[key] = entryValue;
        return nextValue;
      }

      if (typeof entryValue === "number" && Number.isFinite(entryValue)) {
        nextValue[key] = entryValue;
        return nextValue;
      }

      const stringValue = normalizeAnalyticsString(entryValue);

      if (stringValue) {
        nextValue[key] = stringValue;
      }

      return nextValue;
    },
    {}
  );

  return Object.keys(normalizedEntries).length > 0 ? normalizedEntries : undefined;
}

function normalizeMetrics(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const normalizedMetrics = Object.entries(value as Record<string, unknown>)
    .slice(0, MAX_OBJECT_KEYS)
    .reduce<Record<string, number>>((nextValue, [key, entryValue]) => {
      const normalizedKey = normalizeAnalyticsString(key, 60);

      if (
        normalizedKey &&
        typeof entryValue === "number" &&
        Number.isFinite(entryValue) &&
        entryValue >= 0
      ) {
        nextValue[normalizedKey] = entryValue;
      }

      return nextValue;
    }, {});

  return Object.keys(normalizedMetrics).length > 0 ? normalizedMetrics : undefined;
}

function normalizeDevice(value: unknown): AnalyticsDeviceRecord | undefined {
  const device = normalizePrimitiveRecord(value, analyticsDeviceKeys);

  if (!device) {
    return undefined;
  }

  return device as AnalyticsDeviceRecord;
}

function hashUniqueKey(_date: Date, value: string) {
  return createHash("sha256")
    .update(value)
    .digest("hex")
    .slice(0, 32);
}

function getRollupFilter(increment: RollupIncrement) {
  const date = startOfUtcDay(new Date());

  return {
    date,
    eventName: increment.eventName,
    source: increment.source,
    route: increment.route ?? "all",
    method: increment.method ?? "all",
    statusFamily: increment.statusFamily ?? "all",
    latencyBucket: increment.latencyBucket ?? "all",
    country: increment.country ?? "unknown",
    region: increment.region ?? "unknown",
    city: increment.city ?? "unknown",
    visitorType: increment.visitorType
  };
}

function getRollupFilterKey(filter: RollupFilter) {
  return [
    filter.date.toISOString(),
    filter.eventName,
    filter.source,
    filter.route,
    filter.method,
    filter.statusFamily,
    filter.latencyBucket,
    filter.country,
    filter.region,
    filter.city,
    filter.visitorType
  ].join("|");
}

async function updateRollupUniques(
  filter: RollupFilter,
  increment: Pick<RollupIncrement, "sessionId" | "visitorId">
) {
  if (!increment.visitorId && !increment.sessionId) {
    return;
  }

  const rollup = await AnalyticsDailyRollup.findOne(filter).select(
    "approximateUniques uniqueSessionKeys uniqueSessions uniqueVisitorKeys uniqueVisitors"
  );

  if (!rollup || rollup.approximateUniques) {
    return;
  }

  const update: {
    $addToSet?: { uniqueSessionKeys?: string; uniqueVisitorKeys?: string };
    $set?: Partial<AnalyticsRollupRecord>;
  } = {};
  const visitorKey = increment.visitorId ? hashUniqueKey(filter.date, increment.visitorId) : null;
  const sessionKey = increment.sessionId ? hashUniqueKey(filter.date, increment.sessionId) : null;

  if (
    visitorKey &&
    !rollup.uniqueVisitorKeys.includes(visitorKey) &&
    rollup.uniqueVisitorKeys.length < UNIQUE_KEY_CAP
  ) {
    update.$addToSet = {
      ...(update.$addToSet ?? {}),
      uniqueVisitorKeys: visitorKey
    };
    update.$set = {
      ...(update.$set ?? {}),
      uniqueVisitors: rollup.uniqueVisitorKeys.length + 1
    };
  }

  if (
    sessionKey &&
    !rollup.uniqueSessionKeys.includes(sessionKey) &&
    rollup.uniqueSessionKeys.length < UNIQUE_KEY_CAP
  ) {
    update.$addToSet = {
      ...(update.$addToSet ?? {}),
      uniqueSessionKeys: sessionKey
    };
    update.$set = {
      ...(update.$set ?? {}),
      uniqueSessions: rollup.uniqueSessionKeys.length + 1
    };
  }

  if (
    (visitorKey && rollup.uniqueVisitorKeys.length >= UNIQUE_KEY_CAP) ||
    (sessionKey && rollup.uniqueSessionKeys.length >= UNIQUE_KEY_CAP)
  ) {
    update.$set = {
      ...(update.$set ?? {}),
      approximateUniques: true
    };
  }

  if (update.$addToSet || update.$set) {
    await AnalyticsDailyRollup.updateOne(filter, update);
  }
}

async function incrementRollupByFilter(filter: RollupFilter, count: number) {
  await AnalyticsDailyRollup.updateOne(
    filter,
    {
      $inc: {
        count
      },
      $setOnInsert: {
        ...filter,
        approximateUniques: false,
        uniqueSessionKeys: [],
        uniqueSessions: 0,
        uniqueVisitorKeys: [],
        uniqueVisitors: 0
      }
    },
    {
      upsert: true
    }
  );
}

async function incrementRollup(increment: RollupIncrement) {
  const filter = getRollupFilter(increment);

  await incrementRollupByFilter(filter, increment.count ?? 1);
  await updateRollupUniques(filter, increment);
}

function scheduleBackendRollupFlush() {
  if (backendRollupFlushTimer || pendingBackendRollups.size === 0) {
    return;
  }

  backendRollupFlushTimer = setTimeout(flushBackendRollups, BACKEND_ROLLUP_FLUSH_DELAY_MS);
  backendRollupFlushTimer.unref();
}

function queueBackendRollup(increment: RollupIncrement) {
  const filter = getRollupFilter(increment);
  const key = getRollupFilterKey(filter);
  const currentRollup = pendingBackendRollups.get(key);

  pendingBackendRollups.set(key, {
    filter,
    count: (currentRollup?.count ?? 0) + (increment.count ?? 1)
  });

  if (pendingBackendRollups.size >= BACKEND_ROLLUP_FLUSH_BUCKET_LIMIT) {
    void flushBackendRollups();
    return;
  }

  scheduleBackendRollupFlush();
}

async function flushBackendRollups() {
  if (backendRollupFlushTimer) {
    clearTimeout(backendRollupFlushTimer);
    backendRollupFlushTimer = null;
  }

  const rollups = [...pendingBackendRollups.values()];
  pendingBackendRollups.clear();

  if (rollups.length === 0) {
    return;
  }

  try {
    await Promise.all(
      rollups.map((rollup) => incrementRollupByFilter(rollup.filter, rollup.count))
    );
  } catch (error) {
    captureServerError(error, {
      area: "analytics",
      action: "flush-backend-rollups"
    });
  }
}

function normalizeAnalyticsEvent(
  event: unknown,
  options: {
    geo: AnalyticsGeoRecord;
    userId?: Types.ObjectId | null;
  }
): AnalyticsEventRecord | null {
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    return null;
  }

  const eventRecord = event as AnalyticsEventInput;
  const eventName = normalizeAnalyticsString(eventRecord.name, 80);

  if (!eventName || !frontendEventNameSet.has(eventName)) {
    return null;
  }

  const eventId = normalizeAnalyticsString(eventRecord.id, 80);
  const occurredAt = normalizeOccurredAt(eventRecord.occurredAt);
  const sessionId = normalizeAnalyticsString(eventRecord.sessionId, 100);
  const visitorId = normalizeAnalyticsString(eventRecord.visitorId, 100);

  if (!eventId || !occurredAt || !sessionId || !visitorId) {
    return null;
  }

  const typedEventName = eventName as FrontendAnalyticsEventName;
  const userId = options.userId ?? null;

  return {
    eventId,
    name: typedEventName,
    occurredAt,
    receivedAt: new Date(),
    sessionId,
    visitorId,
    userId,
    route: normalizeRoute(eventRecord.route),
    source: "frontend",
    visitorType: userId ? "authenticated" : "anonymous",
    geo: options.geo,
    device: normalizeDevice(eventRecord.device),
    props: normalizePrimitiveRecord(eventRecord.props, eventPropAllowlist[typedEventName]),
    metrics: normalizeMetrics(eventRecord.metrics)
  };
}

export function readAnalyticsBatch(value: unknown): AnalyticsEventInput[] | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const bodySize = JSON.stringify(value).length;

  if (bodySize > ANALYTICS_PAYLOAD_LIMIT_BYTES) {
    return null;
  }

  const events = (value as { events?: unknown }).events;

  if (!Array.isArray(events) || events.length > ANALYTICS_BATCH_LIMIT) {
    return null;
  }

  return events as AnalyticsEventInput[];
}

export async function captureFrontendAnalyticsBatch(options: {
  events: unknown[];
  request: Request;
  userId?: Types.ObjectId | null;
}): Promise<AnalyticsBatchResult> {
  const geo = await getAnalyticsGeo(options.request);
  const records = options.events
    .map((event) => normalizeAnalyticsEvent(event, { geo, userId: options.userId }))
    .filter((event): event is AnalyticsEventRecord => Boolean(event));

  if (records.length > 0) {
    await AnalyticsEvent.insertMany(records, {
      ordered: false
    });
    await Promise.all(
      records.map((record) =>
        incrementRollup({
          eventName: record.name,
          source: "frontend",
          route: record.route,
          country: record.geo.country,
          region: record.geo.region,
          city: record.geo.city,
          sessionId: record.sessionId,
          visitorId: record.visitorId,
          visitorType: record.visitorType
        })
      )
    );
  }

  return {
    accepted: records.length,
    dropped: options.events.length - records.length
  };
}

function getStatusFamily(statusCode: number) {
  if (statusCode >= 500) {
    return "5xx";
  }

  if (statusCode >= 400) {
    return statusCode === 429 ? "429" : "4xx";
  }

  if (statusCode >= 300) {
    return "3xx";
  }

  if (statusCode >= 200) {
    return "2xx";
  }

  return "other";
}

function getLatencyBucket(durationMs: number) {
  if (durationMs < 100) {
    return "lt_100ms";
  }

  if (durationMs < 300) {
    return "100_299ms";
  }

  if (durationMs < 1000) {
    return "300_999ms";
  }

  if (durationMs < 3000) {
    return "1_3s";
  }

  return "gt_3s";
}

export function sanitizeRequestRoute(value: string) {
  return (value.split("?")[0] ?? "unknown")
    .replace(/[0-9a-f]{24}/gi, ":id")
    .replace(/\/\d+(?=\/|$)/g, "/:id")
    .slice(0, MAX_ROUTE_LENGTH);
}

export function recordBackendRequestMetric(options: {
  durationMs: number;
  method: string;
  route: string;
  statusCode: number;
}) {
  queueBackendRollup({
    eventName: "server_request",
    source: "backend",
    route: sanitizeRequestRoute(options.route),
    method: options.method.toUpperCase(),
    statusFamily: getStatusFamily(options.statusCode),
    latencyBucket: getLatencyBucket(options.durationMs),
    visitorType: "server"
  });
}

export function recordBackendLifecycleMetric(eventName: "database_connection_health" | "server_startup") {
  queueBackendRollup({
    eventName,
    source: "backend",
    route: "server",
    visitorType: "server"
  });
}
