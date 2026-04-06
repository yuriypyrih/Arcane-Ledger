import type {
  CharacterCompanion,
  MonsterFeatureRecord,
  MonsterRecord,
  MonsterSpeedValue
} from "../../types";
import { clampInteger, clampNumber } from "./shared";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeNullableText(value: unknown): string | null {
  const normalizedValue = normalizeText(value);
  return normalizedValue.length > 0 ? normalizedValue : null;
}

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

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<string[]>((entries, entry) => {
    const normalizedEntry = normalizeText(entry);

    if (!normalizedEntry) {
      return entries;
    }

    entries.push(normalizedEntry);
    return entries;
  }, []);
}

function normalizeMonsterRecord(value: unknown): MonsterRecord | null {
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
    strength_save:
      value.strength_save === null || value.strength_save === undefined
        ? null
        : clampInteger(value.strength_save, -999, 999, 0),
    dexterity_save:
      value.dexterity_save === null || value.dexterity_save === undefined
        ? null
        : clampInteger(value.dexterity_save, -999, 999, 0),
    constitution_save:
      value.constitution_save === null || value.constitution_save === undefined
        ? null
        : clampInteger(value.constitution_save, -999, 999, 0),
    intelligence_save:
      value.intelligence_save === null || value.intelligence_save === undefined
        ? null
        : clampInteger(value.intelligence_save, -999, 999, 0),
    wisdom_save:
      value.wisdom_save === null || value.wisdom_save === undefined
        ? null
        : clampInteger(value.wisdom_save, -999, 999, 0),
    charisma_save:
      value.charisma_save === null || value.charisma_save === undefined
        ? null
        : clampInteger(value.charisma_save, -999, 999, 0),
    perception:
      value.perception === null || value.perception === undefined
        ? null
        : clampInteger(value.perception, -999, 999, 0),
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
    page_no:
      value.page_no === null || value.page_no === undefined
        ? null
        : clampInteger(value.page_no, 0, 99999, 0),
    environments: normalizeStringArray(value.environments),
    img_main: normalizeNullableText(value.img_main),
    document__slug: normalizeText(value.document__slug),
    document__title: normalizeText(value.document__title),
    document__license_url: normalizeText(value.document__license_url),
    document__url: normalizeText(value.document__url),
    v2_converted_path: normalizeText(value.v2_converted_path)
  };
}

function normalizeCharacterCompanion(value: unknown, index: number): CharacterCompanion | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const name = normalizeText(value.name);
  const type = normalizeText(value.type);

  if (!name || !type) {
    return null;
  }

  const inheritedCreatureEntry = normalizeMonsterRecord(value.inheritedCreatureEntry);

  return {
    id: normalizeText(value.id, `companion-${index}-${Date.now().toString(36)}`),
    name,
    description: normalizeText(value.description),
    type,
    ...(inheritedCreatureEntry ? { inheritedCreatureEntry } : {})
  };
}

export function createCharacterCompanionId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `companion-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeCharacterCompanions(value: unknown): CharacterCompanion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set<string>();

  return value
    .map((companion, index) => normalizeCharacterCompanion(companion, index))
    .filter((companion): companion is CharacterCompanion => {
      if (!companion || seenIds.has(companion.id)) {
        return false;
      }

      seenIds.add(companion.id);
      return true;
    });
}
