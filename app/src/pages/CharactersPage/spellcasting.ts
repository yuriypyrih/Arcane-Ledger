import {
  CLASS_FEATURE,
  SPELL_LIST_CLASS,
  type ClassEntry,
  type FeatureClassObj,
  type SpellEntry
} from "../../codex/entries";
import type { CharacterClassFeatureState } from "../../types";
import { getSpellEntriesForClassName } from "../../codex/classes";
import { getSpellEntriesForSpellListClasses } from "../../codex/classes/spellAccess";
import { getClassEntryByName } from "../../codex/selectors";
import {
  getAlwaysPreparedSpellIdsForCharacter,
  getCantripLimitBonusForCharacter
} from "./classFeatures";

const spellSlotLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function createSpellSlotRow(...slots: number[]): number[] {
  return spellSlotLevels.map((_, index) => Math.max(0, Math.floor(slots[index] ?? 0)));
}

const emptySpellSlotRow = createSpellSlotRow();

type SpellcastingFeatureClassObj = FeatureClassObj & {
  preparedSpells?: number;
  spellSlots?: number[];
};

const spellcastingClassFeatures = new Set<CLASS_FEATURE>([
  CLASS_FEATURE.SPELLCASTING,
  CLASS_FEATURE.PACT_MAGIC
]);

function clampCharacterLevel(level: number): number {
  return Math.max(1, Math.min(20, Math.floor(level)));
}

function sanitizeSpellLevel(value: unknown): number {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 1;
  }

  return Math.max(0, Math.min(9, Math.floor(numericValue)));
}

function getClassEntry(className: string): ClassEntry | undefined {
  return getClassEntryByName(className) ?? undefined;
}

function getClassFeatureRowsUpToLevel(
  className: string,
  level: number
): SpellcastingFeatureClassObj[] {
  const normalizedLevel = clampCharacterLevel(level);
  const classEntry = getClassEntry(className);

  if (!classEntry) {
    return [];
  }

  return (classEntry.features ?? [])
    .filter(
      (featureRow): featureRow is SpellcastingFeatureClassObj => featureRow.level <= normalizedLevel
    )
    .sort((left, right) => left.level - right.level);
}

function getClassFeatureRowForLevel(
  className: string,
  level: number
): SpellcastingFeatureClassObj | undefined {
  const featureRows = getClassFeatureRowsUpToLevel(className, level);

  return featureRows[featureRows.length - 1];
}

function getHighestSlotLevel(slotTotals: number[]): number {
  for (let index = slotTotals.length - 1; index >= 0; index -= 1) {
    if (slotTotals[index] > 0) {
      return index + 1;
    }
  }

  return 0;
}

function getPreparedSpellAccessListClasses(className: string, level: number): SPELL_LIST_CLASS[] {
  if (className === "Bard" && level >= 10) {
    return [
      SPELL_LIST_CLASS.BARD,
      SPELL_LIST_CLASS.CLERIC,
      SPELL_LIST_CLASS.DRUID,
      SPELL_LIST_CLASS.WIZARD
    ];
  }

  const baseClassSpellEntries = getSpellEntriesForClassName(className);

  if (baseClassSpellEntries.length === 0) {
    return [];
  }

  switch (className) {
    case "Artificer":
      return [SPELL_LIST_CLASS.ARTIFICER];
    case "Bard":
      return [SPELL_LIST_CLASS.BARD];
    case "Cleric":
      return [SPELL_LIST_CLASS.CLERIC];
    case "Druid":
      return [SPELL_LIST_CLASS.DRUID];
    case "Paladin":
      return [SPELL_LIST_CLASS.PALADIN];
    case "Ranger":
      return [SPELL_LIST_CLASS.RANGER];
    case "Sorcerer":
      return [SPELL_LIST_CLASS.SORCERER];
    case "Warlock":
      return [SPELL_LIST_CLASS.WARLOCK];
    case "Wizard":
      return [SPELL_LIST_CLASS.WIZARD];
    default:
      return [];
  }
}

function getCantripCountForFeatureRow(featureRow?: SpellcastingFeatureClassObj): number | null {
  const cantripCount = featureRow?.cantrips;

  return typeof cantripCount === "number" ? Math.max(0, Math.floor(cantripCount)) : null;
}

export function isSpellcastingClass(className: string, level = 20): boolean {
  return getClassFeatureRowsUpToLevel(className, level).some((featureRow) =>
    featureRow.classFeatures.some((classFeature) => spellcastingClassFeatures.has(classFeature))
  );
}

export function getSpellLevel(spell: Pick<SpellEntry, "spellLevel">): number {
  return sanitizeSpellLevel(spell.spellLevel);
}

export function getSpellSlotTotalsForCharacter(className: string, level: number): number[] {
  const featureRow = getClassFeatureRowForLevel(className, level);

  if (!Array.isArray(featureRow?.spellSlots)) {
    return [...emptySpellSlotRow];
  }

  return createSpellSlotRow(...featureRow.spellSlots);
}

export function normalizeSpellSlotsExpended(
  spellSlotsExpended: unknown,
  spellSlotTotals: number[]
): number[] {
  const rawValues = Array.isArray(spellSlotsExpended) ? spellSlotsExpended : [];

  return spellSlotLevels.map((_, index) => {
    const parsedValue = Number(rawValues[index]);
    const safeValue = Number.isFinite(parsedValue) ? Math.max(0, Math.floor(parsedValue)) : 0;

    return Math.min(spellSlotTotals[index] ?? 0, safeValue);
  });
}

export function getPreparedSpellLimitForCharacter(className: string, level: number): number | null {
  const preparedSpells = getClassFeatureRowForLevel(className, level)?.preparedSpells;

  return typeof preparedSpells === "number" ? Math.max(0, Math.floor(preparedSpells)) : null;
}

export function getCantripLimitForCharacter(
  className: string,
  level: number,
  classFeatureState?: CharacterClassFeatureState
): number | null {
  const cantripCount = getCantripCountForFeatureRow(getClassFeatureRowForLevel(className, level));

  if (cantripCount === null) {
    return null;
  }

  return Math.max(
    0,
    cantripCount +
      getCantripLimitBonusForCharacter({
        className,
        level,
        classFeatureState
      })
  );
}

export function usesPreparedSpellsForCharacter(className: string, level: number): boolean {
  return getPreparedSpellLimitForCharacter(className, level) !== null;
}

export function usesSpellbookForCharacter(className: string): boolean {
  return className === "Wizard";
}

export function hasClassFeatureForCharacter(
  className: string,
  level: number,
  classFeature: CLASS_FEATURE
): boolean {
  return getClassFeatureRowsUpToLevel(className, level).some((featureRow) =>
    featureRow.classFeatures.includes(classFeature)
  );
}

export function getCantripSelectionOptionsForCharacter(
  className: string,
  level: number
): SpellEntry[] {
  const cantripLimit = getCantripLimitForCharacter(className, level);

  if (!isSpellcastingClass(className, level) || cantripLimit === null || cantripLimit <= 0) {
    return [];
  }

  return getSpellEntriesForClassName(className).filter((spell) => getSpellLevel(spell) === 0);
}

export function getPreparedSpellSelectionOptionsForCharacter(
  className: string,
  level: number
): SpellEntry[] {
  if (!usesPreparedSpellsForCharacter(className, level)) {
    return [];
  }

  const highestSlotLevel = getHighestSlotLevel(getSpellSlotTotalsForCharacter(className, level));
  const preparedSpellEntries = getSpellEntriesForSpellListClasses(
    getPreparedSpellAccessListClasses(className, level)
  );

  return preparedSpellEntries.filter((spell) => {
    const spellLevel = getSpellLevel(spell);
    return spellLevel > 0 && spellLevel <= highestSlotLevel;
  });
}

export function normalizePreparedSpellIds(
  spellIds: unknown,
  availableSpells: SpellEntry[],
  totalLimit: number | null,
  excludedSpellIds: string[] = []
): string[] {
  const availableSpellsById = new Map(availableSpells.map((spell) => [spell.id, spell]));
  const excludedSpellIdSet = new Set(excludedSpellIds);
  const rawSpellIds = Array.isArray(spellIds)
    ? spellIds.filter((spellId): spellId is string => typeof spellId === "string")
    : [];
  const selectedSpellIds: string[] = [];

  for (const spellId of [...new Set(rawSpellIds)]) {
    if (totalLimit !== null && selectedSpellIds.length >= totalLimit) {
      break;
    }

    if (excludedSpellIdSet.has(spellId)) {
      continue;
    }

    const spell = availableSpellsById.get(spellId);

    if (!spell) {
      continue;
    }

    const spellLevel = getSpellLevel(spell);

    if (spellLevel <= 0) {
      continue;
    }

    selectedSpellIds.push(spellId);
  }

  return selectedSpellIds;
}

export function normalizeSpellbookSpellIds(
  spellIds: unknown,
  availableSpells: SpellEntry[]
): string[] {
  const availableSpellsById = new Map(availableSpells.map((spell) => [spell.id, spell]));
  const rawSpellIds = Array.isArray(spellIds)
    ? spellIds.filter((spellId): spellId is string => typeof spellId === "string")
    : [];
  const selectedSpellIds: string[] = [];

  for (const spellId of [...new Set(rawSpellIds)]) {
    const spell = availableSpellsById.get(spellId);

    if (!spell) {
      continue;
    }

    if (getSpellLevel(spell) <= 0) {
      continue;
    }

    selectedSpellIds.push(spellId);
  }

  return selectedSpellIds;
}

export function normalizeTrackedSpellIds(
  spellIds: unknown,
  availableSpells: SpellEntry[],
  limit: number | null
): string[] {
  const availableSpellIds = new Set(availableSpells.map((spell) => spell.id));
  const rawSpellIds = Array.isArray(spellIds)
    ? spellIds.filter((spellId): spellId is string => typeof spellId === "string")
    : [];

  return [...new Set(rawSpellIds)]
    .filter((spellId) => availableSpellIds.has(spellId))
    .slice(0, limit ?? Number.POSITIVE_INFINITY);
}

export function getAlwaysPreparedSpellIds(
  className: string,
  level: number,
  classFeatureState?: CharacterClassFeatureState,
  spellbookSpellIds?: string[]
): string[] {
  return getAlwaysPreparedSpellIdsForCharacter({
    className,
    level,
    classFeatureState,
    spellbookSpellIds
  });
}

export function getDefaultCantripIdsForCharacter(
  className: string,
  level: number,
  classFeatureState?: CharacterClassFeatureState
): string[] {
  const cantripLimit = getCantripLimitForCharacter(className, level, classFeatureState);

  if (cantripLimit === null || cantripLimit <= 0) {
    return [];
  }

  return getCantripSelectionOptionsForCharacter(className, level)
    .slice(0, cantripLimit)
    .map((spell) => spell.id);
}
