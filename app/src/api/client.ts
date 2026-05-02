function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const baseUrl = configuredBaseUrl ? configuredBaseUrl : "/api/v1";
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  return new URL(normalizedBaseUrl, globalThis.location.origin);
}

export async function apiGet<T>(path: string): Promise<T> {
  const normalizedPath = path.replace(/^\//, "");
  const response = await fetch(new URL(normalizedPath, getApiBaseUrl()).toString());

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const normalizedPath = path.replace(/^\//, "");
  const response = await fetch(new URL(normalizedPath, getApiBaseUrl()).toString(), {
    method: "POST",
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
