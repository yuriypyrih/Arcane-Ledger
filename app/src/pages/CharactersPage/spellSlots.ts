import type { ClassEntry, FeatureClassObj } from "../../codex/entries/types";
import type { CharacterCustomClassConfig } from "../../types";
import { getClassEntryByName } from "../../codex/selectors";
import { getSubclassSpellcastingProgressionRow } from "../../codex/classes/subclassSpellcasting";
import { isCustomClassName, normalizeCustomClassSpellSlotMaximums } from "./customClass";

const spellSlotLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

type SpellSlotFeatureClassObj = FeatureClassObj & {
  spellSlots?: number[];
};

function createSpellSlotRow(...slots: number[]): number[] {
  return spellSlotLevels.map((_, index) => Math.max(0, Math.floor(slots[index] ?? 0)));
}

const emptySpellSlotRow = createSpellSlotRow();

function clampCharacterLevel(level: number): number {
  return Math.max(1, Math.min(20, Math.floor(level)));
}

function getClassEntry(className: string): ClassEntry | undefined {
  return getClassEntryByName(className) ?? undefined;
}

function getClassFeatureRowsUpToLevel(className: string, level: number): SpellSlotFeatureClassObj[] {
  const normalizedLevel = clampCharacterLevel(level);
  const classEntry = getClassEntry(className);

  if (!classEntry) {
    return [];
  }

  return (classEntry.features ?? [])
    .filter(
      (featureRow): featureRow is SpellSlotFeatureClassObj => featureRow.level <= normalizedLevel
    )
    .sort((left, right) => left.level - right.level);
}

function getClassFeatureRowForLevel(
  className: string,
  level: number
): SpellSlotFeatureClassObj | undefined {
  const featureRows = getClassFeatureRowsUpToLevel(className, level);

  return featureRows[featureRows.length - 1];
}

export function getSpellSlotTotalsForCharacter(
  className: string,
  level: number,
  subclassId?: string,
  customClass?: CharacterCustomClassConfig
): number[] {
  if (isCustomClassName(className)) {
    return normalizeCustomClassSpellSlotMaximums(customClass?.spellSlotMaximums);
  }

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
