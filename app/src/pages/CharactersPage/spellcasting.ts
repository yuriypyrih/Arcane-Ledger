import {
  CLASS_FEATURE,
  type ClassEntry,
  type FeatureClassObj,
  type SpellEntry
} from "../../codex/entries";
import type {
  CharacterClassRulesConfig,
  CharacterClassFeatureState,
  CharacterCustomClassConfig,
  CharacterStatusEntry
} from "../../types";
import {
  getSpellEntriesForAllSpellListClasses,
  getSpellEntriesForSpellListClasses
} from "../../codex/classes/spellAccess";
import { getClassEntryByName } from "../../codex/selectors";
import {
  getClassSpellListClassesForCharacter,
  getPreparedSpellListClassesForCharacter,
  getSpellbookUsageForCharacter,
  getSubclassSpellcastingProgressionRow
} from "../../codex/classes/subclassSpellcasting";
import { getCantripLimitBonusForCharacter } from "./classFeatures/actions";
import { getAlwaysPreparedSpellIdsForCharacter } from "./classFeatures/resources";
import { getSpellSlotTotalsForCharacter } from "./spellSlots";
import {
  getCharacterClassRulesConfig,
  isCharacterClassRulesSpellcastingEnabled,
  isCustomClassName
} from "./customClass";
import { getSpellLevel } from "./spellLevels";
export { getSpellLevel } from "./spellLevels";

const arcaneTricksterRequiredCantripId = "spell-mage-hand";

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

function normalizeSpellId(value: string): string {
  return value.trim();
}

function normalizeSpellIdList(spellIds: unknown): string[] {
  return Array.isArray(spellIds)
    ? spellIds
        .filter((spellId): spellId is string => typeof spellId === "string")
        .map(normalizeSpellId)
        .filter((spellId) => spellId.length > 0)
    : [];
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
    getCharacterClassRulesConfig({ className, classRules, customClass })
      .spellcastingRulesEnforced
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

export { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "./spellSlots";

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

export function getCantripLimitForCharacter(
  className: string,
  level: number,
  classFeatureState?: CharacterClassFeatureState,
  subclassId?: string,
  customClass?: CharacterCustomClassConfig,
  classRules?: CharacterClassRulesConfig
): number | null {
  if (!isSpellcastingClass(className, level, subclassId, customClass, classRules)) {
    return 0;
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

export function usesSpellbookForCharacter(
  className: string,
  subclassId?: string,
  customClass?: CharacterCustomClassConfig,
  classRules?: CharacterClassRulesConfig,
  level = 20
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
    return false;
  }

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
  subclassId?: string,
  customClass?: CharacterCustomClassConfig,
  classRules?: CharacterClassRulesConfig
): SpellEntry[] {
  if (
    usesFlexibleSpellcastingRulesForCharacter(
      className,
      level,
      subclassId,
      customClass,
      classRules
    )
  ) {
    return getSpellEntriesForAllSpellListClasses().filter((spell) => getSpellLevel(spell) === 0);
  }

  const cantripLimit = getCantripLimitForCharacter(
    className,
    level,
    undefined,
    subclassId,
    customClass,
    classRules
  );

  if (
    !isSpellcastingClass(className, level, subclassId, customClass, classRules) ||
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
  subclassId?: string,
  customClass?: CharacterCustomClassConfig,
  classRules?: CharacterClassRulesConfig
): SpellEntry[] {
  if (
    usesFlexibleSpellcastingRulesForCharacter(
      className,
      level,
      subclassId,
      customClass,
      classRules
    )
  ) {
    return getSpellEntriesForAllSpellListClasses().filter((spell) => getSpellLevel(spell) > 0);
  }

  if (!usesPreparedSpellsForCharacter(className, level, subclassId, customClass, classRules)) {
    return [];
  }

  const highestSlotLevel = getHighestSlotLevel(
    getSpellSlotTotalsForCharacter(className, level, subclassId, customClass, classRules)
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
  const excludedSpellIdSet = new Set(excludedSpellIds.map(normalizeSpellId));
  const rawSpellIds = normalizeSpellIdList(spellIds);
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
  availableSpells: SpellEntry[],
  alwaysIncludedSpellIds: string[] = []
): string[] {
  const availableSpellsById = new Map(availableSpells.map((spell) => [spell.id, spell]));
  const rawSpellIds = normalizeSpellIdList(spellIds);
  const selectedSpellIds: string[] = [];

  for (const spellId of [
    ...new Set([...rawSpellIds, ...alwaysIncludedSpellIds.map(normalizeSpellId)])
  ]) {
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
  const rawSpellIds = normalizeSpellIdList(spellIds);

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
  statusEntries?: CharacterStatusEntry[],
  customClass?: CharacterCustomClassConfig,
  classRules?: CharacterClassRulesConfig
): string[] {
  return getAlwaysPreparedSpellIdsForCharacter({
    className,
    level,
    classFeatureState,
    classRules,
    customClass,
    spellbookSpellIds,
    subclassId,
    statusEntries
  });
}
