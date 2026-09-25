import { createHash } from "node:crypto";
import type { Types } from "mongoose";
import { AnalyticsAccountActivity } from "../models/AnalyticsAccountActivity.js";
import { AnalyticsDailyRollup } from "../models/Analytics.js";
import { captureServerError } from "../sentry.js";
import { analyticsActivityEvents } from "./analyticsActivityEvents.js";
import { buildActivityTimeline, utcDay, type TimelineRollup } from "./analyticsTimeline.js";

export async function recordAnalyticsAccountActivity(userId: Types.ObjectId, now = new Date()) {
  const accountKey = createHash("sha256").update(`account:${userId.toHexString()}`).digest("hex");
  try {
    await AnalyticsAccountActivity.updateOne(
      { date: utcDay(now), accountKey },
      { $setOnInsert: { firstRecordedAt: now } },
      { upsert: true }
    );
  } catch (error) {
    // A competing upsert for this exact account/day has already recorded the activity.
    if (error && typeof error === "object" && "code" in error && error.code === 11000) return;
    captureServerError(error, { area: "analytics", action: "record-account-activity" });
  }
}

export async function getAnalyticsActivityTimeline(
  range: { start: Date | null; end: Date },
  rollups: TimelineRollup[]
) {
  const [firstAccount, firstBrowser, accounts] = await Promise.all([
    AnalyticsAccountActivity.findOne()
      .sort({ firstRecordedAt: 1 })
      .select("firstRecordedAt")
      .lean(),
    AnalyticsDailyRollup.findOne({
      source: "frontend",
      eventName: { $in: analyticsActivityEvents },
      visitorType: { $in: ["anonymous", "authenticated"] }
    })
      .sort({ date: 1 })
      .select("date")
      .lean(),
    AnalyticsAccountActivity.find({
      date: { ...(range.start ? { $gte: range.start } : {}), $lte: range.end }
    })
      .select("date accountKey -_id")
      .lean()
  ]);

  return buildActivityTimeline({
    ...range,
    rollups,
    accounts,
    now: new Date(),
    accountHistoryStartedAt: firstAccount?.firstRecordedAt ?? null,
    browserHistoryStartedAt: firstBrowser?.date ?? null
  });
}
