import { getSpellFeatureCharacter } from "../multiclass";
import { collectActiveClassFeatureState } from "../classFeatures/modules";
import { getSubclassDerivedFeatureState } from "../classFeatures/subclasses";
import { scaleCantripForCharacter } from "./spellImplementations/cantripScaling";
import type { SpellEntry } from "../../../codex/entries";
import type { Character } from "../../../types";
import type { ClassFeatureDerivedState } from "../classFeatures/types";
import type { SubclassDerivedFeatureState } from "../classFeatures/subclasses";
import { getWizardSpellbookSpellEntry } from "../classFeatures/wizard/wizard";
import { transformFeatSpellEntry, type FeatDerivedState } from "../feats/runtime";
import { getSpeciesSpellEntryForCharacter } from "../species";

export type CharacterSpellEntryTransformer = {
  transformSpellEntry: (spell: SpellEntry) => SpellEntry;
  transformSpellbookSpellEntry: (spell: SpellEntry) => SpellEntry;
};

type CharacterSpellEntryTransformerOptions = {
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "classFeatureState" | "species" | "speciesChoices">>;
  classFeatures: ClassFeatureDerivedState;
  subclassFeatures: SubclassDerivedFeatureState;
  feats: FeatDerivedState;
};

function applySpeciesSpellTransform(
  character: CharacterSpellEntryTransformerOptions["character"],
  spell: SpellEntry
): SpellEntry {
  return character.species
    ? getSpeciesSpellEntryForCharacter(
        {
          species: character.species,
          speciesChoices: character.speciesChoices
        },
        spell
      )
    : spell;
}

export function createCharacterSpellEntryTransformer({
  character,
  classFeatures,
  subclassFeatures,
  feats
}: CharacterSpellEntryTransformerOptions): CharacterSpellEntryTransformer {
  const allClasses = getSpellFeatureCharacter(character);
  if (allClasses !== character) {
    classFeatures = collectActiveClassFeatureState(allClasses);
    subclassFeatures = getSubclassDerivedFeatureState(allClasses);
  }
  const transformSpellEntry = (spell: SpellEntry): SpellEntry => {
    spell = scaleCantripForCharacter(character, spell);
    const classSpellEntry = classFeatures.transformSpellEntry
      ? classFeatures.transformSpellEntry(spell)
      : spell;
    const subclassSpellEntry = subclassFeatures.transformSpellEntry
      ? subclassFeatures.transformSpellEntry(classSpellEntry)
      : classSpellEntry;

    return applySpeciesSpellTransform(
      character,
      transformFeatSpellEntry(feats, subclassSpellEntry)
    );
  };

  const transformSpellbookSpellEntry = (spell: SpellEntry): SpellEntry =>
    applySpeciesSpellTransform(
      character,
      transformFeatSpellEntry(
        feats,
        character.className === "Wizard" ? getWizardSpellbookSpellEntry(character, spell) : spell
      )
    );

  return {
    transformSpellEntry,
    transformSpellbookSpellEntry
  };
}
