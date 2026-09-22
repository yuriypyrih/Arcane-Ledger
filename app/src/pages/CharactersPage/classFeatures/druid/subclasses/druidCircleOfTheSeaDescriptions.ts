import { getClassLevel } from "../../../multiclass";
import {
  aquaticAffinityWrathOfTheSeaDescription,
  wrathOfTheSeaDescription
} from "../../../../../codex/subclasses/druid";
import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../../codex/entries";
import type { Character } from "../../../../../types";
import { createFeatureSourcedDescriptionEntries } from "../../../actionModalDescriptions";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";

type DruidCircleOfTheSeaDescriptionCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId">>;

const stormbornSource = "Stormborn";
const oceanicGiftSource = "Oceanic Gift";

export function getDruidCircleOfTheSeaWrathOfTheSeaDescription(
  character: DruidCircleOfTheSeaDescriptionCharacter
): SpellDescriptionEntry[] {
  return getClassLevel(character, "Druid") >= 6
    ? [...aquaticAffinityWrathOfTheSeaDescription]
    : [...wrathOfTheSeaDescription];
}

export function getDruidCircleOfTheSeaWrathOfTheSeaDescriptionAdditions(
  character: DruidCircleOfTheSeaDescriptionCharacter
): SpellDescriptionEntry[][] {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];

  if (getClassLevel(character, "Druid") >= 10) {
    const stormbornDescription = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.STORMBORN
    );

    if (stormbornDescription.length > 0) {
      descriptionAdditions.push(
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.STORMBORN,
          stormbornDescription,
          stormbornSource
        )
      );
    }
  }

  if (getClassLevel(character, "Druid") >= 14) {
    const oceanicGiftDescription = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.OCEANIC_GIFT
    );

    if (oceanicGiftDescription.length > 0) {
      descriptionAdditions.push(
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.OCEANIC_GIFT,
          oceanicGiftDescription,
          oceanicGiftSource
        )
      );
    }
  }

  return descriptionAdditions;
}
