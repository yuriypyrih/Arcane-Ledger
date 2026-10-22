import { getSpellEntryById, type SpellEntry } from "../../../../../codex/entries";
import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { Character } from "../../../../../types";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { getCharacterCustomSpellSnapshotBySpellId } from "../../../customSpells";
import type { FeatureSpellCastEffectContribution } from "../../../featureContributions";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import { isConjurationSummoningSpell } from "./wizardConjurerSpells";

export const splinteredSummonsEffectId = "wizard-conjurer-splintered-summons";

export function hasSplinteredSummons(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.SPLINTERED_SUMMONS) !== null
  );
}

export function supportsSplinteredSummons(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): boolean {
  return isConjurationSummoningSpell(spell) && hasSplinteredSummons(character);
}

export function normalizeSplinteredSummonsUsesExpended(
  value: unknown,
  character: SubclassRuntimeCharacter
): number {
  const expended = Number(value);
  return hasSplinteredSummons(character) && Number.isFinite(expended)
    ? Math.max(0, Math.min(1, Math.floor(expended)))
    : 0;
}

export function getSplinteredSummonsUsesRemaining(character: SubclassRuntimeCharacter): number {
  return hasSplinteredSummons(character)
    ? 1 -
        normalizeSplinteredSummonsUsesExpended(
          character.classFeatureState?.wizard?.splinteredSummonsUsesExpended,
          character
        )
    : 0;
}

export function restoreSplinteredSummonsOnLongRest(character: Character): Character {
  return hasSplinteredSummons(character) &&
    character.classFeatureState?.wizard?.splinteredSummonsUsesExpended
    ? replaceClassFeatureState(character, "wizard", {
        ...character.classFeatureState?.wizard,
        splinteredSummonsUsesExpended: 0
      })
    : character;
}

export function transformSplinteredSummonsSpell(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  const feature = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.SPLINTERED_SUMMONS
  );
  return feature && isConjurationSummoningSpell(spell)
    ? appendFeatureSourcedDescriptionAddition(
        spell,
        character,
        CLASS_FEATURE.SPLINTERED_SUMMONS,
        feature.description
      )
    : spell;
}

export function getSplinteredSummonsSpellCastEffects(
  character: Character
): FeatureSpellCastEffectContribution[] {
  if (!hasSplinteredSummons(character)) return [];
  return [
    {
      id: splinteredSummonsEffectId,
      apply: (current, context) => {
        const spell =
          getCharacterCustomSpellSnapshotBySpellId(current, context.spell.id)?.spell ??
          getSpellEntryById(context.spell.id);
        if (
          !spell ||
          !supportsSplinteredSummons(current, spell) ||
          !(context.sourceSpellSlotLevel && context.sourceSpellSlotLevel > 0)
        )
          return current;
        return spendClassResource(
          current,
          {
            stateKey: "wizard",
            counter: "splinteredSummonsUsesExpended",
            total: 1,
            remaining: getSplinteredSummonsUsesRemaining(current)
          },
          1
        );
      }
    }
  ];
}
