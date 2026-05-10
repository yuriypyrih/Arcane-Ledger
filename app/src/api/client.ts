import { showToast, store } from "../store";

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

export class ApiOfflineError extends Error {
  constructor() {
    super("Server Unavailable");
    this.name = "ApiOfflineError";
  }
}

export class ApiRequestFailedError extends Error {
  readonly originalError?: unknown;
  readonly status?: number;

  constructor(message: string, options?: { status?: number; originalError?: unknown }) {
    super(message);
    this.name = "ApiRequestFailedError";
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
    throw new ApiRequestFailedError("API request failed.", { originalError: error });
  }

  if (!response.ok) {
    notifyApiRequestFailed(options);
    throw new ApiRequestFailedError(`API request failed with status ${response.status}`, {
      status: response.status
    });
  }

  return (await response.json()) as T;
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
