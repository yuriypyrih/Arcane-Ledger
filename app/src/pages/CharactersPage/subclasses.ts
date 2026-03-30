import { CLASS_FEATURE, type FeatureMapEntry, type SubclassEntry, type SubclassFeatureClassObj } from "../../codex/entries";
import { getSubclassEntryById, getSubclassEntriesForClass } from "../../codex/subclasses";
import type { Character } from "../../types";

const subclassSelectionFeatureByClassName: Partial<Record<string, CLASS_FEATURE>> = {
  Artificer: CLASS_FEATURE.ARTIFICER_SUBCLASS,
  Barbarian: CLASS_FEATURE.BARBARIAN_SUBCLASS,
  Bard: CLASS_FEATURE.BARD_SUBCLASS,
  Cleric: CLASS_FEATURE.CLERIC_SUBCLASS,
  Druid: CLASS_FEATURE.DRUID_SUBCLASS,
  Fighter: CLASS_FEATURE.FIGHTER_SUBCLASS,
  Monk: CLASS_FEATURE.MONK_SUBCLASS,
  Paladin: CLASS_FEATURE.PALADIN_SUBCLASS,
  Ranger: CLASS_FEATURE.RANGER_SUBCLASS,
  Rogue: CLASS_FEATURE.ROGUE_SUBCLASS,
  Sorcerer: CLASS_FEATURE.SORCERER_SUBCLASS,
  Warlock: CLASS_FEATURE.WARLOCK_SUBCLASS,
  Wizard: CLASS_FEATURE.WIZARD_SUBCLASS
};

export function getSubclassOptionsForClassName(className: string): SubclassEntry[] {
  return getSubclassEntriesForClass(className);
}

export function normalizeSubclassId(value: unknown, className: string): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const subclass = getSubclassEntryById(trimmedValue);

  return subclass && subclass.className === className ? subclass.id : undefined;
}

export function getSelectedSubclassForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "subclassId">>
): SubclassEntry | null {
  const subclassId = normalizeSubclassId(character.subclassId, character.className);

  return subclassId ? (getSubclassEntryById(subclassId) ?? null) : null;
}

export function getSubclassSelectionFeatureForClassName(className: string): CLASS_FEATURE | null {
  return subclassSelectionFeatureByClassName[className] ?? null;
}

export function getSubclassFeatureRowsForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "subclassId">>
): SubclassFeatureClassObj[] {
  const subclass = getSelectedSubclassForCharacter(character);

  return subclass ? [...subclass.features].sort((left, right) => left.level - right.level) : [];
}

export function getUnlockedSubclassFeatureRowsForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): SubclassFeatureClassObj[] {
  return getSubclassFeatureRowsForCharacter(character).filter((featureRow) => featureRow.level <= character.level);
}

export function getSubclassFeatureDetails(
  subclass: SubclassEntry | null,
  level: number,
  feature: CLASS_FEATURE
): FeatureMapEntry | null {
  const matchingRow = subclass?.features.find((featureRow) => featureRow.level === level);

  if (!matchingRow) {
    return null;
  }

  return matchingRow.featureOverrides?.[feature] ?? null;
}
