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
import type {
  MonsterDetailRecord,
  MonsterFeatureRecord,
  MonsterListItem,
  MonsterRecord,
  MonsterSpeedValue
} from "../types/monster.js";
import type { Open5eDocumentReference, Open5eKeyedReference } from "../types/open5e.js";
import { isItemContainerKey } from "./itemContainers.js";

type MongoInternals = {
  _id?: {
    toString: () => string;
  } | null;
  __v?: unknown;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeNullableText(value: unknown) {
  return value === null || value === undefined ? null : normalizeText(value);
}

function normalizeNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeNullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function normalizeMonsterSpeed(value: unknown): Record<string, MonsterSpeedValue> {
  if (!isObjectRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, MonsterSpeedValue>>((speed, [key, speedValue]) => {
    if (
      typeof speedValue !== "boolean" &&
      typeof speedValue !== "number" &&
      typeof speedValue !== "string"
    ) {
      return speed;
    }

    speed[key] = speedValue;
    return speed;
  }, {});
}

function normalizeMonsterSkills(value: unknown) {
  if (!isObjectRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, number>>((skills, [key, skillValue]) => {
    if (typeof skillValue !== "number" || !Number.isFinite(skillValue)) {
      return skills;
    }

    skills[key] = skillValue;
    return skills;
  }, {});
}

function normalizeMonsterFeature(value: unknown): MonsterFeatureRecord | null {
  if (!isObjectRecord(value) || typeof value.name !== "string" || value.name.length === 0) {
    return null;
  }

  return {
    name: value.name,
    desc: normalizeText(value.desc),
    attack_bonus: normalizeNullableNumber(value.attack_bonus) ?? undefined,
    damage_dice: typeof value.damage_dice === "string" ? value.damage_dice : undefined,
    damage_bonus: normalizeNullableNumber(value.damage_bonus) ?? undefined
  };
}

function normalizeMonsterFeatures(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }

  const features = value
    .map((entry) => normalizeMonsterFeature(entry))
    .filter((entry): entry is MonsterFeatureRecord => entry !== null);

  return features.length > 0 ? features : null;
}

function normalizeMonsterRecord(record: MonsterRecord): MonsterRecord {
  return {
    slug: normalizeText(record.slug),
    desc: normalizeText(record.desc),
    name: normalizeText(record.name),
    size: normalizeText(record.size),
    type: normalizeText(record.type),
    subtype: normalizeText(record.subtype),
    group: normalizeNullableText(record.group),
    alignment: normalizeText(record.alignment),
    armor_class: normalizeNumber(record.armor_class, 0),
    armor_desc: normalizeNullableText(record.armor_desc),
    hit_points: normalizeNumber(record.hit_points, 0),
    hit_dice: normalizeText(record.hit_dice),
    speed: normalizeMonsterSpeed(record.speed),
    strength: normalizeNumber(record.strength, 10),
    dexterity: normalizeNumber(record.dexterity, 10),
    constitution: normalizeNumber(record.constitution, 10),
    intelligence: normalizeNumber(record.intelligence, 10),
    wisdom: normalizeNumber(record.wisdom, 10),
    charisma: normalizeNumber(record.charisma, 10),
    strength_save: normalizeNullableNumber(record.strength_save),
    dexterity_save: normalizeNullableNumber(record.dexterity_save),
    constitution_save: normalizeNullableNumber(record.constitution_save),
    intelligence_save: normalizeNullableNumber(record.intelligence_save),
    wisdom_save: normalizeNullableNumber(record.wisdom_save),
    charisma_save: normalizeNullableNumber(record.charisma_save),
    perception: normalizeNullableNumber(record.perception),
    skills: normalizeMonsterSkills(record.skills),
    damage_vulnerabilities: normalizeText(record.damage_vulnerabilities),
    damage_resistances: normalizeText(record.damage_resistances),
    damage_immunities: normalizeText(record.damage_immunities),
    condition_immunities: normalizeText(record.condition_immunities),
    senses: normalizeText(record.senses),
    languages: normalizeText(record.languages),
    challenge_rating: normalizeText(record.challenge_rating),
    cr: normalizeNumber(record.cr, 0),
    actions: normalizeMonsterFeatures(record.actions),
    bonus_actions: normalizeMonsterFeatures(record.bonus_actions),
    reactions: normalizeMonsterFeatures(record.reactions),
    legendary_desc: normalizeNullableText(record.legendary_desc),
    legendary_actions: normalizeMonsterFeatures(record.legendary_actions),
    special_abilities: normalizeMonsterFeatures(record.special_abilities),
    spell_list: normalizeStringArray(record.spell_list),
    page_no: normalizeNullableNumber(record.page_no),
    environments: normalizeStringArray(record.environments),
    img_main: normalizeNullableText(record.img_main),
    document__slug: normalizeText(record.document__slug),
    document__title: normalizeText(record.document__title),
    document__license_url: normalizeText(record.document__license_url),
    document__url: normalizeText(record.document__url),
    v2_converted_path: normalizeText(record.v2_converted_path)
  };
}

export function serializeMonsterRecord(
  record: MonsterRecord & MongoInternals
): MonsterDetailRecord {
  const { _id, __v: _unusedVersion, ...monster } = record;

  return {
    id: _id?.toString() ?? "",
    ...normalizeMonsterRecord(monster)
  };
}

export function serializeMonsterListItem(
  record: MonsterRecord & MongoInternals
): MonsterListItem {
  const { _id } = record;
  const monster = normalizeMonsterRecord(record);

  return {
    id: _id?.toString() ?? "",
    slug: monster.slug,
    name: monster.name,
    type: monster.type,
    cr: monster.cr,
    challengeRating: monster.challenge_rating,
    sourceTitle: monster.document__title,
    sourceSlug: monster.document__slug,
    imageUrl: monster.img_main
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
