import type { SpellEntry } from "../../../../../codex/entries";
import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { Character } from "../../../../../types";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import type { FeatureSpellCastEffectContribution } from "../../../featureContributions";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";

export const animateDeadSpellId = "spell-animate-dead";
export const undeadThrallsFreeCastEffectId = "wizard-necromancer-undead-thralls-free-cast";

export function hasUndeadThralls(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.UNDEAD_THRALLS) !== null
  );
}

export function normalizeUndeadThrallsUsesExpended(
  value: unknown,
  character: SubclassRuntimeCharacter
): number {
  const expended = Number(value);
  return hasUndeadThralls(character) && Number.isFinite(expended)
    ? Math.max(0, Math.min(1, Math.floor(expended)))
    : 0;
}

export function getUndeadThrallsUsesRemaining(character: SubclassRuntimeCharacter): number {
  return hasUndeadThralls(character)
    ? 1 -
        normalizeUndeadThrallsUsesExpended(
          character.classFeatureState?.wizard?.undeadThrallsUsesExpended,
          character
        )
    : 0;
}

export function canUseUndeadThrallsFreeCast(
  character: SubclassRuntimeCharacter,
  spell: Pick<SpellEntry, "id">
): boolean {
  return spell.id === animateDeadSpellId && getUndeadThrallsUsesRemaining(character) > 0;
}

export function restoreUndeadThrallsOnLongRest(character: Character): Character {
  return hasUndeadThralls(character) &&
    character.classFeatureState?.wizard?.undeadThrallsUsesExpended
    ? replaceClassFeatureState(character, "wizard", {
        ...character.classFeatureState?.wizard,
        undeadThrallsUsesExpended: 0
      })
    : character;
}

export function transformUndeadThrallsSpell(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  const feature = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.UNDEAD_THRALLS
  );
  return feature && spell.id === animateDeadSpellId
    ? appendFeatureSourcedDescriptionAddition(
        spell,
        character,
        CLASS_FEATURE.UNDEAD_THRALLS,
        feature.description
      )
    : spell;
}

export function getUndeadThrallsSpellCastEffects(
  character: Character
): FeatureSpellCastEffectContribution[] {
  if (!hasUndeadThralls(character)) return [];
  return [
    {
      id: undeadThrallsFreeCastEffectId,
      apply: (current, context) =>
        canUseUndeadThrallsFreeCast(current, context.spell) && context.sourceSpellSlotLevel == null
          ? spendClassResource(
              current,
              {
                stateKey: "wizard",
                counter: "undeadThrallsUsesExpended",
                total: 1,
                remaining: getUndeadThrallsUsesRemaining(current)
              },
              1
            )
          : current
    }
  ];
}
