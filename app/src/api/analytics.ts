import { apiGet, type ApiRequestOptions } from "./client";

export type AnalyticsSummaryRangeKey = "last30" | "all" | "custom";

export type AnalyticsSummaryQuery = {
  end?: string;
  range?: AnalyticsSummaryRangeKey;
  start?: string;
};

export type AnalyticsCountBucket = {
  count: number;
  label: string;
};

export type AnalyticsRouteBucket = {
  count: number;
  route: string;
};

export type AnalyticsNamedBucket = {
  count: number;
  name: string;
};

export type AnalyticsCountryBucket = {
  count: number;
  country: string;
  label: string;
};

export type AnalyticsSummary = {
  range: {
    end: string;
    start: string | null;
    type: AnalyticsSummaryRangeKey;
  };
  overview: {
    anonymousVisitors: number;
    createdCharacters: number;
    createdUsers: number;
    emailsSent: number;
    totalActiveCharacters: number;
    totalActiveUsers: number;
  };
  demographics: {
    all: {
      countries: AnalyticsCountryBucket[];
    };
    anonymous: {
      countries: AnalyticsCountryBucket[];
    };
    authenticated: {
      countries: AnalyticsCountryBucket[];
    };
  };
  health: {
    analyticsEvents: number;
    apiRequests: number;
    latencyBuckets: AnalyticsCountBucket[];
    statusFamilies: AnalyticsCountBucket[];
  };
  routes: {
    topRoutes: AnalyticsRouteBucket[];
  };
  characters: {
    topClasses: AnalyticsNamedBucket[];
    topSpecies: AnalyticsNamedBucket[];
  };
};

function createSummaryPath(query: AnalyticsSummaryQuery = {}) {
  const searchParams = new URLSearchParams();

  if (query.range) {
    searchParams.set("range", query.range);
  }

  if (query.start !== undefined) {
    searchParams.set("start", query.start);
  }

  if (query.end !== undefined) {
    searchParams.set("end", query.end);
  }

  const queryString = searchParams.toString();

  return `/analytics/summary${queryString ? `?${queryString}` : ""}`;
}

export function fetchAnalyticsSummary(
  query?: AnalyticsSummaryQuery,
  options?: ApiRequestOptions
) {
  return apiGet<AnalyticsSummary>(createSummaryPath(query), options);
}
