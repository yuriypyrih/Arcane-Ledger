function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const baseUrl = configuredBaseUrl ? configuredBaseUrl : "/api/v1";
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  return new URL(normalizedBaseUrl, globalThis.location.origin);
}

export type ApiRequestOptions = {
  signal?: AbortSignal;
};

export async function apiGet<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  const normalizedPath = path.replace(/^\//, "");
  const response = await fetch(new URL(normalizedPath, getApiBaseUrl()).toString(), {
    signal: options?.signal
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  const normalizedPath = path.replace(/^\//, "");
  const response = await fetch(new URL(normalizedPath, getApiBaseUrl()).toString(), {
    method: "POST",
    signal: options?.signal,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
