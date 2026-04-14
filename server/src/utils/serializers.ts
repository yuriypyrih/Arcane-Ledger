import type { ItemDetailRecord, ItemListItem, Open5eItemRecord } from "../types/item.js";
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

export function serializeItemRecord(
  record: Open5eItemRecord & MongoInternals
): ItemDetailRecord {
  const { _id, __v: _unusedVersion, ...item } = record;

  return {
    id: _id?.toString() ?? "",
    ...item
  };
}

export function serializeItemListItem(
  record: Open5eItemRecord & MongoInternals
): ItemListItem {
  const { _id } = record;

  return {
    id: _id?.toString() ?? "",
    key: record.key ?? "",
    name: record.name ?? "",
    rarityKey: record.rarity?.key ?? null,
    rarityName: record.rarity?.name ?? null,
    categoryKey: record.category?.key ?? "",
    categoryName: record.category?.name ?? "",
    weight: record.weight ?? "",
    weightUnit: record.weight_unit ?? "",
    cost: record.cost ?? null,
    sourceKey: record.document?.key ?? "",
    sourceTitle: record.document?.display_name ?? record.document?.name ?? ""
  };
}
