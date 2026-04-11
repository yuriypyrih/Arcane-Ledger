import {
  CLASS_FEATURE,
  type ClassEntry,
  type FeatureClassObj,
  type SpellEntry
} from "../../codex/entries";
import type { CharacterClassFeatureState, CharacterStatusEntry } from "../../types";
import { getSpellEntriesForSpellListClasses } from "../../codex/classes/spellAccess";
import { getClassEntryByName } from "../../codex/selectors";
import {
  getClassSpellListClassesForCharacter,
  getPreparedSpellListClassesForCharacter,
  getSpellbookUsageForCharacter,
  getSubclassSpellcastingProgressionRow
} from "../../codex/classes/subclassSpellcasting";
import {
  getAlwaysPreparedSpellIdsForCharacter,
  getCantripLimitBonusForCharacter
} from "./classFeatures";

const spellSlotLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const arcaneTricksterRequiredCantripId = "spell-mage-hand";

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

function getCantripCountForFeatureRow(featureRow?: SpellcastingFeatureClassObj): number | null {
  const cantripCount = featureRow?.cantrips;

  return typeof cantripCount === "number" ? Math.max(0, Math.floor(cantripCount)) : null;
}

export function isSpellcastingClass(className: string, level = 20, subclassId?: string): boolean {
  if (getSubclassSpellcastingProgressionRow(className, level, subclassId)) {
    return true;
  }

  return getClassFeatureRowsUpToLevel(className, level).some((featureRow) =>
    featureRow.classFeatures.some((classFeature) => spellcastingClassFeatures.has(classFeature))
  );
}

export function getSpellLevel(spell: Pick<SpellEntry, "spellLevel">): number {
  return sanitizeSpellLevel(spell.spellLevel);
}

export function getSpellSlotTotalsForCharacter(
  className: string,
  level: number,
  subclassId?: string
): number[] {
  const subclassFeatureRow = getSubclassSpellcastingProgressionRow(className, level, subclassId);

  if (subclassFeatureRow) {
    return createSpellSlotRow(...subclassFeatureRow.spellSlots);
  }

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

export function getPreparedSpellLimitForCharacter(
  className: string,
  level: number,
  subclassId?: string
): number | null {
  const subclassFeatureRow = getSubclassSpellcastingProgressionRow(className, level, subclassId);

  if (subclassFeatureRow) {
    return Math.max(0, Math.floor(subclassFeatureRow.preparedSpells));
  }

  const preparedSpells = getClassFeatureRowForLevel(className, level)?.preparedSpells;

  return typeof preparedSpells === "number" ? Math.max(0, Math.floor(preparedSpells)) : null;
}

export function getCantripLimitForCharacter(
  className: string,
  level: number,
  classFeatureState?: CharacterClassFeatureState,
  subclassId?: string
): number | null {
  const subclassFeatureRow = getSubclassSpellcastingProgressionRow(className, level, subclassId);
  const cantripCount =
    subclassFeatureRow !== null
      ? Math.max(0, Math.floor(subclassFeatureRow.cantrips))
      : getCantripCountForFeatureRow(getClassFeatureRowForLevel(className, level));

  if (cantripCount === null) {
    return null;
  }

  return Math.max(
    0,
    cantripCount +
      getCantripLimitBonusForCharacter({
        className,
        level,
        classFeatureState,
        subclassId
      })
  );
}

export function usesPreparedSpellsForCharacter(
  className: string,
  level: number,
  subclassId?: string
): boolean {
  return getPreparedSpellLimitForCharacter(className, level, subclassId) !== null;
}

export function usesSpellbookForCharacter(className: string, subclassId?: string): boolean {
  return getSpellbookUsageForCharacter(className, subclassId);
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
  level: number,
  subclassId?: string
): SpellEntry[] {
  const cantripLimit = getCantripLimitForCharacter(className, level, undefined, subclassId);

  if (
    !isSpellcastingClass(className, level, subclassId) ||
    cantripLimit === null ||
    cantripLimit <= 0
  ) {
    return [];
  }

  const cantripOptions = getSpellEntriesForSpellListClasses(
    getClassSpellListClassesForCharacter(className, subclassId)
  ).filter((spell) => getSpellLevel(spell) === 0);

  if (className === "Rogue" && subclassId === "rogue-arcane-trickster") {
    return cantripOptions.filter((spell) => spell.id !== arcaneTricksterRequiredCantripId);
  }

  return cantripOptions;
}

export function getPreparedSpellSelectionOptionsForCharacter(
  className: string,
  level: number,
  subclassId?: string
): SpellEntry[] {
  if (!usesPreparedSpellsForCharacter(className, level, subclassId)) {
    return [];
  }

  const highestSlotLevel = getHighestSlotLevel(
    getSpellSlotTotalsForCharacter(className, level, subclassId)
  );
  const preparedSpellEntries = getSpellEntriesForSpellListClasses(
    getPreparedSpellListClassesForCharacter(className, level, subclassId)
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
  spellbookSpellIds?: string[],
  subclassId?: string,
  statusEntries?: CharacterStatusEntry[]
): string[] {
  return getAlwaysPreparedSpellIdsForCharacter({
    className,
    level,
    classFeatureState,
    spellbookSpellIds,
    subclassId,
    statusEntries
  });
}

export function getDefaultCantripIdsForCharacter(
  className: string,
  level: number,
  classFeatureState?: CharacterClassFeatureState,
  subclassId?: string
): string[] {
  const cantripLimit = getCantripLimitForCharacter(
    className,
    level,
    classFeatureState,
    subclassId
  );

  if (cantripLimit === null || cantripLimit <= 0) {
    return [];
  }

  return getCantripSelectionOptionsForCharacter(className, level, subclassId)
    .slice(0, cantripLimit)
    .map((spell) => spell.id);
}
