import { apiGet, type ApiRequestOptions } from "./client";

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
};

export type AnalyticsSummary = {
  range: {
    end: string;
    start: string;
  };
  visitors: {
    authenticatedVisitors: number;
    pageViews: number;
    uniqueSessions: number;
    uniqueVisitors: number;
    unknownVisitors: number;
  };
  demographics: {
    countries: AnalyticsCountryBucket[];
  };
  health: {
    analyticsEvents: number;
    apiRequests: number;
    latencyBuckets: AnalyticsCountBucket[];
    statusFamilies: AnalyticsCountBucket[];
  };
  usage: {
    characterCreated: number;
    characterSheetOpened: number;
    codexSearches: number;
    supportFeedbackSubmitted: number;
    topRoutes: AnalyticsRouteBucket[];
  };
  characters: {
    activeSaved: number;
    averageLevel: number;
    createdThisYear: number;
    deleted: number;
    topClasses: AnalyticsNamedBucket[];
    topSpecies: AnalyticsNamedBucket[];
  };
  users: {
    active: number;
    createdThisYear: number;
    verified: number;
  };
};

export function fetchAnalyticsSummary(options?: ApiRequestOptions) {
  return apiGet<AnalyticsSummary>("/analytics/summary", options);
}
