import type { CLASS_FEATURE, FeatureMapEntry, SubclassEntry, SubclassFeatureClassObj } from "../../codex/entries";
import { getSubclassEntryById, getSubclassEntriesForClass } from "../../codex/subclasses";
import type { Character } from "../../types";

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
  const matchingRow = subclass?.features.find(
    (featureRow) => featureRow.level === level && featureRow.classFeatures.includes(feature)
  );

  if (!matchingRow) {
    return null;
  }

  return matchingRow.featureOverrides?.[feature] ?? null;
}
