import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../../codex/entries";
import { createFeatureSourcedDescriptionEntries } from "../../../actionModalDescriptions";
import {
  type DruidFeatureDescriptionCharacter,
  getDruidFeatureDescription,
  getDruidFeatureDescriptionSection
} from "../druidFeatureDescriptionSections";
import {
  hasDruidImprovedCircleFormsFeature,
  hasDruidLunarFormFeature
} from "./druidCircleOfTheMoonFeatures";

const improvedCircleFormsSource = "Improved Circle Forms";
const lunarFormImprovedLunarRadianceSource = "Lunar Form / Improved Lunar Radiance";
const lunarFormSharedMoonlightSource = "Lunar Form / Shared Moonlight";
const improvedLunarRadianceHeading = "Improved Lunar Radiance.";
const sharedMoonlightHeading = "Shared Moonlight.";

export function getDruidCircleOfTheMoonWildShapeDescriptionAdditions(
  character: DruidFeatureDescriptionCharacter
): SpellDescriptionEntry[][] {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];

  if (hasDruidImprovedCircleFormsFeature(character)) {
    const improvedCircleFormsDescription = getDruidFeatureDescription(
      character,
      CLASS_FEATURE.IMPROVED_CIRCLE_FORMS
    );

    if (improvedCircleFormsDescription.length > 0) {
      descriptionAdditions.push(
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.IMPROVED_CIRCLE_FORMS,
          improvedCircleFormsDescription,
          improvedCircleFormsSource
        )
      );
    }
  }

  if (hasDruidLunarFormFeature(character)) {
    const improvedLunarRadianceDescription = getDruidFeatureDescriptionSection(
      character,
      CLASS_FEATURE.LUNAR_FORM,
      improvedLunarRadianceHeading,
      { stripHeading: true }
    );

    if (improvedLunarRadianceDescription.length > 0) {
      descriptionAdditions.push(
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.LUNAR_FORM,
          improvedLunarRadianceDescription,
          lunarFormImprovedLunarRadianceSource
        )
      );
    }
  }

  return descriptionAdditions;
}

export function getDruidCircleOfTheMoonMoonlightStepDescriptionAdditions(
  character: DruidFeatureDescriptionCharacter
): SpellDescriptionEntry[][] {
  if (!hasDruidLunarFormFeature(character)) {
    return [];
  }

  const sharedMoonlightDescription = getDruidFeatureDescriptionSection(
    character,
    CLASS_FEATURE.LUNAR_FORM,
    sharedMoonlightHeading,
    { stripHeading: true }
  );

  return sharedMoonlightDescription.length > 0
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.LUNAR_FORM,
          sharedMoonlightDescription,
          lunarFormSharedMoonlightSource
        )
      ]
    : [];
}
