import type { AbilityKey, Character, CharacterDraft, CoreStats } from "../../types";
import {
  abilityKeys,
  CHARACTERS_STORAGE_KEY,
  alignmentGrid,
  createDefaultCoreStats,
  createDefaultAbilities,
  createEmptyCharacter
} from "./constants";
import {
  isBackgroundName,
  normalizeEquipmentSelectionsForClass,
  normalizeManualSkillSelections,
  normalizeSkillExpertiseSelectionsForCharacter,
  normalizeToolProficiencySelections
} from "./proficiency";
import {
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended
} from "./spellcasting";
import { normalizeLevelAndXp } from "./experience";
import { getSavingThrowProficienciesForClass } from "./gameplay";

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, parsedValue));
}

function normalizeCoreStatValue(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : fallback;
}

function normalizeCoreStats(value: unknown): CoreStats {
  const defaults = createDefaultCoreStats();

  if (!value || typeof value !== "object") {
    return defaults;
  }

  const record = value as Partial<CoreStats>;

  return {
    armorClass: normalizeCoreStatValue(record.armorClass, defaults.armorClass),
    initiative: normalizeCoreStatValue(record.initiative, defaults.initiative),
    speed: normalizeCoreStatValue(record.speed, defaults.speed),
    passivePerception: normalizeCoreStatValue(
      record.passivePerception,
      defaults.passivePerception
    ),
    proficiencyBonus: normalizeCoreStatValue(
      record.proficiencyBonus,
      defaults.proficiencyBonus
    ),
    hitDice: normalizeCoreStatValue(record.hitDice, defaults.hitDice)
  };
}

function normalizeCurrencies(
  value: unknown,
  fallbackCurrencies: Character["currencies"]
): Character["currencies"] {
  const normalizedCurrencies: Character["currencies"] = {
    ...fallbackCurrencies
  };

  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([currencyKey, currencyValue]) => {
      if (!currencyKey) {
        return;
      }

      normalizedCurrencies[currencyKey] = Math.max(
        0,
        Math.floor(clampNumber(currencyValue, 0, 999999999, 0))
      );
    });
  }

  normalizedCurrencies.gold = Math.max(
    0,
    Math.floor(clampNumber(normalizedCurrencies.gold, 0, 999999999, fallbackCurrencies.gold))
  );

  return normalizedCurrencies;
}

function normalizeSavingThrowProficiencies(
  value: unknown,
  fallbackClassName: string
): Character["savingThrowProficiencies"] {
  if (!Array.isArray(value)) {
    return getSavingThrowProficienciesForClass(fallbackClassName);
  }

  const validAbilitySet = new Set(abilityKeys);
  const normalizedSavingThrows = value.filter(
    (ability): ability is AbilityKey =>
      typeof ability === "string" && validAbilitySet.has(ability as AbilityKey)
  );

  return [...new Set(normalizedSavingThrows)];
}

function normalizeCharacter(value: unknown): Character | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<Character> & {
    role?: unknown;
    class?: unknown;
    xp?: unknown;
    experience?: unknown;
    skillExpertise?: unknown;
    toolProficiencies?: unknown;
    coreStats?: unknown;
    currencies?: unknown;
    savingThrowProficiencies?: unknown;
    hitDiceRemaining?: unknown;
  };
  const id = Number(record.id);

  if (!Number.isFinite(id)) {
    return null;
  }

  const defaults = createEmptyCharacter();
  const normalizedHitPoints = clampNumber(record.hitPoints, 1, 999, defaults.hitPoints);
  const { level: normalizedLevel, xp: normalizedXp } = normalizeLevelAndXp(
    record.level,
    record.xp ?? record.experience
  );
  const normalizedSpecies =
    typeof record.species === "string" ? record.species.trim() : defaults.species;
  const normalizedClassName =
    typeof record.className === "string"
      ? record.className.trim()
      : typeof record.class === "string"
        ? record.class.trim()
        : typeof record.role === "string"
          ? record.role.trim()
          : defaults.className;
  const normalizedBackground =
    typeof record.background === "string" ? record.background.trim() : defaults.background;
  const resolvedBackground = isBackgroundName(normalizedBackground)
    ? normalizedBackground
    : defaults.background;
  const rawSkills = Array.isArray(record.skills)
    ? (record.skills as unknown[]).filter((skill): skill is string => typeof skill === "string")
    : defaults.skills;
  const rawEquipment = Array.isArray(record.equipment)
    ? record.equipment.filter((item): item is string => typeof item === "string")
    : defaults.equipment;
  const rawSkillExpertise = Array.isArray(record.skillExpertise)
    ? (record.skillExpertise as unknown[]).filter((skill): skill is string => typeof skill === "string")
    : (defaults.skillExpertise ?? []);
  const rawToolProficiencies = Array.isArray(record.toolProficiencies)
    ? (record.toolProficiencies as unknown[]).filter(
        (toolProficiency): toolProficiency is string => typeof toolProficiency === "string"
      )
    : (defaults.toolProficiencies ?? []);
  const normalizedSkills = normalizeManualSkillSelections(rawSkills);
  const normalizedEquipment = normalizeEquipmentSelectionsForClass(normalizedClassName, rawEquipment);
  const normalizedToolProficiencies = normalizeToolProficiencySelections(rawToolProficiencies);
  const normalizedSkillExpertise = normalizeSkillExpertiseSelectionsForCharacter(
    normalizedClassName,
    normalizedSpecies,
    resolvedBackground,
    normalizedSkills,
    rawSkillExpertise
  );
  const rawKnownSpellIds = Array.isArray(record.knownSpellIds)
    ? record.knownSpellIds.filter((spellId): spellId is string => typeof spellId === "string")
    : (defaults.knownSpellIds ?? []);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(normalizedClassName, normalizedLevel);
  const normalizedSpellSlotsExpended = normalizeSpellSlotsExpended(
    record.spellSlotsExpended,
    spellSlotTotals
  );
  const normalizedShortRestsUsedToday = clampNumber(
    record.shortRestsUsedToday,
    0,
    2,
    defaults.shortRestsUsedToday ?? 0
  );
  const normalizedHitDiceRemaining = clampNumber(
    record.hitDiceRemaining,
    0,
    normalizedLevel,
    normalizedLevel
  );
  const normalizedCoreStats = normalizeCoreStats(record.coreStats);
  const normalizedCurrencies = normalizeCurrencies(record.currencies, defaults.currencies);
  const normalizedSavingThrowProficiencies = normalizeSavingThrowProficiencies(
    record.savingThrowProficiencies,
    normalizedClassName
  );

  return {
    id,
    name: typeof record.name === "string" ? record.name : defaults.name,
    species: normalizedSpecies,
    className: normalizedClassName,
    level: normalizedLevel,
    xp: normalizedXp,
    hitPoints: normalizedHitPoints,
    currentHitPoints: clampNumber(
      record.currentHitPoints,
      0,
      normalizedHitPoints,
      normalizedHitPoints
    ),
    attributeMode:
      record.attributeMode === "pointBuy" || record.attributeMode === "custom"
        ? record.attributeMode
        : defaults.attributeMode,
    abilities: {
      ...createDefaultAbilities(),
      ...(record.abilities ?? {})
    },
    alignment: (alignmentGrid.flat() as string[]).includes(record.alignment ?? "")
      ? (record.alignment as Character["alignment"])
      : defaults.alignment,
    background: resolvedBackground,
    currencies: normalizedCurrencies,
    skills: normalizedSkills,
    skillExpertise: normalizedSkillExpertise,
    toolProficiencies: normalizedToolProficiencies,
    equipment: normalizedEquipment,
    knownSpellIds: [...new Set(rawKnownSpellIds)],
    spellSlotsExpended: normalizedSpellSlotsExpended,
    shortRestsUsedToday: normalizedShortRestsUsedToday,
    hitDiceRemaining: normalizedHitDiceRemaining,
    coreStats: normalizedCoreStats,
    savingThrowProficiencies: normalizedSavingThrowProficiencies
  };
}

export function loadCharacters(): Character[] {
  if (typeof window === "undefined") {
    return [];
  }

  const serializedCharacters = window.localStorage.getItem(CHARACTERS_STORAGE_KEY);

  if (!serializedCharacters) {
    return [];
  }

  try {
    const parsedCharacters = JSON.parse(serializedCharacters) as unknown;
    if (!Array.isArray(parsedCharacters)) {
      return [];
    }

    return parsedCharacters
      .map((character) => normalizeCharacter(character))
      .filter((character): character is Character => character !== null);
  } catch {
    return [];
  }
}

export function saveCharacters(characters: Character[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(characters));
}

export function findCharacter(characterId: number): Character | undefined {
  return loadCharacters().find((character) => character.id === characterId);
}

export function deleteCharacter(characterId: number): Character[] {
  const characters = loadCharacters();
  const nextCharacters = characters.filter((character) => character.id !== characterId);

  if (nextCharacters.length !== characters.length) {
    saveCharacters(nextCharacters);
  }

  return nextCharacters;
}

export function upsertCharacter(draft: CharacterDraft, characterId?: number): Character {
  const characters = loadCharacters();
  const nextId = characterId ?? Date.now();
  const nextCharacter = normalizeCharacter({
    id: nextId,
    ...draft
  });

  if (!nextCharacter) {
    throw new Error("Unable to save character: invalid character data.");
  }

  const nextCharacters =
    characterId === undefined
      ? [nextCharacter, ...characters]
      : characters.some((character) => character.id === characterId)
        ? characters.map((character) =>
            character.id === characterId ? nextCharacter : character
          )
        : [nextCharacter, ...characters];

  saveCharacters(nextCharacters);
  return nextCharacter;
}
