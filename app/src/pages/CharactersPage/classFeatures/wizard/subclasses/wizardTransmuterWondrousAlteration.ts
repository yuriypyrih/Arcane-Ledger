import type { SpellEntry } from "../../../../../codex/entries";
import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { Character } from "../../../../../types";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import type { FeatureSpellCastEffectContribution } from "../../../featureContributions";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";

export const alterSelfSpellId = "spell-alter-self";
export const wondrousAlterationFreeCastEffectId = "wizard-transmuter-wondrous-alteration-free-cast";

export function hasWondrousAlteration(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.WONDROUS_ALTERATION) !== null
  );
}

export function normalizeWondrousAlterationUsesExpended(
  value: unknown,
  character: SubclassRuntimeCharacter
): number {
  const expended = Number(value);
  return hasWondrousAlteration(character) && Number.isFinite(expended)
    ? Math.max(0, Math.min(1, Math.floor(expended)))
    : 0;
}

export function getWondrousAlterationUsesRemaining(character: SubclassRuntimeCharacter): number {
  return hasWondrousAlteration(character)
    ? 1 -
        normalizeWondrousAlterationUsesExpended(
          character.classFeatureState?.wizard?.wondrousAlterationUsesExpended,
          character
        )
    : 0;
}

export function canUseWondrousAlterationFreeCast(
  character: SubclassRuntimeCharacter,
  spell: Pick<SpellEntry, "id">
): boolean {
  return spell.id === alterSelfSpellId && getWondrousAlterationUsesRemaining(character) > 0;
}

export function restoreWondrousAlterationOnLongRest(character: Character): Character {
  return hasWondrousAlteration(character) &&
    character.classFeatureState?.wizard?.wondrousAlterationUsesExpended
    ? replaceClassFeatureState(character, "wizard", {
        ...character.classFeatureState?.wizard,
        wondrousAlterationUsesExpended: 0
      })
    : character;
}

export function transformWondrousAlterationSpell(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  const feature = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.WONDROUS_ALTERATION
  );
  return feature && spell.id === alterSelfSpellId
    ? appendFeatureSourcedDescriptionAddition(
        spell,
        character,
        CLASS_FEATURE.WONDROUS_ALTERATION,
        feature.description
      )
    : spell;
}

export function getWondrousAlterationSpellCastEffects(
  character: Character
): FeatureSpellCastEffectContribution[] {
  if (!hasWondrousAlteration(character)) return [];
  return [
    {
      id: wondrousAlterationFreeCastEffectId,
      apply: (current, context) =>
        canUseWondrousAlterationFreeCast(current, context.spell) &&
        context.sourceSpellSlotLevel == null
          ? spendClassResource(
              current,
              {
                stateKey: "wizard",
                counter: "wondrousAlterationUsesExpended",
                total: 1,
                remaining: getWondrousAlterationUsesRemaining(current)
              },
              1
            )
          : current
    }
  ];
}
