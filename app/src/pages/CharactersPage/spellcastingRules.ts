import { CLASS_FEATURE, type ClassEntry, type FeatureClassObj } from "../../codex/entries";
import { getSubclassSpellcastingProgressionRow } from "../../codex/classes/subclassSpellcasting";
import { getClassEntryByName } from "../../codex/selectors";
import type { CharacterClassRulesConfig, CharacterCustomClassConfig } from "../../types";
import {
  getCharacterClassRulesConfig,
  isCharacterClassRulesSpellcastingEnabled,
  isCustomClassName
} from "./customClass";

export type SpellcastingFeatureClassObj = FeatureClassObj & {
  cantrips?: number;
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

function getClassEntry(className: string): ClassEntry | undefined {
  return getClassEntryByName(className) ?? undefined;
}

export function getClassFeatureRowsUpToLevel(
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

export function getClassFeatureRowForLevel(
  className: string,
  level: number
): SpellcastingFeatureClassObj | undefined {
  const featureRows = getClassFeatureRowsUpToLevel(className, level);

  return featureRows[featureRows.length - 1];
}

export function getHighestSlotLevel(slotTotals: number[]): number {
  for (let index = slotTotals.length - 1; index >= 0; index -= 1) {
    if (slotTotals[index] > 0) {
      return index + 1;
    }
  }

  return 0;
}

export function getCantripCountForFeatureRow(
  featureRow?: SpellcastingFeatureClassObj
): number | null {
  const cantripCount = featureRow?.cantrips;

  return typeof cantripCount === "number" ? Math.max(0, Math.floor(cantripCount)) : null;
}

export function hasBuiltInSpellcastingForCharacter(
  className: string,
  level = 20,
  subclassId?: string
): boolean {
  if (isCustomClassName(className)) {
    return false;
  }

  if (getSubclassSpellcastingProgressionRow(className, level, subclassId)) {
    return true;
  }

  return getClassFeatureRowsUpToLevel(className, level).some((featureRow) =>
    featureRow.classFeatures.some((classFeature) => spellcastingClassFeatures.has(classFeature))
  );
}

export function areSpellcastingRulesEnforcedForCharacter(
  className: string,
  level = 20,
  subclassId?: string,
  customClass?: CharacterCustomClassConfig,
  classRules?: CharacterClassRulesConfig
): boolean {
  return (
    hasBuiltInSpellcastingForCharacter(className, level, subclassId) &&
    !isCustomClassName(className) &&
    getCharacterClassRulesConfig({ className, classRules, customClass }).spellcastingRulesEnforced
  );
}

export function usesFlexibleSpellcastingRulesForCharacter(
  className: string,
  level = 20,
  subclassId?: string,
  customClass?: CharacterCustomClassConfig,
  classRules?: CharacterClassRulesConfig
): boolean {
  return (
    isCharacterClassRulesSpellcastingEnabled({ className, classRules, customClass }) ||
    (hasBuiltInSpellcastingForCharacter(className, level, subclassId) &&
      !areSpellcastingRulesEnforcedForCharacter(
        className,
        level,
        subclassId,
        customClass,
        classRules
      ))
  );
}

export function isSpellcastingClass(
  className: string,
  level = 20,
  subclassId?: string,
  customClass?: CharacterCustomClassConfig,
  classRules?: CharacterClassRulesConfig
): boolean {
  return (
    hasBuiltInSpellcastingForCharacter(className, level, subclassId) ||
    isCharacterClassRulesSpellcastingEnabled({ className, classRules, customClass })
  );
}

export function getPreparedSpellLimitForCharacter(
  className: string,
  level: number,
  subclassId?: string,
  customClass?: CharacterCustomClassConfig,
  classRules?: CharacterClassRulesConfig
): number | null {
  if (!isSpellcastingClass(className, level, subclassId, customClass, classRules)) {
    return null;
  }

  if (
    usesFlexibleSpellcastingRulesForCharacter(
      className,
      level,
      subclassId,
      customClass,
      classRules
    )
  ) {
    return null;
  }

  const subclassFeatureRow = getSubclassSpellcastingProgressionRow(className, level, subclassId);

  if (subclassFeatureRow) {
    return Math.max(0, Math.floor(subclassFeatureRow.preparedSpells));
  }

  const preparedSpells = getClassFeatureRowForLevel(className, level)?.preparedSpells;

  return typeof preparedSpells === "number" ? Math.max(0, Math.floor(preparedSpells)) : null;
}

export function usesPreparedSpellsForCharacter(
  className: string,
  level: number,
  subclassId?: string,
  customClass?: CharacterCustomClassConfig,
  classRules?: CharacterClassRulesConfig
): boolean {
  if (
    usesFlexibleSpellcastingRulesForCharacter(
      className,
      level,
      subclassId,
      customClass,
      classRules
    )
  ) {
    return true;
  }

  return (
    getPreparedSpellLimitForCharacter(className, level, subclassId, customClass, classRules) !==
    null
  );
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
