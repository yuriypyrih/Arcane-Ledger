import type { Request, Response } from "express";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { captureFrontendAnalyticsBatch, readAnalyticsBatch } from "../services/analyticsService.js";
import { getAnalyticsSummary, type AnalyticsSummary } from "../services/analyticsSummaryService.js";
import { getUserFromAuthToken } from "../services/authUserService.js";
import { captureServerError } from "../sentry.js";

export type AnalyticsBatchEnvelope = {
  accepted: number;
  dropped: number;
};

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
  async (_request: Request, response: Response<AnalyticsSummary>) => {
    response.json(await getAnalyticsSummary());
  }
);
