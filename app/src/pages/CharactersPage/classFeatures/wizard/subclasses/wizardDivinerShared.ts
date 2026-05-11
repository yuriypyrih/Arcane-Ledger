import { CLASS_FEATURE } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import { getWizardSavantSpellIdsFromFeatureState } from "../savant";

export const divinerSubclassId = "wizard-diviner";

const divinerSubclassEntry = getSubclassEntryById(divinerSubclassId);

export function hasWizardDivinerFeature(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId">>,
  minimumLevel: number
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === divinerSubclassId &&
    (character.level ?? 0) >= minimumLevel
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
  if (!hasWizardDivinerFeature(character, 3) || typeof character.level !== "number") {
    return [];
  }

  return [
    ...new Set([
      ...(Array.isArray(character.spellbookSpellIds)
        ? character.spellbookSpellIds
            .filter((spellId): spellId is string => typeof spellId === "string")
            .map((spellId) => spellId.trim())
        : []),
      ...getWizardSavantSpellIdsFromFeatureState({
        className: character.className,
        level: character.level,
        subclassId: character.subclassId,
        classFeatureState: character.classFeatureState
      })
    ])
  ];
}
