import {
  CLASS_FEATURE,
  ENTRY_CATEGORIES,
  hardcodedCodexEntries,
  type ClassEntry,
  type FeatureClassObj,
  type SpellEntry
} from "../../codex/entries";
import { getSpellEntriesForClassName } from "../../codex/classes";

const spellSlotLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function createSpellSlotRow(...slots: number[]): number[] {
  return spellSlotLevels.map((_, index) => Math.max(0, Math.floor(slots[index] ?? 0)));
}

const emptySpellSlotRow = createSpellSlotRow();

const codexClassEntries = hardcodedCodexEntries.filter(
  (entry): entry is ClassEntry => entry.category === ENTRY_CATEGORIES.CLASSES
);

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
  return codexClassEntries.find((entry) => entry.name === className);
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

  return classEntry.features
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

export function getCantripLimitForCharacter(className: string, level: number): number | null {
  return getCantripCountForFeatureRow(getClassFeatureRowForLevel(className, level));
}

export function usesPreparedSpellsForCharacter(className: string, level: number): boolean {
  return getPreparedSpellLimitForCharacter(className, level) !== null;
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

  return getSpellEntriesForClassName(className).filter((spell) => {
    const spellLevel = getSpellLevel(spell);
    return spellLevel > 0 && spellLevel <= highestSlotLevel;
  });
}

export function getDefaultCantripIdsForCharacter(className: string, level: number): string[] {
  const cantripLimit = getCantripLimitForCharacter(className, level);

  if (cantripLimit === null || cantripLimit <= 0) {
    return [];
  }

  return getCantripSelectionOptionsForCharacter(className, level)
    .slice(0, cantripLimit)
    .map((spell) => spell.id);
}
