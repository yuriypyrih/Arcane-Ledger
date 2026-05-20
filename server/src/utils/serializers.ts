import type {
  ItemDetailArmorRecord,
  ItemDetailDocumentReference,
  ItemDetailRecord,
  ItemDetailReference,
  ItemDetailWeaponPropertyRecord,
  ItemDetailWeaponRecord,
  ItemListItem,
  Open5eItemArmorRecord,
  Open5eItemRecord,
  Open5eItemWeaponPropertyRecord,
  Open5eItemWeaponRecord
} from "../types/item.js";
import type { MonsterDetailRecord, MonsterListItem, MonsterRecord } from "../types/monster.js";
import type { Open5eDocumentReference, Open5eKeyedReference } from "../types/open5e.js";
import { isItemContainerKey } from "./itemContainers.js";

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
  const item: ItemDetailRecord = {
    id: record._id?.toString() ?? "",
    key: record.key,
    name: record.name,
    desc: record.desc ?? null,
    category: serializeItemReference(record.category),
    rarity: serializeItemReference(record.rarity),
    is_magic_item: record.is_magic_item,
    weapon: serializeItemWeapon(record.weapon),
    armor: serializeItemArmor(record.armor),
    weight: record.weight ?? null,
    weight_unit: record.weight_unit ?? null,
    cost: record.cost ?? null,
    requires_attunement: record.requires_attunement,
    attunement_detail: record.attunement_detail ?? null,
    document: serializeItemDocument(record.document)
  };

  return isItemContainerKey(record.key)
    ? {
        ...item,
        containerContents: []
      }
    : item;
}

function serializeItemReference(
  reference: Open5eKeyedReference | null | undefined
): ItemDetailReference | null {
  if (!reference) {
    return null;
  }

  return {
    key: reference.key,
    name: reference.name
  };
}

function serializeRequiredItemReference(reference: Open5eKeyedReference): ItemDetailReference {
  return {
    key: reference.key,
    name: reference.name
  };
}

function serializeItemDocument(
  document: Open5eDocumentReference | null | undefined
): ItemDetailDocumentReference | null {
  if (!document) {
    return null;
  }

  return {
    key: document.key,
    name: document.name,
    display_name: document.display_name ?? null
  };
}

function serializeItemWeaponProperty(
  propertyRecord: Open5eItemWeaponPropertyRecord
): ItemDetailWeaponPropertyRecord {
  return {
    detail: propertyRecord.detail ?? null,
    property: {
      name: propertyRecord.property.name,
      type: propertyRecord.property.type ?? null
    }
  };
}

function serializeItemWeapon(
  weapon: Open5eItemWeaponRecord | null | undefined
): ItemDetailWeaponRecord | null {
  if (!weapon) {
    return null;
  }

  return {
    name: weapon.name,
    damage_dice: weapon.damage_dice,
    damage_type: serializeRequiredItemReference(weapon.damage_type),
    is_martial: weapon.is_martial,
    properties: weapon.properties.map(serializeItemWeaponProperty)
  };
}

function serializeItemArmor(
  armor: Open5eItemArmorRecord | null | undefined
): ItemDetailArmorRecord | null {
  if (!armor) {
    return null;
  }

  return {
    category: armor.category,
    ac_base: armor.ac_base,
    ac_display: armor.ac_display,
    ac_add_dexmod: armor.ac_add_dexmod,
    ac_cap_dexmod: armor.ac_cap_dexmod,
    grants_stealth_disadvantage: armor.grants_stealth_disadvantage,
    strength_score_required: armor.strength_score_required
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
