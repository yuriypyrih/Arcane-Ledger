import { showToast, store } from "../store";
import { addAppBreadcrumb, captureAppError } from "../lib/sentry";

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!configuredBaseUrl) {
    return null;
  }

  const baseUrl = configuredBaseUrl;
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  return new URL(normalizedBaseUrl, globalThis.location.origin);
}

export type ApiRequestOptions = {
  signal?: AbortSignal;
  suppressFailureToast?: boolean;
};

export type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export class ApiOfflineError extends Error {
  constructor() {
    super("Server Unavailable");
    this.name = "ApiOfflineError";
  }
}

export class ApiRequestFailedError extends Error {
  readonly code?: string;
  readonly details?: unknown;
  readonly originalError?: unknown;
  readonly status?: number;

  constructor(
    message: string,
    options?: { code?: string; details?: unknown; status?: number; originalError?: unknown }
  ) {
    super(message);
    this.name = "ApiRequestFailedError";
    this.code = options?.code;
    this.details = options?.details;
    this.originalError = options?.originalError;
    this.status = options?.status;
  }
}

export function isApiOfflineError(error: unknown): error is ApiOfflineError {
  return error instanceof ApiOfflineError;
}

export function isApiAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"
  );
}

function isBrowserOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

function notifyApiRequestFailed(options?: ApiRequestOptions) {
  if (options?.suppressFailureToast) {
    return;
  }

  store.dispatch(
    showToast({
      text: "Server call failed.",
      type: "error"
    })
  );
}

function getStatusLevel(status: number) {
  return status >= 500 ? "error" : "warning";
}

function sanitizeApiPath(value: string) {
  return value.split("?")[0]?.split("#")[0] ?? value;
}

function captureApiFailure(
  error: unknown,
  context: { path: string; requestUrl: string; status?: number }
) {
  const status = context.status;
  const path = sanitizeApiPath(context.path);
  const requestUrl = sanitizeApiPath(new URL(context.requestUrl).pathname);

  if (status !== undefined && status < 500) {
    return;
  }

  const level = status === undefined ? "error" : getStatusLevel(status);

  addAppBreadcrumb({
    category: "api",
    message: "API request failed.",
    level,
    data: {
      path,
      status
    }
  });
  captureAppError(error, {
    area: "api",
    action: "request",
    level,
    extra: {
      path,
      requestUrl,
      status
    }
  });
}

async function readResponseJson<T>(response: Response): Promise<T> {
  const responseText = await response.text();

  if (!responseText) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
}

async function readApiError(response: Response): Promise<ApiErrorBody | null> {
  try {
    return await readResponseJson<ApiErrorBody>(response);
  } catch {
    return null;
  }
}

async function apiRequest<T>(
  path: string,
  requestInit: RequestInit,
  options?: ApiRequestOptions
): Promise<T> {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl || isBrowserOffline()) {
    throw new ApiOfflineError();
  }

  const normalizedPath = path.replace(/^\//, "");
  const requestUrl = new URL(normalizedPath, apiBaseUrl).toString();

  let response: Response;

  try {
    response = await fetch(requestUrl, {
      ...requestInit,
      credentials: "include",
      signal: options?.signal
    });
  } catch (error) {
    if (isApiAbortError(error)) {
      throw error;
    }

    if (isBrowserOffline()) {
      throw new ApiOfflineError();
    }

    notifyApiRequestFailed(options);
    const requestError = new ApiRequestFailedError("API request failed.", { originalError: error });
    captureApiFailure(requestError, { path, requestUrl });
    throw requestError;
  }

  if (!response.ok) {
    const apiError = await readApiError(response);
    const errorMessage =
      apiError?.error?.message ?? `API request failed with status ${response.status}`;

    notifyApiRequestFailed(options);
    const requestError = new ApiRequestFailedError(errorMessage, {
      code: apiError?.error?.code,
      details: apiError?.error?.details,
      status: response.status
    });
    captureApiFailure(requestError, { path, requestUrl, status: response.status });
    throw requestError;
  }

  return readResponseJson<T>(response);
}

export async function apiGet<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  return apiRequest<T>(path, {}, options);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  return apiRequest<T>(
    path,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    },
    options
  );
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  return apiRequest<T>(
    path,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    },
    options
  );
}

export async function apiPut<T>(
  path: string,
  body: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  return apiRequest<T>(
    path,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    },
    options
  );
}

export async function apiDelete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  return apiRequest<T>(
    path,
    {
      method: "DELETE"
    },
    options
  );
}

export async function apiDeleteJson<T>(
  path: string,
  body: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  return apiRequest<T>(
    path,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    },
    options
  );
}

export async function apiPutBlob<T>(
  path: string,
  blob: Blob,
  options?: ApiRequestOptions
): Promise<T> {
  return apiRequest<T>(
    path,
    {
      method: "PUT",
      headers: {
        "Content-Type": blob.type || "application/octet-stream"
      },
      body: blob
    },
    options
  );
}
