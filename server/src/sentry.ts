import * as Sentry from "@sentry/node";
import type { Breadcrumb, ErrorEvent } from "@sentry/node";
import type { Express } from "express";
import { AppError } from "./errors/AppError.js";
import type { AppConfig } from "./config/env.js";

type PrimitiveTagValue = string | number | boolean;

type ServerErrorContext = {
  area: string;
  action?: string;
  tags?: Record<string, PrimitiveTagValue | null | undefined>;
  extra?: Record<string, unknown>;
};

const REDACTED_VALUE = "[Filtered]";
const TRUNCATED_VALUE = "[Truncated]";
const MAX_SANITIZE_DEPTH = 3;
const MAX_OBJECT_KEYS = 20;
const MAX_STRING_LENGTH = 500;

const sensitiveKeyNames = new Set([
  "authorization",
  "cookie",
  "cookies",
  "password",
  "secret",
  "token",
  "accesstoken",
  "refreshtoken",
  "body",
  "data",
  "payload",
  "requestbody",
  "responsebody",
  "character",
  "characters",
  "charactersheet",
  "characterstate",
  "characterdraft",
  "notes",
  "note"
]);

let sentryActive = false;

function readConfigValue(value: string | undefined): string | undefined {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function shouldRedactKey(key: string): boolean {
  return sensitiveKeyNames.has(key.toLowerCase());
}

function sanitizeString(value: string): string {
  return value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}...` : value;
}

function sanitizeUrl(value: string): string {
  try {
    const url = new URL(value, "http://localhost");
    url.search = "";
    url.hash = "";
    return url.pathname;
  } catch {
    return value.split("?")[0]?.split("#")[0] ?? value;
  }
}

function sanitizeValue(value: unknown, depth = 0, key?: string): unknown {
  if (key && shouldRedactKey(key)) {
    return REDACTED_VALUE;
  }

  if (
    value === null ||
    value === undefined ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (depth >= MAX_SANITIZE_DEPTH) {
    return TRUNCATED_VALUE;
  }

  if (Array.isArray(value)) {
    return `[Array(${value.length})]`;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: sanitizeString(value.message)
    };
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .slice(0, MAX_OBJECT_KEYS)
      .reduce<Record<string, unknown>>((nextValue, [entryKey, entryValue]) => {
        nextValue[entryKey] = sanitizeValue(entryValue, depth + 1, entryKey);
        return nextValue;
      }, {});
  }

  return String(value);
}

function sanitizeRecord<T extends Record<string, unknown> | undefined>(value: T): T {
  if (!value) {
    return value;
  }

  return sanitizeValue(value) as T;
}

function sanitizeHeaders(headers: Record<string, string> | undefined) {
  if (!headers) {
    return headers;
  }

  return Object.entries(headers).reduce<Record<string, string>>((nextHeaders, [key, value]) => {
    const sanitizedValue = shouldRedactKey(key) ? REDACTED_VALUE : sanitizeValue(value, 0, key);
    nextHeaders[key] = typeof sanitizedValue === "string" ? sanitizedValue : String(sanitizedValue);
    return nextHeaders;
  }, {});
}

function sanitizeBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  const nextBreadcrumb: Breadcrumb = {
    ...breadcrumb,
    data: sanitizeRecord(breadcrumb.data)
  };
  const breadcrumbUrl = nextBreadcrumb.data?.url;

  if (typeof breadcrumbUrl === "string") {
    nextBreadcrumb.data = {
      ...nextBreadcrumb.data,
      url: sanitizeUrl(breadcrumbUrl)
    };
  }

  return nextBreadcrumb;
}

function beforeBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  if (
    breadcrumb.category === "console" &&
    (breadcrumb.level === "debug" || breadcrumb.level === "info" || breadcrumb.level === "log")
  ) {
    return null;
  }

  return sanitizeBreadcrumb(breadcrumb);
}

function sanitizeEvent(event: ErrorEvent): ErrorEvent {
  const request = event.request
    ? {
        ...event.request,
        cookies: undefined,
        data: undefined,
        headers: sanitizeHeaders(event.request.headers),
        query_string: undefined,
        url: event.request.url ? sanitizeUrl(event.request.url) : event.request.url
      }
    : event.request;

  return {
    ...event,
    extra: sanitizeRecord(event.extra),
    request,
    breadcrumbs: event.breadcrumbs?.map(sanitizeBreadcrumb)
  };
}

function getErrorStatusCode(error: unknown): number | null {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (!error || typeof error !== "object") {
    return null;
  }

  const errorRecord = error as {
    status?: unknown;
    statusCode?: unknown;
    status_code?: unknown;
    output?: { statusCode?: unknown };
  };
  const status =
    errorRecord.statusCode ??
    errorRecord.status ??
    errorRecord.status_code ??
    errorRecord.output?.statusCode;
  const numericStatus = Number(status);

  return Number.isFinite(numericStatus) ? numericStatus : null;
}

function shouldHandleError(error: unknown): boolean {
  const statusCode = getErrorStatusCode(error);
  return statusCode === null || statusCode >= 500;
}

export function isServerSentryEnabled() {
  return sentryActive;
}

export function initServerSentry(config: AppConfig) {
  if (config.nodeEnv !== "production" || sentryActive) {
    return;
  }

  const dsn = readConfigValue(config.sentryDsn);

  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: readConfigValue(config.sentryEnvironment) ?? config.nodeEnv,
    release: readConfigValue(config.sentryRelease),
    sendDefaultPii: false,
    beforeBreadcrumb,
    beforeSend: sanitizeEvent
  });

  sentryActive = true;
}

export function setupSentryExpressErrorHandler(app: Express) {
  if (!sentryActive) {
    return;
  }

  Sentry.setupExpressErrorHandler(app, {
    shouldHandleError
  });
}

export function captureServerError(error: unknown, context: ServerErrorContext) {
  if (!sentryActive) {
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag("area", context.area);

    if (context.action) {
      scope.setTag("action", context.action);
    }

    Object.entries(context.tags ?? {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        scope.setTag(key, value);
      }
    });

    if (context.extra) {
      scope.setContext("arcaneLedger", sanitizeValue(context.extra) as Record<string, unknown>);
    }

    Sentry.captureException(error);
  });
}

export function addServerBreadcrumb({ category, message, data }: Breadcrumb) {
  if (!sentryActive) {
    return;
  }

  Sentry.addBreadcrumb({
    category,
    message,
    level: "info",
    data: sanitizeRecord(data)
  });
}

export async function flushSentry(timeoutMs = 2000) {
  if (!sentryActive) {
    return;
  }

  await Sentry.flush(timeoutMs);
}
