import * as Sentry from "@sentry/react";
import type { Breadcrumb, ErrorEvent, SeverityLevel, User } from "@sentry/react";

type PrimitiveTagValue = string | number | boolean;

type AppErrorContext = {
  area: string;
  action?: string;
  level?: SeverityLevel;
  tags?: Record<string, PrimitiveTagValue | null | undefined>;
  extra?: Record<string, unknown>;
};

type AppBreadcrumb = {
  category: string;
  message: string;
  level?: SeverityLevel;
  data?: Record<string, unknown>;
};

export type AppSentryUser = Pick<User, "id" | "username" | "email">;

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
  "localstorage",
  "sessionstorage",
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

function readEnvValue(value: string | undefined): string | undefined {
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
    const url = new URL(value, globalThis.location?.origin);
    url.search = "";
    url.hash = "";
    return url.toString();
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

  if (value instanceof Blob) {
    return `[Blob(${value.size})]`;
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

export function isFrontendSentryEnabled() {
  return sentryActive;
}

export function initFrontendSentry() {
  if (!import.meta.env.PROD || sentryActive) {
    return;
  }

  const dsn = readEnvValue(import.meta.env.VITE_SENTRY_DSN);

  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: readEnvValue(import.meta.env.VITE_SENTRY_ENVIRONMENT) ?? import.meta.env.MODE,
    release: readEnvValue(import.meta.env.VITE_SENTRY_RELEASE),
    sendDefaultPii: false,
    beforeBreadcrumb,
    beforeSend: sanitizeEvent
  });

  sentryActive = true;
}

export function captureAppError(error: unknown, context: AppErrorContext) {
  if (!sentryActive) {
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag("area", context.area);
    scope.setLevel(context.level ?? "error");

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

export function addAppBreadcrumb({ category, message, level = "info", data }: AppBreadcrumb) {
  if (!sentryActive) {
    return;
  }

  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data: sanitizeRecord(data)
  });
}

export function setSentryUser(user: AppSentryUser) {
  if (!sentryActive) {
    return;
  }

  Sentry.setUser(user);
}

export function clearSentryUser() {
  if (!sentryActive) {
    return;
  }

  Sentry.setUser(null);
}
