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

function buildMonsterFilter(query: MonsterListQuery): FilterQuery<MonsterRecord> {
  const filter: FilterQuery<MonsterRecord> = {};

  if (query.search) {
    const searchPattern = new RegExp(escapeRegularExpression(query.search), "i");
    filter.name = searchPattern;
  }

  if (query.type) {
    filter.type = createCaseInsensitiveExactMatch(query.type);
  }

  if (query.cr !== undefined) {
    filter.cr = query.cr;
  }

  if (query.source) {
    filter.document__slug = createCaseInsensitiveExactMatch(query.source);
  }

  return filter;
}

function buildMonsterSort(ordering: MonsterOrdering | undefined) {
  switch (ordering) {
    case "type":
      return [
        ["type", 1],
        ["name", 1]
      ] as [string, SortOrder][];
    case "-type":
      return [
        ["type", -1],
        ["name", 1]
      ] as [string, SortOrder][];
    case "challenge_rating":
    case "cr":
      return [
        ["cr", 1],
        ["name", 1]
      ] as [string, SortOrder][];
    case "-challenge_rating":
    case "-cr":
      return [
        ["cr", -1],
        ["name", 1]
      ] as [string, SortOrder][];
    case "-name":
      return [
        ["name", -1],
        ["slug", -1]
      ] as [string, SortOrder][];
    case "name":
    default:
      return [
        ["name", 1],
        ["slug", 1]
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

export async function getMonsterBySlug(slug: string) {
  const record = await MonsterModel.findOne({ slug }).lean<MonsterRecord | null>().exec();

  return record ? serializeMonsterRecord(record) : null;
}
