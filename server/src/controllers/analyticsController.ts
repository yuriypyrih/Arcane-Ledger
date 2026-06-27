import type { Request, Response } from "express";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { captureFrontendAnalyticsBatch, readAnalyticsBatch } from "../services/analyticsService.js";
import {
  getAnalyticsSummary,
  type AnalyticsSummary,
  type AnalyticsSummaryOptions,
  type AnalyticsSummaryRangeKey
} from "../services/analyticsSummaryService.js";
import { getUserFromAuthToken } from "../services/authUserService.js";
import { captureServerError } from "../sentry.js";

export type AnalyticsBatchEnvelope = {
  accepted: number;
  dropped: number;
};

const analyticsSummaryRangeKeys = new Set<AnalyticsSummaryRangeKey>([
  "last7",
  "last30",
  "all",
  "custom"
]);

function createAnalyticsRangeError(message: string) {
  return new AppError(message, 400, "INVALID_ANALYTICS_RANGE");
}

function readOptionalQueryString(value: unknown, fieldName: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return undefined;
    }

    if (value.length > 1) {
      throw createAnalyticsRangeError(`Analytics query "${fieldName}" must be provided once.`);
    }

    return readOptionalQueryString(value[0], fieldName);
  }

  if (typeof value !== "string") {
    throw createAnalyticsRangeError(`Analytics query "${fieldName}" must be a string.`);
  }

  return value;
}

function readAnalyticsSummaryOptions(request: Request): AnalyticsSummaryOptions {
  const query = request.query as Record<string, unknown>;
  const rangeValue = readOptionalQueryString(query.range, "range")?.trim() || "last30";

  if (!analyticsSummaryRangeKeys.has(rangeValue as AnalyticsSummaryRangeKey)) {
    throw createAnalyticsRangeError("Analytics range must be last7, last30, all, or custom.");
  }

  return {
    range: rangeValue as AnalyticsSummaryRangeKey,
    start: readOptionalQueryString(query.start, "start") ?? null,
    end: readOptionalQueryString(query.end, "end") ?? null
  };
}

async function getOptionalAnalyticsUserId(request: Request) {
  const { authCookieName } = getAppConfig();
  const token = request.cookies?.[authCookieName];

  if (typeof token !== "string" || !token) {
    return null;
  }

  try {
    const user = await getUserFromAuthToken(token);
    return user._id;
  } catch {
    return null;
  }
}

export const collectAnalyticsEvents = asyncHandler(
  async (request: Request, response: Response<AnalyticsBatchEnvelope>) => {
    const events = readAnalyticsBatch(request.body);

    if (!events) {
      throw new AppError("Analytics batch is invalid.", 400, "INVALID_ANALYTICS_BATCH");
    }

    try {
      const result = await captureFrontendAnalyticsBatch({
        events,
        request,
        userId: await getOptionalAnalyticsUserId(request)
      });

      response.status(202).json(result);
    } catch (error) {
      captureServerError(error, {
        area: "analytics",
        action: "collect-events"
      });
      response.status(202).json({
        accepted: 0,
        dropped: events.length
      });
    }
  }
);

export const getAnalyticsSummaryController = asyncHandler(
  async (request: Request, response: Response<AnalyticsSummary>) => {
    response.json(await getAnalyticsSummary(readAnalyticsSummaryOptions(request)));
  }
);
