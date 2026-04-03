import type { MonsterDetailRecord, MonsterListItem, MonsterRecord } from "../types/monster.js";

type MongoInternals = {
  _id?: {
    toString: () => string;
  } | null;
  __v?: unknown;
};

export function serializeMonsterRecord(
  record: MonsterRecord & MongoInternals
): MonsterDetailRecord {
  const { _id, __v: _unusedVersion, ...monster } = record;

  return {
    id: _id?.toString() ?? "",
    ...monster
  };
}

export function serializeMonsterListItem(
  record: MonsterRecord & MongoInternals
): MonsterListItem {
  const { _id } = record;

  return {
    id: _id?.toString() ?? "",
    slug: record.slug,
    name: record.name,
    type: record.type,
    cr: record.cr,
    challengeRating: record.challenge_rating,
    sourceTitle: record.document__title,
    sourceSlug: record.document__slug,
    imageUrl: record.img_main
  };
}
