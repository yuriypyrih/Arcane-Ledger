import type { PipelineStage } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { AnalyticsDailyRollup, type AnalyticsRollupRecord } from "../models/Analytics.js";
import { CharacterSheet } from "../models/CharacterSheet.js";
import { EmailDelivery } from "../models/EmailDelivery.js";
import { User } from "../models/User.js";

type RollupSummaryRecord = Pick<
  AnalyticsRollupRecord,
  | "approximateUniques"
  | "city"
  | "count"
  | "country"
  | "date"
  | "eventName"
  | "latencyBucket"
  | "method"
  | "region"
  | "route"
  | "source"
  | "statusFamily"
  | "uniqueSessionKeys"
  | "uniqueSessions"
  | "uniqueVisitorKeys"
  | "uniqueVisitors"
  | "visitorType"
>;

type AnalyticsCountBucket = {
  count: number;
  label: string;
};

type AnalyticsRouteBucket = {
  count: number;
  route: string;
};

type AnalyticsNamedBucket = {
  count: number;
  name: string;
};

type AnalyticsCountryBucket = {
  count: number;
  country: string;
};

type AnalyticsDemographicsBucket = {
  countries: AnalyticsCountryBucket[];
};

export type AnalyticsSummaryRangeKey = "last30" | "all" | "custom";

export type AnalyticsSummaryOptions = {
  end?: string | null;
  range?: AnalyticsSummaryRangeKey;
  start?: string | null;
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
    all: AnalyticsDemographicsBucket;
    anonymous: AnalyticsDemographicsBucket;
    authenticated: AnalyticsDemographicsBucket;
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

const LAST_30_DAY_COUNT = 30;
const TOP_LIMIT = 10;
const DEMOGRAPHICS_OTHER_LABEL = "Other / Unknown";
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const STATUS_FAMILIES = ["2xx", "3xx", "4xx", "429", "5xx", "other"] as const;
const statusFamilySet = new Set<string>(STATUS_FAMILIES);

type ResolvedSummaryRange = {
  end: Date;
  start: Date | null;
  type: AnalyticsSummaryRangeKey;
};

function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function endOfUtcDay(value: Date) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 23, 59, 59, 999)
  );
}

function addUtcDays(value: Date, days: number) {
  const nextDate = new Date(value);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function createAnalyticsRangeError(message: string) {
  return new AppError(message, 400, "INVALID_ANALYTICS_RANGE");
}

function parseDateOnly(value: string, fieldName: "end" | "start") {
  const match = DATE_ONLY_PATTERN.exec(value);

  if (!match) {
    throw createAnalyticsRangeError(`Analytics ${fieldName} date must use YYYY-MM-DD.`);
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    throw createAnalyticsRangeError(`Analytics ${fieldName} date is invalid.`);
  }

  return parsedDate;
}

function normalizeDateInput(value: string | null | undefined) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}

function resolveSummaryRange(options: AnalyticsSummaryOptions = {}, now = new Date()): ResolvedSummaryRange {
  const type = options.range ?? "last30";
  const endDate = endOfUtcDay(options.end ? parseDateOnly(options.end, "end") : now);

  if (type === "all") {
    return {
      end: endDate,
      start: null,
      type
    };
  }

  if (type === "last30") {
    return {
      end: endDate,
      start: startOfUtcDay(addUtcDays(endDate, -(LAST_30_DAY_COUNT - 1))),
      type
    };
  }

  const normalizedStart = normalizeDateInput(options.start);
  const startDate = normalizedStart ? startOfUtcDay(parseDateOnly(normalizedStart, "start")) : null;

  if (startDate && startDate.getTime() > endDate.getTime()) {
    throw createAnalyticsRangeError("Analytics start date must be before or equal to end date.");
  }

  return {
    end: endDate,
    start: startDate,
    type
  };
}

function createDateRangeFilter(range: ResolvedSummaryRange) {
  const filter: { $gte?: Date; $lte: Date } = {
    $lte: range.end
  };

  if (range.start) {
    filter.$gte = range.start;
  }

  return filter;
}

function sumCount(records: RollupSummaryRecord[]) {
  return records.reduce((total, record) => total + record.count, 0);
}

function addUniqueKeys(keys: Set<string>, nextKeys: string[]) {
  nextKeys.forEach((key) => {
    keys.add(key);
  });
}

function countUniqueVisitors(records: RollupSummaryRecord[]) {
  const keys = new Set<string>();
  let fallbackCount = 0;

  records.forEach((record) => {
    addUniqueKeys(keys, record.uniqueVisitorKeys);

    if (record.uniqueVisitorKeys.length === 0) {
      fallbackCount += record.uniqueVisitors;
    }
  });

  return keys.size + fallbackCount;
}

function getTopCountBuckets(
  records: RollupSummaryRecord[],
  labelSelector: (record: RollupSummaryRecord) => string,
  limit = TOP_LIMIT
): AnalyticsCountBucket[] {
  const counts = new Map<string, number>();

  records.forEach((record) => {
    const label = labelSelector(record);
    counts.set(label, (counts.get(label) ?? 0) + record.count);
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, limit);
}

function normalizeTopRoute(route: string) {
  return route.replace(/^\/characters\/\d+(?=\/|$)/, "/characters/:id");
}

function getTopRoutes(records: RollupSummaryRecord[]): AnalyticsRouteBucket[] {
  const counts = new Map<string, number>();

  records.forEach((record) => {
    const route = normalizeTopRoute(record.route);

    if (route === "unknown") {
      return;
    }

    counts.set(route, (counts.get(route) ?? 0) + record.count);
  });

  return [...counts.entries()]
    .map(([route, count]) => ({ route, count }))
    .sort((left, right) => right.count - left.count || left.route.localeCompare(right.route))
    .slice(0, TOP_LIMIT);
}

function getStatusFamilyBuckets(records: RollupSummaryRecord[]): AnalyticsCountBucket[] {
  const counts = new Map<string, number>();

  records.forEach((record) => {
    const label = statusFamilySet.has(record.statusFamily) ? record.statusFamily : "other";
    counts.set(label, (counts.get(label) ?? 0) + record.count);
  });

  return STATUS_FAMILIES.map((label) => ({
    label,
    count: counts.get(label) ?? 0
  }));
}

function getDemographics(records: RollupSummaryRecord[]): AnalyticsCountryBucket[] {
  const grouped = new Map<string, { count: number; keys: Set<string> }>();

  records.forEach((record) => {
    const country = record.country && record.country !== "unknown" ? record.country : DEMOGRAPHICS_OTHER_LABEL;
    const current = grouped.get(country) ?? { count: 0, keys: new Set<string>() };

    current.count += record.count;
    addUniqueKeys(current.keys, record.uniqueVisitorKeys);
    grouped.set(country, current);
  });

  const buckets = [...grouped.entries()]
    .map(([country, value]) => ({
      country,
      count: value.keys.size || value.count
    }))
    .sort((left, right) => right.count - left.count || left.country.localeCompare(right.country));
  const topCountries = buckets.filter((bucket) => bucket.country !== DEMOGRAPHICS_OTHER_LABEL).slice(0, TOP_LIMIT);
  const topCountrySet = new Set(topCountries.map((bucket) => bucket.country));
  const otherCount = buckets
    .filter((bucket) => bucket.country === DEMOGRAPHICS_OTHER_LABEL || !topCountrySet.has(bucket.country))
    .reduce((total, bucket) => total + bucket.count, 0);

  return otherCount > 0
    ? [...topCountries, { country: DEMOGRAPHICS_OTHER_LABEL, count: otherCount }]
    : topCountries;
}

async function getRollups(range: ResolvedSummaryRange) {
  return AnalyticsDailyRollup.find({
    date: createDateRangeFilter(range)
  })
    .select(
      "approximateUniques city count country date eventName latencyBucket method region route source statusFamily uniqueSessionKeys uniqueSessions uniqueVisitorKeys uniqueVisitors visitorType"
    )
    .lean<RollupSummaryRecord[]>()
    .exec();
}

function getActiveCharacterOwnerStages(): PipelineStage[] {
  return [
    {
      $match: {
        deletedAt: null
      }
    },
    {
      $lookup: {
        as: "owner",
        foreignField: "_id",
        from: User.collection.name,
        localField: "ownerId"
      }
    },
    {
      $unwind: "$owner"
    },
    {
      $match: {
        "owner.active": true,
        "owner.emailVerifiedAt": { $ne: null }
      }
    }
  ];
}

async function getTopCharacterSummaryField(fieldName: "summary.className" | "summary.species") {
  const rows = await CharacterSheet.aggregate<{ _id: string; count: number }>([
    ...getActiveCharacterOwnerStages(),
    {
      $group: {
        _id: `$${fieldName}`,
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1, _id: 1 } },
    { $limit: TOP_LIMIT }
  ]);

  return rows.map((row) => ({
    name: row._id || "Unknown",
    count: row.count
  }));
}

async function countTotalActiveCharacters() {
  const rows = await CharacterSheet.aggregate<{ count: number }>([
    ...getActiveCharacterOwnerStages(),
    {
      $count: "count"
    }
  ]);

  return rows[0]?.count ?? 0;
}

async function getCharacterSummary() {
  const [topClasses, topSpecies] = await Promise.all([
    getTopCharacterSummaryField("summary.className"),
    getTopCharacterSummaryField("summary.species")
  ]);

  return {
    topClasses,
    topSpecies
  };
}

async function getOverviewSummary(
  range: ResolvedSummaryRange,
  anonymousVisitorRollups: RollupSummaryRecord[]
) {
  const dateFilter = createDateRangeFilter(range);
  const [
    totalActiveUsers,
    totalActiveCharacters,
    createdUsers,
    createdCharacters,
    emailsSent
  ] = await Promise.all([
    User.countDocuments({ active: true, emailVerifiedAt: { $ne: null } }),
    countTotalActiveCharacters(),
    User.countDocuments({ createdAt: dateFilter }),
    CharacterSheet.countDocuments({ createdAt: dateFilter }),
    EmailDelivery.countDocuments({ sentAt: dateFilter })
  ]);

  return {
    totalActiveUsers,
    totalActiveCharacters,
    createdUsers,
    createdCharacters,
    anonymousVisitors: countUniqueVisitors(anonymousVisitorRollups),
    emailsSent
  };
}

export async function getAnalyticsSummary(
  options: AnalyticsSummaryOptions = {}
): Promise<AnalyticsSummary> {
  const range = resolveSummaryRange(options);
  const rollups = await getRollups(range);
  const frontendRollups = rollups.filter((record) => record.source === "frontend");
  const visitorRollups = frontendRollups.filter((record) =>
    ["app_boot", "session_start", "page_view"].includes(record.eventName)
  );
  const authenticatedVisitorRollups = visitorRollups.filter(
    (record) => record.visitorType === "authenticated"
  );
  const anonymousVisitorRollups = visitorRollups.filter((record) => record.visitorType === "anonymous");
  const pageViewRollups = frontendRollups.filter((record) => record.eventName === "page_view");
  const serverRequestRollups = rollups.filter((record) => record.eventName === "server_request");
  const [overview, characters] = await Promise.all([
    getOverviewSummary(range, anonymousVisitorRollups),
    getCharacterSummary()
  ]);

  return {
    range: {
      type: range.type,
      start: range.start?.toISOString() ?? null,
      end: range.end.toISOString()
    },
    overview,
    demographics: {
      all: {
        countries: getDemographics(visitorRollups)
      },
      authenticated: {
        countries: getDemographics(authenticatedVisitorRollups)
      },
      anonymous: {
        countries: getDemographics(anonymousVisitorRollups)
      }
    },
    health: {
      analyticsEvents: sumCount(frontendRollups),
      apiRequests: sumCount(serverRequestRollups),
      statusFamilies: getStatusFamilyBuckets(serverRequestRollups),
      latencyBuckets: getTopCountBuckets(serverRequestRollups, (record) => record.latencyBucket, 8)
    },
    routes: {
      topRoutes: getTopRoutes(pageViewRollups)
    },
    characters
  };
}
