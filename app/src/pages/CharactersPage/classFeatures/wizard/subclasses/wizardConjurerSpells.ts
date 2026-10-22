import type { SpellEntry } from "../../../../../codex/entries";
import { CLASS_FEATURE, DURATION, MAGIC_SCHOOL } from "../../../../../codex/entries/enums";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { getSpellSummonDefinitionConfig } from "../../../spellSummons";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";

export function isConjurationSummoningSpell(spell: SpellEntry): boolean {
  return (
    spell.magicSchool === MAGIC_SCHOOL.CONJURATION && getSpellSummonDefinitionConfig(spell) !== null
  );
}

export function transformFocusedConjurationSpell(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  if (
    spell.magicSchool !== MAGIC_SCHOOL.CONJURATION ||
    spell.duration[0] !== DURATION.CONCENTRATION
  )
    return spell;
  const feature = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.FOCUSED_CONJURATION
  );
  return feature
    ? appendFeatureSourcedDescriptionAddition(
        spell,
        character,
        CLASS_FEATURE.FOCUSED_CONJURATION,
        feature.description
      )
    : spell;
}
