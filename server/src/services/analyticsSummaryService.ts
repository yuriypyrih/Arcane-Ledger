import { AnalyticsDailyRollup, type AnalyticsRollupRecord } from "../models/Analytics.js";
import { CharacterSheet } from "../models/CharacterSheet.js";
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

const SUMMARY_RANGE_DAYS = 30;
const TOP_LIMIT = 10;
const DEMOGRAPHICS_OTHER_LABEL = "Other / Unknown";

function getSummaryRange(now = new Date()) {
  return {
    end: now,
    start: new Date(now.getTime() - SUMMARY_RANGE_DAYS * 24 * 60 * 60 * 1000)
  };
}

function getYearStart(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
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

function countUniqueSessions(records: RollupSummaryRecord[]) {
  const keys = new Set<string>();
  let fallbackCount = 0;

  records.forEach((record) => {
    addUniqueKeys(keys, record.uniqueSessionKeys);

    if (record.uniqueSessionKeys.length === 0) {
      fallbackCount += record.uniqueSessions;
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

function getTopRoutes(records: RollupSummaryRecord[]): AnalyticsRouteBucket[] {
  return getTopCountBuckets(records, (record) => record.route)
    .filter((bucket) => bucket.label !== "unknown")
    .map((bucket) => ({
      route: bucket.label,
      count: bucket.count
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

async function getRollups(range: { end: Date; start: Date }) {
  return AnalyticsDailyRollup.find({
    date: {
      $gte: range.start,
      $lte: range.end
    }
  })
    .select(
      "approximateUniques city count country date eventName latencyBucket method region route source statusFamily uniqueSessionKeys uniqueSessions uniqueVisitorKeys uniqueVisitors visitorType"
    )
    .lean<RollupSummaryRecord[]>()
    .exec();
}

async function getTopCharacterSummaryField(fieldName: "summary.className" | "summary.species") {
  const rows = await CharacterSheet.aggregate<{ _id: string; count: number }>([
    {
      $match: {
        deletedAt: null
      }
    },
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

async function getCharacterSummary(yearStart: Date) {
  const [activeSaved, deleted, createdThisYear, averageLevelRows, topClasses, topSpecies] =
    await Promise.all([
      CharacterSheet.countDocuments({ deletedAt: null }),
      CharacterSheet.countDocuments({ deletedAt: { $exists: true, $ne: null } }),
      CharacterSheet.countDocuments({ createdAt: { $gte: yearStart }, deletedAt: null }),
      CharacterSheet.aggregate<{ averageLevel: number }>([
        {
          $match: {
            deletedAt: null
          }
        },
        {
          $group: {
            _id: null,
            averageLevel: { $avg: "$summary.level" }
          }
        }
      ]),
      getTopCharacterSummaryField("summary.className"),
      getTopCharacterSummaryField("summary.species")
    ]);
  const averageLevel = averageLevelRows[0]?.averageLevel ?? 0;

  return {
    activeSaved,
    deleted,
    createdThisYear,
    averageLevel: Math.round(averageLevel * 10) / 10,
    topClasses,
    topSpecies
  };
}

async function getUserSummary(yearStart: Date) {
  const [active, verified, createdThisYear] = await Promise.all([
    User.countDocuments({ active: true }),
    User.countDocuments({ active: true, emailVerifiedAt: { $ne: null } }),
    User.countDocuments({ active: true, createdAt: { $gte: yearStart } })
  ]);

  return {
    active,
    verified,
    createdThisYear
  };
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const now = new Date();
  const range = getSummaryRange(now);
  const yearStart = getYearStart(now);
  const [rollups, characters, users] = await Promise.all([
    getRollups(range),
    getCharacterSummary(yearStart),
    getUserSummary(yearStart)
  ]);
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

  return {
    range: {
      start: range.start.toISOString(),
      end: range.end.toISOString()
    },
    visitors: {
      uniqueVisitors: countUniqueVisitors(visitorRollups),
      uniqueSessions: countUniqueSessions(visitorRollups),
      authenticatedVisitors: countUniqueVisitors(authenticatedVisitorRollups),
      unknownVisitors: countUniqueVisitors(anonymousVisitorRollups),
      pageViews: sumCount(pageViewRollups)
    },
    demographics: {
      countries: getDemographics(visitorRollups)
    },
    health: {
      analyticsEvents: sumCount(frontendRollups),
      apiRequests: sumCount(serverRequestRollups),
      statusFamilies: getTopCountBuckets(serverRequestRollups, (record) => record.statusFamily, 8),
      latencyBuckets: getTopCountBuckets(serverRequestRollups, (record) => record.latencyBucket, 8)
    },
    usage: {
      characterCreated: sumCount(frontendRollups.filter((record) => record.eventName === "character_created")),
      characterSheetOpened: sumCount(
        frontendRollups.filter((record) => record.eventName === "character_sheet_opened")
      ),
      codexSearches: sumCount(frontendRollups.filter((record) => record.eventName === "codex_search_submitted")),
      supportFeedbackSubmitted: sumCount(
        frontendRollups.filter((record) => record.eventName === "support_feedback_submitted")
      ),
      topRoutes: getTopRoutes(pageViewRollups)
    },
    characters,
    users
  };
}
