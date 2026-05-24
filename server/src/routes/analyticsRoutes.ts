import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  collectAnalyticsEvents,
  getAnalyticsSummaryController
} from "../controllers/analyticsController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

const ANALYTICS_WINDOW_MS = 60 * 1000;

const analyticsRateLimit = rateLimit({
  windowMs: ANALYTICS_WINDOW_MS,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many analytics requests. Try again later."
    }
  }
});

const analyticsRoutes = Router();

analyticsRoutes.post("/events", analyticsRateLimit, collectAnalyticsEvents);
analyticsRoutes.get("/summary", requireAuth, requireAdmin, getAnalyticsSummaryController);

export { analyticsRoutes };
