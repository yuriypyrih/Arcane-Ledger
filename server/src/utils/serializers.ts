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
  MonsterListItem,
  MonsterRecord
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

const legacySourceKeyMap: Record<string, string> = {
  blackflag: "bfrd",
  cc: "ccdx",
  menagerie: "a5e-mm",
  taldorei: "tdcs",
  "wotc-srd": "srd-2014"
};

const monsterAbilityKeys = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma"
] as const;

function normalizeLegacySourceKey(value: unknown) {
  const sourceKey = normalizeText(value);
  return legacySourceKeyMap[sourceKey] ?? sourceKey;
}

function getDisplayText(value: unknown, fallback = "") {
  const text = normalizeText(value);
  return text || fallback;
}

function toReference(value: unknown, fallbackName = "") {
  if (isObjectRecord(value)) {
    const key = normalizeNullableText(value.key);
    const name = normalizeNullableText(value.display_name) ?? normalizeNullableText(value.name);

    return key || name
      ? {
          ...value,
          ...(key ? { key } : {}),
          ...(name ? { name } : {})
        }
      : null;
  }

  const name = normalizeNullableText(value) ?? fallbackName;
  const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return name
    ? {
        key,
        name
      }
    : null;
}

function normalizeNumberMap(value: unknown) {
  if (!isObjectRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, number>>((map, [key, entry]) => {
    const normalizedKey = normalizeText(key);

    if (!normalizedKey || typeof entry !== "number" || !Number.isFinite(entry)) {
      return map;
    }

    map[normalizedKey] = entry;
    return map;
  }, {});
}

function normalizeSpeedMap(value: unknown) {
  if (!isObjectRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, boolean | number | string>>(
    (speed, [key, entry]) => {
      const normalizedKey = normalizeText(key);

      if (
        !normalizedKey ||
        (typeof entry !== "boolean" && typeof entry !== "number" && typeof entry !== "string")
      ) {
        return speed;
      }

      speed[normalizedKey] = entry;
      return speed;
    },
    {}
  );
}

function normalizeLegacyTrait(value: unknown) {
  if (!isObjectRecord(value)) {
    return null;
  }

  const name = normalizeText(value.name);

  if (!name) {
    return null;
  }

  return {
    ...value,
    name,
    desc: normalizeText(value.desc)
  };
}

function normalizeLegacyTraits(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => normalizeLegacyTrait(entry))
    .filter((entry): entry is NonNullable<ReturnType<typeof normalizeLegacyTrait>> => entry !== null);
}

function normalizeLegacyAction(value: unknown, actionType: string, order: number) {
  if (!isObjectRecord(value)) {
    return null;
  }

  const name = normalizeText(value.name);

  if (!name) {
    return null;
  }

  return {
    ...value,
    name,
    desc: normalizeText(value.desc),
    attacks: [],
    action_type: actionType,
    order_in_statblock: order,
    legendary_action_cost:
      actionType === "LEGENDARY_ACTION" ? (normalizeNullableNumber(value.legendary_action_cost) ?? 1) : null,
    limited_to_form: null,
    usage_limits: null
  };
}

function normalizeLegacyActions(value: unknown, actionType: string) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry, index) => normalizeLegacyAction(entry, actionType, index))
    .filter((entry): entry is NonNullable<ReturnType<typeof normalizeLegacyAction>> => entry !== null);
}

function isV2MonsterRecord(record: Record<string, unknown>): record is MonsterRecord {
  return typeof record.key === "string" && record.key.trim().length > 0;
}

function mapLegacyMonsterToV2(record: Record<string, unknown>): MonsterRecord {
  const legacySlug = normalizeText(record.slug);
  const sourceKey = normalizeLegacySourceKey(record.document__slug);
  const key = sourceKey && legacySlug ? `${sourceKey}_${legacySlug}` : legacySlug || "legacy-monster";
  const abilityScores = Object.fromEntries(
    monsterAbilityKeys.map((ability) => [ability, normalizeNumber(record[ability], 10)])
  );
  const savingThrows = Object.fromEntries(
    monsterAbilityKeys.flatMap((ability) => {
      const value = normalizeNullableNumber(record[`${ability}_save`]);
      return value === null ? [] : [[ability, value]];
    })
  );
  const perception = normalizeNullableNumber(record.perception);
  const skills = normalizeNumberMap(record.skills);
  const actions = [
    ...normalizeLegacyActions(record.actions, "ACTION"),
    ...normalizeLegacyActions(record.bonus_actions, "BONUS_ACTION"),
    ...normalizeLegacyActions(record.reactions, "REACTION"),
    ...normalizeLegacyActions(record.legendary_actions, "LEGENDARY_ACTION")
  ];
  const imageUrl = normalizeNullableText(record.img_main);

  return {
    key,
    name: getDisplayText(record.name, "Legacy Monster"),
    deprecated: true,
    desc: normalizeText(record.desc),
    size: toReference(record.size),
    type: toReference(record.type),
    subcategory: normalizeNullableText(record.subtype),
    category: normalizeNullableText(record.group) ?? "Monsters",
    alignment: normalizeNullableText(record.alignment),
    armor_class: normalizeNullableNumber(record.armor_class),
    armor_detail: normalizeNullableText(record.armor_desc),
    hit_points: normalizeNullableNumber(record.hit_points),
    hit_dice: normalizeNullableText(record.hit_dice),
    speed: normalizeSpeedMap(record.speed),
    speed_all: normalizeSpeedMap(record.speed),
    ability_scores: abilityScores,
    saving_throws: savingThrows,
    saving_throws_all: {
      ...abilityScores,
      ...savingThrows
    },
    skill_bonuses: skills,
    skill_bonuses_all: {
      ...skills,
      ...(perception !== null ? { perception } : {})
    },
    passive_perception: perception !== null ? 10 + perception : null,
    senses_display: normalizeText(record.senses),
    languages: {
      as_string: normalizeText(record.languages)
    },
    challenge_rating: record.challenge_rating as number | string | null | undefined,
    cr: normalizeNumber(record.cr, 0),
    resistances_and_immunities: {
      damage_vulnerabilities_display: normalizeText(record.damage_vulnerabilities),
      damage_vulnerabilities: [],
      damage_resistances_display: normalizeText(record.damage_resistances),
      damage_resistances: [],
      damage_immunities_display: normalizeText(record.damage_immunities),
      damage_immunities: [],
      condition_immunities_display: normalizeText(record.condition_immunities),
      condition_immunities: []
    },
    traits: normalizeLegacyTraits(record.special_abilities),
    actions,
    spell_list: normalizeStringArray(record.spell_list),
    page_no: normalizeNullableNumber(record.page_no),
    environments: normalizeStringArray(record.environments).map((name) => ({ name, key: name })),
    illustration: imageUrl ? { file_url: imageUrl } : null,
    document: {
      key: sourceKey,
      name: normalizeText(record.document__title),
      display_name: normalizeText(record.document__title)
    },
    document_url: normalizeText(record.document__url),
    document_license_url: normalizeText(record.document__license_url),
    v2_converted_path: normalizeText(record.v2_converted_path)
  };
}

function normalizeMonsterRecord(record: MonsterRecord | Record<string, unknown>): MonsterRecord {
  if (!isV2MonsterRecord(record)) {
    return mapLegacyMonsterToV2(record);
  }

  return {
    ...record,
    key: normalizeText(record.key),
    name: getDisplayText(record.name, "Unknown Monster")
  };
}

function getMonsterImageUrl(monster: MonsterRecord) {
  const illustration = monster.illustration;
  return isObjectRecord(illustration) ? normalizeNullableText(illustration.file_url) : null;
}

function getMonsterReferenceKey(reference: unknown) {
  return isObjectRecord(reference) ? normalizeNullableText(reference.key) : null;
}

function getMonsterReferenceName(reference: unknown) {
  if (!isObjectRecord(reference)) {
    return null;
  }

  return normalizeNullableText(reference.display_name) ?? normalizeNullableText(reference.name);
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
    key: monster.key,
    name: monster.name,
    challengeRating: monster.challenge_rating ?? null,
    typeKey: getMonsterReferenceKey(monster.type),
    typeName: getMonsterReferenceName(monster.type),
    sourceKey: getMonsterReferenceKey(monster.document),
    sourceTitle: getMonsterReferenceName(monster.document),
    imageUrl: getMonsterImageUrl(monster),
    ...(monster.deprecated ? { deprecated: true } : {})
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
