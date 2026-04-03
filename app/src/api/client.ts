function getApiBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api/v1";
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const normalizedPath = path.replace(/^\//, "");
  const response = await fetch(new URL(normalizedPath, getApiBaseUrl()).toString());

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
