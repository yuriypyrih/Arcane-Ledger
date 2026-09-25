import type { AnalyticsAccountActivityRecord } from "../models/AnalyticsAccountActivity.js";
import type { AnalyticsRollupRecord } from "../models/Analytics.js";
import { isAnalyticsActivityEvent } from "./analyticsActivityEvents.js";

export type AnalyticsTimelineValue = {
  count: number | null;
  from: string | null;
  through: string | null;
  partial: boolean;
  incomplete: boolean;
};

export type AnalyticsTimelineBucket = {
  start: string;
  end: string;
  partial: boolean;
  accounts: AnalyticsTimelineValue;
  anonymous: AnalyticsTimelineValue;
  legacy: AnalyticsTimelineValue;
};

export type AnalyticsActivityTimeline = {
  accountHistoryStartedAt: string | null;
  daily: AnalyticsTimelineBucket[];
  weekly: AnalyticsTimelineBucket[];
};

export type TimelineRollup = Pick<
  AnalyticsRollupRecord,
  | "date"
  | "source"
  | "eventName"
  | "visitorType"
  | "count"
  | "uniqueVisitorKeys"
  | "approximateUniques"
>;

const DAY_MS = 86_400_000;

export function utcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function dayLabel(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}

type DayActivity = {
  accounts: Set<string>;
  anonymous: Set<string>;
  legacy: Set<string>;
  anonymousIncomplete: boolean;
  legacyIncomplete: boolean;
};

export function buildActivityTimeline(options: {
  start: Date | null;
  end: Date;
  now: Date;
  browserHistoryStartedAt: Date | null;
  accountHistoryStartedAt: Date | null;
  rollups: TimelineRollup[];
  accounts: Pick<AnalyticsAccountActivityRecord, "date" | "accountKey">[];
}): AnalyticsActivityTimeline {
  const { accountHistoryStartedAt, browserHistoryStartedAt } = options;
  const accountStart = accountHistoryStartedAt ? utcDay(accountHistoryStartedAt).getTime() : null;
  const browserStart = browserHistoryStartedAt ? utcDay(browserHistoryStartedAt).getTime() : null;
  const historyStarts = [accountStart, browserStart].filter(
    (value): value is number => value !== null
  );
  const start = options.start ? utcDay(options.start).getTime() : Math.min(...historyStarts);
  const end = utcDay(options.end).getTime();
  const today = utcDay(options.now).getTime();
  const days = new Map<number, DayActivity>();
  const getDay = (time: number) => {
    let day = days.get(time);
    if (!day) {
      day = {
        accounts: new Set(),
        anonymous: new Set(),
        legacy: new Set(),
        anonymousIncomplete: false,
        legacyIncomplete: false
      };
      days.set(time, day);
    }
    return day;
  };

  for (const record of options.accounts) {
    getDay(utcDay(record.date).getTime()).accounts.add(record.accountKey);
  }
  for (const record of options.rollups) {
    if (record.source !== "frontend" || !isAnalyticsActivityEvent(record.eventName)) continue;
    const time = utcDay(record.date).getTime();
    const series =
      record.visitorType === "anonymous"
        ? "anonymous"
        : record.visitorType === "authenticated" && (accountStart === null || time < accountStart)
          ? "legacy"
          : null;
    if (!series) continue;
    const day = getDay(time);
    record.uniqueVisitorKeys.forEach((key) => day[series].add(key));
    day[`${series}Incomplete`] ||=
      record.approximateUniques || (record.count > 0 && record.uniqueVisitorKeys.length === 0);
  }

  function buildBuckets(weekly: boolean): AnalyticsTimelineBucket[] {
    const buckets: AnalyticsTimelineBucket[] = [];
    for (let cursor = start; cursor <= end; ) {
      const mondayOffset = (new Date(cursor).getUTCDay() + 6) % 7;
      const naturalEnd = weekly ? cursor + (6 - mondayOffset) * DAY_MS : cursor;
      const bucketEnd = Math.min(naturalEnd, end);
      const partial =
        (weekly && (mondayOffset !== 0 || bucketEnd < naturalEnd)) || bucketEnd >= today;

      function value(series: "accounts" | "anonymous" | "legacy"): AnalyticsTimelineValue {
        const historyStart = series === "accounts" ? accountStart : browserStart;
        const lastDay =
          series === "legacy" && accountStart !== null ? accountStart - DAY_MS : today;
        const from = historyStart === null ? Infinity : Math.max(cursor, historyStart);
        const through = Math.min(bucketEnd, today, lastDay);
        if (from > through) {
          return { count: null, from: null, through: null, partial: false, incomplete: false };
        }
        const keys = new Set<string>();
        let incomplete = false;
        for (let day = from; day <= through; day += DAY_MS) {
          const activity = days.get(day);
          activity?.[series].forEach((key) => keys.add(key));
          if (series !== "accounts") incomplete ||= activity?.[`${series}Incomplete`] ?? false;
        }
        return {
          // Without keys, counts cannot be deduplicated. Do not sum legacy counters.
          count: incomplete && keys.size === 0 ? null : keys.size,
          from: dayLabel(from),
          through: dayLabel(through),
          partial: partial || from > cursor || through < bucketEnd || from === historyStart,
          incomplete
        };
      }

      buckets.push({
        start: dayLabel(cursor),
        end: dayLabel(bucketEnd),
        partial,
        accounts: value("accounts"),
        anonymous: value("anonymous"),
        legacy: value("legacy")
      });
      cursor = bucketEnd + DAY_MS;
    }
    return buckets;
  }

  return {
    accountHistoryStartedAt: accountHistoryStartedAt?.toISOString() ?? null,
    daily: buildBuckets(false),
    weekly: buildBuckets(true)
  };
}
