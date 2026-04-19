import {
  aquaticAffinityWrathOfTheSeaDescription,
  wrathOfTheSeaDescription
} from "../../../../../codex/subclasses/druid";
import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../../codex/entries";
import type { Character } from "../../../../../types";
import { createSourcedDescriptionEntries } from "../../../actionModalDescriptions";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";

type DruidCircleOfTheSeaDescriptionCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId">>;

const stormbornSource = "Stormborn";
const oceanicGiftSource = "Oceanic Gift";

export function getDruidCircleOfTheSeaWrathOfTheSeaDescription(
  character: DruidCircleOfTheSeaDescriptionCharacter
): SpellDescriptionEntry[] {
  return character.level >= 6
    ? [...aquaticAffinityWrathOfTheSeaDescription]
    : [...wrathOfTheSeaDescription];
}

export function getDruidCircleOfTheSeaWrathOfTheSeaDescriptionAdditions(
  character: DruidCircleOfTheSeaDescriptionCharacter
): SpellDescriptionEntry[][] {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];

  if (character.level >= 10) {
    const stormbornDescription = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.STORMBORN
    );

    if (stormbornDescription.length > 0) {
      descriptionAdditions.push(
        createSourcedDescriptionEntries(stormbornSource, stormbornDescription)
      );
    }
  }

  if (character.level >= 14) {
    const oceanicGiftDescription = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.OCEANIC_GIFT
    );

    if (oceanicGiftDescription.length > 0) {
      descriptionAdditions.push(
        createSourcedDescriptionEntries(oceanicGiftSource, oceanicGiftDescription)
      );
    }
  }

  return descriptionAdditions;
}
