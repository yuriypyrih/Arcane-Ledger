import type {
  MonsterAbilityKey,
  MonsterActionRecord,
  MonsterActionType,
  MonsterListItem,
  MonsterRecord,
  MonsterSpeedMap,
  MonsterTraitRecord,
  MonsterV2Reference
} from "../../types";
import { clampInteger, clampNumber } from "../numbers";
import {
  isObjectRecord,
  normalizeNullableText,
  normalizeStringArray,
  normalizeText
} from "../normalize";

export const monsterAbilityKeys = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma"
] as const satisfies readonly MonsterAbilityKey[];

const legacySourceKeyMap: Record<string, string> = {
  blackflag: "bfrd",
  cc: "ccdx",
  menagerie: "a5e-mm",
  taldorei: "tdcs",
  "wotc-srd": "srd-2014"
};

function normalizeLegacySourceKey(value: unknown) {
  const sourceKey = normalizeText(value);
  return legacySourceKeyMap[sourceKey] ?? sourceKey;
}

function normalizeMonsterReference(value: unknown): MonsterV2Reference | null {
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

  const name = normalizeNullableText(value);
  const key = name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ?? "";

  return name
    ? {
        key,
        name
      }
    : null;
}

function normalizeNullableNumber(value: unknown, min = -999, max = 999): number | null {
  return value === null || value === undefined ? null : clampNumber(value, min, max, 0);
}

function normalizeMonsterNumberMap(value: unknown): Record<string, number> {
  if (!isObjectRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, number>>((record, [key, numberValue]) => {
    const normalizedKey = normalizeText(key);

    if (!normalizedKey || typeof numberValue !== "number" || !Number.isFinite(numberValue)) {
      return record;
    }

    record[normalizedKey] = clampInteger(numberValue, -999, 999, 0);
    return record;
  }, {});
}

function normalizeMonsterSpeedValue(value: unknown): boolean | number | string | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const normalizedValue = normalizeText(value);
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function normalizeMonsterSpeedRecord(value: unknown): MonsterSpeedMap | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const speed = Object.entries(value).reduce<MonsterSpeedMap>((record, [key, speedValue]) => {
    const normalizedKey = normalizeText(key);
    const normalizedValue = normalizeMonsterSpeedValue(speedValue);

    if (!normalizedKey || normalizedValue === null) {
      return record;
    }

    record[normalizedKey] = normalizedValue;
    return record;
  }, {});

  return Object.keys(speed).length > 0 ? speed : null;
}

function normalizeMonsterTrait(value: unknown): MonsterTraitRecord | null {
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

function normalizeMonsterTraits(value: unknown): MonsterTraitRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => normalizeMonsterTrait(entry))
    .filter((entry): entry is MonsterTraitRecord => entry !== null);
}

function normalizeMonsterAction(
  value: unknown,
  fallbackActionType: MonsterActionType | null,
  fallbackOrder: number
): MonsterActionRecord | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const name = normalizeText(value.name);

  if (!name) {
    return null;
  }

  const actionType = normalizeNullableText(value.action_type) ?? fallbackActionType;

  return {
    ...value,
    name,
    desc: normalizeText(value.desc),
    attacks: Array.isArray(value.attacks) ? value.attacks : [],
    action_type: actionType,
    order_in_statblock:
      typeof value.order_in_statblock === "number" && Number.isFinite(value.order_in_statblock)
        ? value.order_in_statblock
        : fallbackOrder,
    legendary_action_cost:
      typeof value.legendary_action_cost === "number" && Number.isFinite(value.legendary_action_cost)
        ? value.legendary_action_cost
        : actionType === "LEGENDARY_ACTION"
          ? 1
          : null,
    limited_to_form: normalizeNullableText(value.limited_to_form),
    usage_limits: isObjectRecord(value.usage_limits) ? value.usage_limits : null
  };
}

function normalizeMonsterActions(value: unknown): MonsterActionRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry, index) => normalizeMonsterAction(entry, "ACTION", index))
    .filter((entry): entry is MonsterActionRecord => entry !== null);
}

function normalizeLegacyActions(value: unknown, actionType: MonsterActionType): MonsterActionRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry, index) => normalizeMonsterAction(entry, actionType, index))
    .filter((entry): entry is MonsterActionRecord => entry !== null);
}

export function isLegacyMonsterRecord(value: unknown): boolean {
  return (
    isObjectRecord(value) &&
    typeof value.slug === "string" &&
    value.slug.trim().length > 0 &&
    typeof value.key !== "string"
  );
}

export function isDeprecatedMonsterRecord(monster: Pick<MonsterRecord, "deprecated"> | null | undefined) {
  return monster?.deprecated === true;
}

export function mapLegacyMonsterToDeprecatedMonster(value: Record<string, unknown>): MonsterRecord {
  const legacySlug = normalizeText(value.slug);
  const sourceKey = normalizeLegacySourceKey(value.document__slug);
  const key = sourceKey && legacySlug ? `${sourceKey}_${legacySlug}` : legacySlug || "legacy-monster";
  const abilityScores = Object.fromEntries(
    monsterAbilityKeys.map((ability) => [ability, clampInteger(value[ability], 0, 99, 10)])
  );
  const savingThrows = Object.fromEntries(
    monsterAbilityKeys.flatMap((ability) => {
      const valueForAbility = normalizeNullableNumber(value[`${ability}_save`]);
      return valueForAbility === null ? [] : [[ability, valueForAbility]];
    })
  );
  const perception = normalizeNullableNumber(value.perception);
  const skills = normalizeMonsterNumberMap(value.skills);
  const actions = [
    ...normalizeLegacyActions(value.actions, "ACTION"),
    ...normalizeLegacyActions(value.bonus_actions, "BONUS_ACTION"),
    ...normalizeLegacyActions(value.reactions, "REACTION"),
    ...normalizeLegacyActions(value.legendary_actions, "LEGENDARY_ACTION")
  ];
  const imageUrl = normalizeNullableText(value.img_main);

  return {
    key,
    id: normalizeText(value.id, key),
    name: normalizeText(value.name, "Legacy Monster"),
    deprecated: true,
    desc: normalizeText(value.desc),
    size: normalizeMonsterReference(value.size),
    type: normalizeMonsterReference(value.type),
    subcategory: normalizeNullableText(value.subtype),
    category: normalizeNullableText(value.group) ?? "Monsters",
    alignment: normalizeNullableText(value.alignment),
    armor_class: normalizeNullableNumber(value.armor_class, 0, 999),
    armor_detail: normalizeNullableText(value.armor_desc),
    hit_points: normalizeNullableNumber(value.hit_points, 0, 9999),
    hit_dice: normalizeNullableText(value.hit_dice),
    speed: normalizeMonsterSpeedRecord(value.speed),
    speed_all: normalizeMonsterSpeedRecord(value.speed),
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
    senses_display: normalizeText(value.senses),
    languages: {
      as_string: normalizeText(value.languages)
    },
    challenge_rating:
      typeof value.challenge_rating === "number" || typeof value.challenge_rating === "string"
        ? value.challenge_rating
        : clampNumber(value.cr, 0, 999, 0),
    cr: clampNumber(value.cr, 0, 999, 0),
    resistances_and_immunities: {
      damage_vulnerabilities_display: normalizeText(value.damage_vulnerabilities),
      damage_vulnerabilities: [],
      damage_resistances_display: normalizeText(value.damage_resistances),
      damage_resistances: [],
      damage_immunities_display: normalizeText(value.damage_immunities),
      damage_immunities: [],
      condition_immunities_display: normalizeText(value.condition_immunities),
      condition_immunities: []
    },
    traits: normalizeMonsterTraits(value.special_abilities),
    actions,
    spell_list: normalizeStringArray(value.spell_list),
    page_no:
      value.page_no === null || value.page_no === undefined
        ? null
        : clampInteger(value.page_no, 0, 99999, 0),
    environments: normalizeStringArray(value.environments).map((name) => ({ name, key: name })),
    illustration: imageUrl ? { file_url: imageUrl } : null,
    document: {
      key: sourceKey,
      name: normalizeText(value.document__title),
      display_name: normalizeText(value.document__title)
    },
    document_url: normalizeText(value.document__url),
    document_license_url: normalizeText(value.document__license_url),
    v2_converted_path: normalizeText(value.v2_converted_path)
  };
}

export function normalizeMonsterRecord(value: unknown): MonsterRecord | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  if (isLegacyMonsterRecord(value)) {
    return mapLegacyMonsterToDeprecatedMonster(value);
  }

  const key = normalizeText(value.key);
  const name = normalizeText(value.name);

  if (!key || !name) {
    return null;
  }

  return {
    ...value,
    id: normalizeNullableText(value.id) ?? key,
    key,
    name,
    desc: normalizeText(value.desc),
    size: normalizeMonsterReference(value.size),
    type: normalizeMonsterReference(value.type),
    document: normalizeMonsterReference(value.document),
    alignment: normalizeNullableText(value.alignment),
    armor_class: normalizeNullableNumber(value.armor_class, 0, 999),
    armor_detail: normalizeNullableText(value.armor_detail),
    hit_points: normalizeNullableNumber(value.hit_points, 0, 9999),
    hit_dice: normalizeNullableText(value.hit_dice),
    initiative_bonus: normalizeNullableNumber(value.initiative_bonus),
    proficiency_bonus: normalizeNullableNumber(value.proficiency_bonus),
    experience_points: normalizeNullableNumber(value.experience_points, 0, 9999999),
    passive_perception: normalizeNullableNumber(value.passive_perception, 0, 999),
    ability_scores: normalizeMonsterNumberMap(value.ability_scores),
    modifiers: normalizeMonsterNumberMap(value.modifiers),
    saving_throws: normalizeMonsterNumberMap(value.saving_throws),
    saving_throws_all: normalizeMonsterNumberMap(value.saving_throws_all),
    skill_bonuses: normalizeMonsterNumberMap(value.skill_bonuses),
    skill_bonuses_all: normalizeMonsterNumberMap(value.skill_bonuses_all),
    speed: normalizeMonsterSpeedRecord(value.speed),
    speed_all: normalizeMonsterSpeedRecord(value.speed_all),
    languages: isObjectRecord(value.languages)
      ? {
          ...value.languages,
          as_string: normalizeText(value.languages.as_string)
        }
      : { as_string: "" },
    traits: normalizeMonsterTraits(value.traits),
    actions: normalizeMonsterActions(value.actions),
    deprecated: value.deprecated === true
  };
}

export function getMonsterKey(monster: Pick<MonsterRecord, "key">): string {
  return monster.key;
}

export function getMonsterListItemKey(monster: Pick<MonsterListItem, "key">): string {
  return monster.key;
}

export function getMonsterReferenceName(reference: MonsterV2Reference | null | undefined) {
  return (
    normalizeNullableText(reference?.display_name) ??
    normalizeNullableText(reference?.name) ??
    null
  );
}

export function getMonsterReferenceKey(reference: MonsterV2Reference | null | undefined) {
  return normalizeNullableText(reference?.key);
}

export function getMonsterTypeName(monster: Pick<MonsterRecord, "type">) {
  return getMonsterReferenceName(monster.type);
}

export function getMonsterTypeKey(monster: Pick<MonsterRecord, "type">) {
  return getMonsterReferenceKey(monster.type);
}

export function getMonsterSizeName(monster: Pick<MonsterRecord, "size">) {
  return getMonsterReferenceName(monster.size);
}

export function getMonsterSourceKey(monster: Pick<MonsterRecord, "document">) {
  return getMonsterReferenceKey(monster.document);
}

export function getMonsterSourceTitle(monster: Pick<MonsterRecord, "document">) {
  return getMonsterReferenceName(monster.document);
}

export function getMonsterImageUrl(monster: Pick<MonsterRecord, "illustration">) {
  return normalizeNullableText(monster.illustration?.file_url);
}

export function getMonsterArmorClass(monster: Pick<MonsterRecord, "armor_class">) {
  return typeof monster.armor_class === "number" && Number.isFinite(monster.armor_class)
    ? monster.armor_class
    : null;
}

export function getMonsterHitPoints(monster: Pick<MonsterRecord, "hit_points">) {
  if (typeof monster.hit_points === "number" && Number.isFinite(monster.hit_points)) {
    return monster.hit_points;
  }

  if (typeof monster.hit_points === "string") {
    const parsedValue = Number(monster.hit_points.trim());

    return Number.isFinite(parsedValue) ? Math.max(0, Math.floor(parsedValue)) : null;
  }

  return null;
}

export function getMonsterInitiativeBonus(monster: Pick<MonsterRecord, "initiative_bonus">) {
  return typeof monster.initiative_bonus === "number" && Number.isFinite(monster.initiative_bonus)
    ? monster.initiative_bonus
    : null;
}

export function getMonsterChallengeRatingNumber(
  monster: Pick<MonsterRecord, "challenge_rating"> | Pick<MonsterListItem, "challengeRating">
) {
  const value =
    "challengeRating" in monster ? monster.challengeRating : monster.challenge_rating;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  const fractionMatch = normalizedValue.match(/^(\d+)\/(\d+)$/);

  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    return denominator > 0 ? numerator / denominator : null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function getMonsterSpeed(monster: Pick<MonsterRecord, "speed" | "speed_all">) {
  return monster.speed_all ?? monster.speed ?? null;
}

export function hasMonsterFlySpeed(monster: Pick<MonsterRecord, "speed" | "speed_all">) {
  const speed = getMonsterSpeed(monster);

  if (!speed) {
    return false;
  }

  const flySpeed = speed.fly as boolean | number | string | null | undefined;

  if (typeof flySpeed === "boolean") {
    return flySpeed;
  }

  if (typeof flySpeed === "number") {
    return flySpeed > 0;
  }

  return typeof flySpeed === "string" && flySpeed.trim().length > 0 && flySpeed !== "0";
}

export function createMonsterReference(name: string, key?: string): MonsterV2Reference {
  const normalizedName = normalizeText(name);
  const normalizedKey =
    normalizeNullableText(key) ??
    normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return {
    key: normalizedKey,
    name: normalizedName
  };
}
