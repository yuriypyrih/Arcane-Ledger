import {
  blessingOfMoonlightDescription,
  inspiredEclipseDescription,
  shadowOfTheNewMoonDescription
} from "../../../../../codex/subclasses/bard";
import type { SpellEntry } from "../../../../../codex/entries";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { createDefaultFeatureActionDescription } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";

export const collegeOfTheMoonSubclassId = "bard-college-of-the-moon";

const moonbeamSpellId = "spell-moonbeam";

function hasCollegeOfTheMoonMoonsInspiration(
  character: Parameters<SubclassRuntimeResolver>[0]
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfTheMoonSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasCollegeOfTheMoonBlessingOfMoonlight(
  character: Parameters<SubclassRuntimeResolver>[0]
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfTheMoonSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasCollegeOfTheMoonEventidesSplendor(
  character: Parameters<SubclassRuntimeResolver>[0]
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfTheMoonSubclassId &&
    (character.level ?? 0) >= 14
  );
}

function appendInspiredEclipseDescription(
  action: FeatureActionCard,
  includeShadowOfTheNewMoon = false
): FeatureActionCard {
  if (action.key !== "bard-bardic-inspiration") {
    return action;
  }

  const description = action.description?.length
    ? [...action.description]
    : createDefaultFeatureActionDescription(action);
  const extraDescriptionEntries = includeShadowOfTheNewMoon
    ? [...inspiredEclipseDescription, ...shadowOfTheNewMoonDescription]
    : [...inspiredEclipseDescription];

  if (
    description.some(
      (entry) =>
        typeof entry === "string" &&
        extraDescriptionEntries.some((descriptionEntry) => descriptionEntry === entry)
    )
  ) {
    const missingEntries = extraDescriptionEntries.filter(
      (descriptionEntry) =>
        !description.some((entry) => typeof entry === "string" && entry === descriptionEntry)
    );

    return missingEntries.length > 0
      ? {
          ...action,
          description: [...description, ...missingEntries]
        }
      : action;
  }

  return {
    ...action,
    description: [...description, ...extraDescriptionEntries]
  };
}

function appendBlessingOfMoonlightDescription(spell: SpellEntry): SpellEntry {
  if (spell.id !== moonbeamSpellId) {
    return spell;
  }

  const hasBlessingDescription = spell.description.some(
    (entry) =>
      typeof entry === "string" &&
      blessingOfMoonlightDescription.some((descriptionEntry: string) => descriptionEntry === entry)
  );

  if (hasBlessingDescription) {
    return spell;
  }

  return {
    ...spell,
    description: [...spell.description, ...blessingOfMoonlightDescription]
  };
}

export const getBardCollegeOfTheMoonDerivedFeatureState: SubclassRuntimeResolver = (character) => ({
  transformFeatureAction: hasCollegeOfTheMoonMoonsInspiration(character)
    ? (action) =>
        appendInspiredEclipseDescription(action, hasCollegeOfTheMoonEventidesSplendor(character))
    : undefined,
  alwaysPreparedSpellIds:
    character.className === "Bard" &&
    character.subclassId === collegeOfTheMoonSubclassId &&
    (character.level ?? 0) >= 6
      ? [moonbeamSpellId]
      : [],
  transformSpellEntry: hasCollegeOfTheMoonBlessingOfMoonlight(character)
    ? appendBlessingOfMoonlightDescription
    : undefined
});
