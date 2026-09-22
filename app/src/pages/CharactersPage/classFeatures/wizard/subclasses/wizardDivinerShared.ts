import {
  hasCharacterClass,
  getClassLevel,
  getClassSpellbookIds,
  getClassSubclassId
} from "../../../multiclass";
import { CLASS_FEATURE } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import { getWizardSavantSpellIdsFromFeatureState } from "../savant";

export const divinerSubclassId = "wizard-diviner";

const divinerSubclassEntry = getSubclassEntryById(divinerSubclassId);

export function hasWizardDivinerFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  minimumLevel: number
): boolean {
  return (
    hasCharacterClass(character, "Wizard") &&
    getClassSubclassId(character, "Wizard") === divinerSubclassId &&
    (getClassLevel(character, "Wizard") ?? 0) >= minimumLevel
  );
}

export function getWizardDivinerFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = divinerSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

export function getWizardDivinerSpellbookSpellIds(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "spellbookSpellIds" | "classFeatureState">>
): string[] {
  if (
    !hasWizardDivinerFeature(character, 3) ||
    typeof getClassLevel(character, "Wizard") !== "number"
  ) {
    return [];
  }

  return [
    ...new Set([
      ...(Array.isArray(getClassSpellbookIds(character, "Wizard"))
        ? getClassSpellbookIds(character, "Wizard")
            .filter((spellId): spellId is string => typeof spellId === "string")
            .map((spellId) => spellId.trim())
        : []),
      ...getWizardSavantSpellIdsFromFeatureState({
        className: "Wizard",
        level: getClassLevel(character, "Wizard"),
        subclassId: getClassSubclassId(character, "Wizard"),
        classFeatureState: character.classFeatureState
      })
    ])
  ];
}
