export function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!configuredBaseUrl) {
    return null;
  }

  const baseUrl = configuredBaseUrl;
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  return new URL(normalizedBaseUrl, globalThis.location.origin);
}
