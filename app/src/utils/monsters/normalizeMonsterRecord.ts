import type {
  MonsterFeatureRecord,
  MonsterRecord,
  MonsterSpeedValue
} from "../../types";
import { clampInteger, clampNumber } from "../numbers";
import {
  isObjectRecord,
  normalizeNullableText,
  normalizeStringArray,
  normalizeText
} from "../normalize";

function normalizeMonsterSpeedValue(value: unknown): MonsterSpeedValue | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const normalizedValue = normalizeText(value);
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function normalizeMonsterSpeedRecord(value: unknown): MonsterRecord["speed"] {
  if (!isObjectRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<MonsterRecord["speed"]>((speed, [key, speedValue]) => {
    const normalizedKey = normalizeText(key);
    const normalizedValue = normalizeMonsterSpeedValue(speedValue);

    if (!normalizedKey || normalizedValue === null) {
      return speed;
    }

    speed[normalizedKey] = normalizedValue;
    return speed;
  }, {});
}

function normalizeMonsterNumberMap(value: unknown): MonsterRecord["skills"] {
  if (!isObjectRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<MonsterRecord["skills"]>((record, [key, numberValue]) => {
    const normalizedKey = normalizeText(key);

    if (!normalizedKey) {
      return record;
    }

    record[normalizedKey] = clampInteger(numberValue, -999, 999, 0);
    return record;
  }, {});
}

function normalizeMonsterFeatureRecord(value: unknown): MonsterFeatureRecord | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const name = normalizeText(value.name);
  const desc = normalizeText(value.desc);

  if (!name || !desc) {
    return null;
  }

  return {
    name,
    desc,
    attack_bonus:
      value.attack_bonus === undefined ? undefined : clampInteger(value.attack_bonus, -999, 999, 0),
    damage_dice: normalizeNullableText(value.damage_dice) ?? undefined,
    damage_bonus:
      value.damage_bonus === undefined ? undefined : clampInteger(value.damage_bonus, -999, 999, 0)
  };
}

function normalizeMonsterFeatureRecords(value: unknown): MonsterFeatureRecord[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const normalizedRecords = value
    .map((feature) => normalizeMonsterFeatureRecord(feature))
    .filter((feature): feature is MonsterFeatureRecord => feature !== null);

  return normalizedRecords.length > 0 ? normalizedRecords : null;
}

function normalizeNullableInteger(value: unknown, min: number, max: number): number | null {
  return value === null || value === undefined ? null : clampInteger(value, min, max, 0);
}

export function normalizeMonsterRecord(value: unknown): MonsterRecord | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const slug = normalizeText(value.slug);
  const name = normalizeText(value.name);

  if (!slug || !name) {
    return null;
  }

  return {
    id: normalizeText(value.id, slug),
    slug,
    desc: normalizeText(value.desc),
    name,
    size: normalizeText(value.size),
    type: normalizeText(value.type),
    subtype: normalizeText(value.subtype),
    group: normalizeNullableText(value.group),
    alignment: normalizeText(value.alignment),
    armor_class: clampInteger(value.armor_class, 0, 999, 0),
    armor_desc: normalizeNullableText(value.armor_desc),
    hit_points: clampInteger(value.hit_points, 0, 9999, 0),
    hit_dice: normalizeText(value.hit_dice),
    speed: normalizeMonsterSpeedRecord(value.speed),
    strength: clampInteger(value.strength, 0, 99, 10),
    dexterity: clampInteger(value.dexterity, 0, 99, 10),
    constitution: clampInteger(value.constitution, 0, 99, 10),
    intelligence: clampInteger(value.intelligence, 0, 99, 10),
    wisdom: clampInteger(value.wisdom, 0, 99, 10),
    charisma: clampInteger(value.charisma, 0, 99, 10),
    strength_save: normalizeNullableInteger(value.strength_save, -999, 999),
    dexterity_save: normalizeNullableInteger(value.dexterity_save, -999, 999),
    constitution_save: normalizeNullableInteger(value.constitution_save, -999, 999),
    intelligence_save: normalizeNullableInteger(value.intelligence_save, -999, 999),
    wisdom_save: normalizeNullableInteger(value.wisdom_save, -999, 999),
    charisma_save: normalizeNullableInteger(value.charisma_save, -999, 999),
    perception: normalizeNullableInteger(value.perception, -999, 999),
    skills: normalizeMonsterNumberMap(value.skills),
    damage_vulnerabilities: normalizeText(value.damage_vulnerabilities),
    damage_resistances: normalizeText(value.damage_resistances),
    damage_immunities: normalizeText(value.damage_immunities),
    condition_immunities: normalizeText(value.condition_immunities),
    senses: normalizeText(value.senses),
    languages: normalizeText(value.languages),
    challenge_rating: normalizeText(value.challenge_rating),
    cr: clampNumber(value.cr, 0, 999, 0),
    actions: normalizeMonsterFeatureRecords(value.actions),
    bonus_actions: normalizeMonsterFeatureRecords(value.bonus_actions),
    reactions: normalizeMonsterFeatureRecords(value.reactions),
    legendary_desc: normalizeNullableText(value.legendary_desc),
    legendary_actions: normalizeMonsterFeatureRecords(value.legendary_actions),
    special_abilities: normalizeMonsterFeatureRecords(value.special_abilities),
    spell_list: normalizeStringArray(value.spell_list),
    page_no: normalizeNullableInteger(value.page_no, 0, 99999),
    environments: normalizeStringArray(value.environments),
    img_main: normalizeNullableText(value.img_main),
    document__slug: normalizeText(value.document__slug),
    document__title: normalizeText(value.document__title),
    document__license_url: normalizeText(value.document__license_url),
    document__url: normalizeText(value.document__url),
    v2_converted_path: normalizeText(value.v2_converted_path)
  };
}
