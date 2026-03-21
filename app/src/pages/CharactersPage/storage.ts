import type { Character, CharacterDraft, CoreStats } from "../../types";
import { currencyKeys } from "../../types";
import { loadPreferences } from "../../storage/preferences";
import {
  CHARACTERS_STORAGE_KEY,
  alignmentGrid,
  createDefaultCoreStats,
  createDefaultAbilities,
  createDefaultCurrencies,
  createEmptyCharacter
} from "./constants";
import { normalizeCharacterConditions, normalizeRoundTracker } from "./combat";
import {
  isBackgroundName,
  normalizeCharacterEquipmentSelections,
  normalizeCharacterProficiencies
} from "./proficiency";
import {
  getCantripLimitForCharacter,
  getCantripSelectionOptionsForCharacter,
  getDefaultCantripIdsForCharacter,
  getPreparedSpellLevelLimitsForCharacter,
  getPreparedSpellLimitForCharacter,
  getPreparedSpellSelectionOptionsForCharacter,
  getSpellSlotTotalsForCharacter,
  normalizePreparedSpellIds,
  normalizeSpellSlotsExpended
} from "./spellcasting";
import { normalizeLevelAndXp } from "./experience";
import { normalizeCustomEquipmentEntries } from "./customEquipment";

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
    passivePerception: normalizeCoreStatValue(record.passivePerception, defaults.passivePerception),
    proficiencyBonus: normalizeCoreStatValue(record.proficiencyBonus, defaults.proficiencyBonus),
    hitDice: normalizeCoreStatValue(record.hitDice, defaults.hitDice)
  };
}

function normalizeCurrencies(
  value: unknown,
  fallbackCurrencies: Character["currencies"]
): Character["currencies"] {
  const normalizedCurrencies: Character["currencies"] = {
    ...createDefaultCurrencies(),
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

  currencyKeys.forEach((currencyKey) => {
    normalizedCurrencies[currencyKey] = Math.max(
      0,
      Math.floor(
        clampNumber(
          normalizedCurrencies[currencyKey],
          0,
          999999999,
          fallbackCurrencies[currencyKey]
        )
      )
    );
  });

  return normalizedCurrencies;
}

function normalizeDeathSaves(value: unknown): NonNullable<Character["deathSaves"]> {
  if (!value || typeof value !== "object") {
    return {
      successes: 0,
      failures: 0
    };
  }

  const record = value as Partial<NonNullable<Character["deathSaves"]>>;

  return {
    successes: Math.floor(clampNumber(record.successes, 0, 3, 0)),
    failures: Math.floor(clampNumber(record.failures, 0, 3, 0))
  };
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
    knownSpellIds?: unknown;
    cantripIds?: unknown;
    preparedSpellIds?: unknown;
    skills?: unknown;
    skillProficiencies?: unknown;
    skillExpertise?: unknown;
    weaponProficiencies?: unknown;
    armorProficiencies?: unknown;
    toolProficiencies?: unknown;
    languageProficiencies?: unknown;
    coreStats?: unknown;
    currencies?: unknown;
    backgroundNotes?: unknown;
    savingThrowProficiencies?: unknown;
    hitDiceRemaining?: unknown;
    maxHitPointsMode?: unknown;
    temporaryHitPoints?: unknown;
    roundTracker?: unknown;
    conditions?: unknown;
    deathSaves?: unknown;
    customEquipment?: unknown;
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
  const normalizedBackgroundNotes =
    typeof record.backgroundNotes === "string"
      ? record.backgroundNotes.trim()
      : defaults.backgroundNotes;
  const resolvedBackground = isBackgroundName(normalizedBackground)
    ? normalizedBackground
    : defaults.background;
  const rawSkills = Array.isArray(record.skills)
    ? (record.skills as unknown[]).filter((skill): skill is string => typeof skill === "string")
    : defaults.skills;
  const rawEquipment = Array.isArray(record.equipment) ? record.equipment : defaults.equipment;
  const rawSkillExpertise = Array.isArray(record.skillExpertise)
    ? (record.skillExpertise as unknown[]).filter(
        (skill): skill is string => typeof skill === "string"
      )
    : (defaults.skillExpertise ?? []);
  const rawLegacySavingThrowProficiencies = Array.isArray(record.savingThrowProficiencies)
    ? (record.savingThrowProficiencies as unknown[]).filter(
        (ability): ability is string => typeof ability === "string"
      )
    : (defaults.savingThrowProficiencies ?? []);
  const rawLegacyToolProficiencies = Array.isArray(record.toolProficiencies)
    ? (record.toolProficiencies as unknown[]).filter(
        (toolProficiency): toolProficiency is string => typeof toolProficiency === "string"
      )
    : (defaults.toolProficiencies ?? []);
  const normalizedEquipment = normalizeCharacterEquipmentSelections(rawEquipment);
  const normalizedCustomEquipment = normalizeCustomEquipmentEntries(record.customEquipment);
  const normalizedProficiencies = normalizeCharacterProficiencies({
    className: normalizedClassName,
    species: normalizedSpecies,
    background: resolvedBackground,
    skillProficiencies: record.skillProficiencies,
    savingThrowProficiencies: record.savingThrowProficiencies,
    weaponProficiencies: record.weaponProficiencies,
    armorProficiencies: record.armorProficiencies,
    toolProficiencies: record.toolProficiencies,
    languageProficiencies: record.languageProficiencies,
    legacySkills: rawSkills,
    legacySkillExpertise: rawSkillExpertise,
    legacySavingThrowProficiencies: rawLegacySavingThrowProficiencies,
    legacyToolProficiencies: rawLegacyToolProficiencies
  });
  const rawPreparedSpellIds = Array.isArray(record.preparedSpellIds)
    ? record.preparedSpellIds.filter((spellId): spellId is string => typeof spellId === "string")
    : Array.isArray(record.knownSpellIds)
      ? record.knownSpellIds.filter((spellId): spellId is string => typeof spellId === "string")
      : (defaults.preparedSpellIds ?? []);
  const rawCantripIds = Array.isArray(record.cantripIds)
    ? record.cantripIds.filter((spellId): spellId is string => typeof spellId === "string")
    : getDefaultCantripIdsForCharacter(normalizedClassName, normalizedLevel);
  const cantripLimit = getCantripLimitForCharacter(normalizedClassName, normalizedLevel);
  const cantripSelectionOptionIds = new Set(
    getCantripSelectionOptionsForCharacter(normalizedClassName, normalizedLevel).map(
      (spell) => spell.id
    )
  );
  const normalizedCantripIds = [...new Set(rawCantripIds)]
    .filter((spellId) => cantripSelectionOptionIds.has(spellId))
    .slice(0, cantripLimit ?? Number.POSITIVE_INFINITY);
  const preparedSpellLimit = getPreparedSpellLimitForCharacter(
    normalizedClassName,
    normalizedLevel
  );
  const preparedSpellLevelLimits = getPreparedSpellLevelLimitsForCharacter(
    normalizedClassName,
    normalizedLevel
  );
  const preparedSpellSelectionOptions = getPreparedSpellSelectionOptionsForCharacter(
    normalizedClassName,
    normalizedLevel
  );
  const preparedSpellSelectionOptionIds = new Set(
    preparedSpellSelectionOptions.map((spell) => spell.id)
  );
  const normalizedPreparedSpellIds = normalizePreparedSpellIds(
    rawPreparedSpellIds.filter((spellId) => preparedSpellSelectionOptionIds.has(spellId)),
    preparedSpellSelectionOptions,
    preparedSpellLimit,
    preparedSpellLevelLimits
  );
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
  const normalizedMaxHitPointsMode =
    record.maxHitPointsMode === "automatic" || record.maxHitPointsMode === "custom"
      ? record.maxHitPointsMode
      : loadPreferences().defaultMaxHitPointsMode;
  const normalizedRoundTracker = normalizeRoundTracker(record.roundTracker);
  const normalizedConditions = normalizeCharacterConditions(record.conditions);
  const normalizedDeathSaves = normalizeDeathSaves(record.deathSaves);
  const normalizedTemporaryHitPoints = Math.floor(
    clampNumber(record.temporaryHitPoints, 0, 999, defaults.temporaryHitPoints)
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
    temporaryHitPoints: normalizedTemporaryHitPoints,
    maxHitPointsMode: normalizedMaxHitPointsMode,
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
    backgroundNotes: normalizedBackgroundNotes,
    currencies: normalizedCurrencies,
    skillProficiencies: normalizedProficiencies.skillProficiencies,
    savingThrowProficiencies: normalizedProficiencies.savingThrowProficiencies,
    weaponProficiencies: normalizedProficiencies.weaponProficiencies,
    armorProficiencies: normalizedProficiencies.armorProficiencies,
    toolProficiencies: normalizedProficiencies.toolProficiencies,
    languageProficiencies: normalizedProficiencies.languageProficiencies,
    roundTracker: normalizedRoundTracker,
    conditions: normalizedConditions,
    deathSaves: normalizedDeathSaves,
    equipment: normalizedEquipment,
    customEquipment: normalizedCustomEquipment,
    cantripIds: normalizedCantripIds,
    preparedSpellIds: normalizedPreparedSpellIds,
    spellSlotsExpended: normalizedSpellSlotsExpended,
    shortRestsUsedToday: normalizedShortRestsUsedToday,
    hitDiceRemaining: normalizedHitDiceRemaining,
    coreStats: normalizedCoreStats
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

export function upsertCharacter(
  draft: CharacterDraft | Omit<Character, "id">,
  characterId?: number
): Character {
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
        ? characters.map((character) => (character.id === characterId ? nextCharacter : character))
        : [nextCharacter, ...characters];

  saveCharacters(nextCharacters);
  return nextCharacter;
}
