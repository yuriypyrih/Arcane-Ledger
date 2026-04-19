import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../codex/entries";
import { createSourcedDescriptionEntries } from "../../actionModalDescriptions";
import {
  type DruidFeatureDescriptionCharacter,
  getDruidFeatureDescription,
  getDruidFeatureDescriptionSections,
  hasDruidFeature
} from "./druidFeatureDescriptionSections";
import { getDruidCircleOfTheMoonWildShapeDescriptionAdditions } from "./subclasses/druidCircleOfTheMoonDescriptions";

const beastSpellsSource = "Beast Spells";
const wildShapeSectionHeadings = [
  "Rules While Shape-Shifted.",
  "Temporary Hit Points.",
  "Game Statistics.",
  "No Spellcasting.",
  "Objects."
] as const;

export function getDruidWildShapeActionDescription(
  character: DruidFeatureDescriptionCharacter
): SpellDescriptionEntry[] {
  return getDruidFeatureDescriptionSections(
    character,
    CLASS_FEATURE.WILD_SHAPE,
    wildShapeSectionHeadings
  );
}

export function getDruidWildShapeActionDescriptionAdditions(
  character: DruidFeatureDescriptionCharacter
): SpellDescriptionEntry[][] {
  const descriptionAdditions = getDruidCircleOfTheMoonWildShapeDescriptionAdditions(character);

  if (hasDruidFeature(character, CLASS_FEATURE.BEAST_SPELLS)) {
    const beastSpellsDescription = getDruidFeatureDescription(
      character,
      CLASS_FEATURE.BEAST_SPELLS
    );

    if (beastSpellsDescription.length > 0) {
      descriptionAdditions.push(
        createSourcedDescriptionEntries(beastSpellsSource, beastSpellsDescription)
      );
    }
  }

  return descriptionAdditions;
}
