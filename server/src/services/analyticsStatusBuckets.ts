export const ANALYTICS_STATUS_BUCKETS = [
  "2xx",
  "300",
  "301",
  "302",
  "304",
  "3xx other",
  "400",
  "401",
  "403",
  "404",
  "409",
  "413",
  "415",
  "429",
  "4xx other",
  "500",
  "502",
  "5xx other",
  "other"
] as const;

export type AnalyticsStatusBucket = (typeof ANALYTICS_STATUS_BUCKETS)[number];

const explicitStatusBuckets = new Set<number>([
  300,
  301,
  302,
  304,
  400,
  401,
  403,
  404,
  409,
  413,
  415,
  429,
  500,
  502
]);
const statusBucketSet = new Set<string>(ANALYTICS_STATUS_BUCKETS);

export function getRequestStatusBucket(statusCode: number): AnalyticsStatusBucket {
  if (!Number.isInteger(statusCode)) {
    return "other";
  }

  if (statusCode >= 200 && statusCode < 300) {
    return "2xx";
  }

  if (explicitStatusBuckets.has(statusCode)) {
    return String(statusCode) as AnalyticsStatusBucket;
  }

  if (statusCode >= 300 && statusCode < 400) {
    return "3xx other";
  }

  if (statusCode >= 400 && statusCode < 500) {
    return "4xx other";
  }

  if (statusCode >= 500 && statusCode < 600) {
    return "5xx other";
  }

  return "other";
}

export function normalizeAnalyticsStatusBucket(value: unknown): AnalyticsStatusBucket {
  if (typeof value !== "string") {
    return "other";
  }

  const label = value.trim();

  if (label === "3xx") {
    return "3xx other";
  }

  if (label === "4xx") {
    return "4xx other";
  }

  if (label === "5xx") {
    return "5xx other";
  }

  return statusBucketSet.has(label) ? (label as AnalyticsStatusBucket) : "other";
}
