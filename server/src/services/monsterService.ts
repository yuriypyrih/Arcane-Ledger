import type { FilterQuery, SortOrder } from "mongoose";
import { MonsterModel } from "../models/Monster.js";
import type { MonsterListQuery, MonsterOrdering, MonsterRecord } from "../types/monster.js";
import { serializeMonsterListItem, serializeMonsterRecord } from "../utils/serializers.js";

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createCaseInsensitiveExactMatch(value: string) {
  return new RegExp(`^${escapeRegularExpression(value)}$`, "i");
}

const v2ToLegacySourceKeyMap: Record<string, string> = {
  "srd-2014": "wotc-srd",
  bfrd: "blackflag",
  ccdx: "cc",
  "a5e-mm": "menagerie",
  tdcs: "taldorei"
};
const defaultExcludedSourceAliases = ["srd-2014", "wotc-srd"].map(createCaseInsensitiveExactMatch);

function getSourceAliases(source: string) {
  return Array.from(new Set([source, v2ToLegacySourceKeyMap[source] ?? source]));
}

function appendFilterClause(
  filter: FilterQuery<MonsterRecord>,
  clause: FilterQuery<MonsterRecord>
) {
  filter.$and = [...(filter.$and ?? []), clause];
}

function buildMonsterFilter(query: MonsterListQuery): FilterQuery<MonsterRecord> {
  const filter: FilterQuery<MonsterRecord> = {};

  if (query.search) {
    const searchPattern = new RegExp(escapeRegularExpression(query.search), "i");
    filter.name = searchPattern;
  }

  if (query.type) {
    const typeMatch = createCaseInsensitiveExactMatch(query.type);
    appendFilterClause(filter, {
      $or: [{ "type.key": typeMatch }, { type: typeMatch }]
    });
  }

  if (query.challengeRating !== undefined && query.maxChallengeRating !== undefined) {
    const challengeRatingFilter = {
      $eq: query.challengeRating,
      $lte: query.maxChallengeRating
    };
    appendFilterClause(filter, {
      $or: [{ challenge_rating: challengeRatingFilter }, { cr: challengeRatingFilter }]
    });
  } else if (query.challengeRating !== undefined) {
    appendFilterClause(filter, {
      $or: [{ challenge_rating: query.challengeRating }, { cr: query.challengeRating }]
    });
  } else if (query.maxChallengeRating !== undefined) {
    const challengeRatingFilter = {
      $lte: query.maxChallengeRating
    };
    appendFilterClause(filter, {
      $or: [{ challenge_rating: challengeRatingFilter }, { cr: challengeRatingFilter }]
    });
  }

  if (query.source) {
    const sourceAliases = getSourceAliases(query.source).map(createCaseInsensitiveExactMatch);
    appendFilterClause(filter, {
      $or: [
        ...sourceAliases.map((sourceAlias) => ({ "document.key": sourceAlias })),
        ...sourceAliases.map((sourceAlias) => ({ document__slug: sourceAlias }))
      ]
    });
  } else {
    appendFilterClause(filter, {
      $nor: [
        ...defaultExcludedSourceAliases.map((sourceAlias) => ({ "document.key": sourceAlias })),
        ...defaultExcludedSourceAliases.map((sourceAlias) => ({ document__slug: sourceAlias }))
      ]
    });
  }

  return filter;
}

function buildMonsterSort(ordering: MonsterOrdering | undefined) {
  switch (ordering) {
    case "type":
      return [
        ["type.name", 1],
        ["name", 1]
      ] as [string, SortOrder][];
    case "-type":
      return [
        ["type.name", -1],
        ["name", 1]
      ] as [string, SortOrder][];
    case "document":
      return [
        ["document.display_name", 1],
        ["document.name", 1],
        ["name", 1]
      ] as [string, SortOrder][];
    case "-document":
      return [
        ["document.display_name", -1],
        ["document.name", -1],
        ["name", 1]
      ] as [string, SortOrder][];
    case "challenge_rating":
    case "cr":
      return [
        ["challenge_rating", 1],
        ["name", 1]
      ] as [string, SortOrder][];
    case "-challenge_rating":
    case "-cr":
      return [
        ["challenge_rating", -1],
        ["name", 1]
      ] as [string, SortOrder][];
    case "-name":
      return [
        ["name", -1],
        ["key", -1]
      ] as [string, SortOrder][];
    case "name":
    default:
      return [
        ["name", 1],
        ["key", 1]
      ] as [string, SortOrder][];
  }
}

export async function listMonsters(query: MonsterListQuery) {
  const filter = buildMonsterFilter(query);
  const sort = buildMonsterSort(query.ordering);
  const skip = (query.page - 1) * query.limit;

  const [count, results] = await Promise.all([
    MonsterModel.countDocuments(filter).exec(),
    MonsterModel.find(filter).sort(sort).skip(skip).limit(query.limit).lean<MonsterRecord[]>().exec()
  ]);

  return {
    count,
    page: query.page,
    limit: query.limit,
    results: results.map(serializeMonsterListItem)
  };
}

export async function getMonsterByKey(key: string) {
  const record = await MonsterModel.findOne({ key }).lean<MonsterRecord | null>().exec();

  if (record) {
    return serializeMonsterRecord(record);
  }

  const separatorIndex = key.indexOf("_");
  const legacySourceKey = separatorIndex > 0 ? key.slice(0, separatorIndex) : null;
  const legacySlug = separatorIndex > 0 ? key.slice(separatorIndex + 1) : key;
  const sourceAliases = legacySourceKey ? getSourceAliases(legacySourceKey) : [];
  const legacyRecord = await MonsterModel.findOne({
    $or: [
      { slug: key },
      { slug: legacySlug },
      ...sourceAliases.map((sourceAlias) => ({
        slug: legacySlug,
        document__slug: createCaseInsensitiveExactMatch(sourceAlias)
      }))
    ]
  })
    .lean<MonsterRecord | null>()
    .exec();

  return legacyRecord ? serializeMonsterRecord(legacyRecord) : null;
}
