import { hasCharacterClass } from "../multiclassState";
import { getSpellRuntimeCharacter } from "./classContexts";
import { collectActiveClassFeatureState } from "../classFeatures/modules";
import { getSubclassDerivedFeatureState } from "../classFeatures/subclasses";
import { scaleCantripForCharacter } from "./spellImplementations/cantripScaling";
import type { SpellEntry } from "../../../codex/entries";
import type { Character } from "../../../types";
import type { ClassFeatureDerivedState } from "../classFeatures/types";
import type { SubclassDerivedFeatureState } from "../classFeatures/subclasses";
import { getWizardSpellbookSpellEntry } from "../classFeatures/wizard/wizard";
import { collectFeatDerivedState } from "../feats/runtime/state";
import { transformFeatSpellEntry } from "../feats/runtime/spellcasting";
import type { FeatDerivedState } from "../feats/runtime/types";
import { getSpeciesSpellEntryForCharacter } from "../species";

export type CharacterSpellEntryTransformer = {
  transformSpellEntry: (spell: SpellEntry) => SpellEntry;
  transformSpellbookSpellEntry: (spell: SpellEntry) => SpellEntry;
};

type CharacterSpellEntryTransformerOptions = {
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "classFeatureState" | "species" | "speciesChoices">>;
  classFeatures?: ClassFeatureDerivedState;
  subclassFeatures?: SubclassDerivedFeatureState;
  feats?: FeatDerivedState;
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
  const allClasses = getSpellRuntimeCharacter(character);
  if (allClasses !== character) {
    classFeatures = undefined;
    subclassFeatures = undefined;
  }
  const spellCache = new WeakMap<SpellEntry, SpellEntry>();
  const spellbookCache = new WeakMap<SpellEntry, SpellEntry>();
  const transformSpellEntry = (original: SpellEntry): SpellEntry => {
    const cached = spellCache.get(original);
    if (cached) return cached;
    classFeatures ??= collectActiveClassFeatureState(allClasses);
    subclassFeatures ??= getSubclassDerivedFeatureState(allClasses);
    feats ??= collectFeatDerivedState(character);
    let spell = original;
    spell = scaleCantripForCharacter(character, spell);
    const classSpellEntry = classFeatures.transformSpellEntry
      ? classFeatures.transformSpellEntry(spell)
      : spell;
    const subclassSpellEntry = subclassFeatures.transformSpellEntry
      ? subclassFeatures.transformSpellEntry(classSpellEntry)
      : classSpellEntry;

    const result = applySpeciesSpellTransform(
      character,
      transformFeatSpellEntry(feats, subclassSpellEntry)
    );
    spellCache.set(original, result);
    return result;
  };

  const transformSpellbookSpellEntry = (spell: SpellEntry): SpellEntry => {
    const cached = spellbookCache.get(spell);
    if (cached) return cached;
    feats ??= collectFeatDerivedState(character);
    const result = applySpeciesSpellTransform(
      character,
      transformFeatSpellEntry(
        feats,
        hasCharacterClass(character, "Wizard")
          ? getWizardSpellbookSpellEntry(character, spell)
          : spell
      )
    );
    spellbookCache.set(spell, result);
    return result;
  };

  return {
    transformSpellEntry,
    transformSpellbookSpellEntry
  };
}

const transformers = new WeakMap<object, CharacterSpellEntryTransformer>();

export function getCharacterSpellEntryTransformer(
  character: CharacterSpellEntryTransformerOptions["character"]
): CharacterSpellEntryTransformer {
  const cached = transformers.get(character);
  if (cached) return cached;
  const transformer = createCharacterSpellEntryTransformer({ character });
  transformers.set(character, transformer);
  return transformer;
}
