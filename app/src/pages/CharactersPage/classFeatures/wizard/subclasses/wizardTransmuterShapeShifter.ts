import type { SpellEntry } from "../../../../../codex/entries";
import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { Character } from "../../../../../types";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import type { FeatureSpellCastEffectContribution } from "../../../featureContributions";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";

export const polymorphSpellId = "spell-polymorph";
export const shapeShifterFreeCastEffectId = "wizard-transmuter-shape-shifter-free-cast";

export function hasShapeShifter(character: SubclassRuntimeCharacter): boolean {
  return getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.SHAPE_SHIFTER) !== null;
}

export function normalizeShapeShifterUsesExpended(
  value: unknown,
  character: SubclassRuntimeCharacter
): number {
  const expended = Number(value);
  return hasShapeShifter(character) && Number.isFinite(expended)
    ? Math.max(0, Math.min(1, Math.floor(expended)))
    : 0;
}

export function getShapeShifterUsesRemaining(character: SubclassRuntimeCharacter): number {
  return hasShapeShifter(character)
    ? 1 -
        normalizeShapeShifterUsesExpended(
          character.classFeatureState?.wizard?.shapeShifterUsesExpended,
          character
        )
    : 0;
}

export function canUseShapeShifterFreeCast(
  character: SubclassRuntimeCharacter,
  spell: Pick<SpellEntry, "id">
): boolean {
  return spell.id === polymorphSpellId && getShapeShifterUsesRemaining(character) > 0;
}

export function restoreShapeShifterOnLongRest(character: Character): Character {
  return hasShapeShifter(character) && character.classFeatureState?.wizard?.shapeShifterUsesExpended
    ? replaceClassFeatureState(character, "wizard", {
        ...character.classFeatureState?.wizard,
        shapeShifterUsesExpended: 0
      })
    : character;
}

export function transformShapeShifterSpell(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  const feature = getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.SHAPE_SHIFTER);
  return feature && spell.id === polymorphSpellId
    ? appendFeatureSourcedDescriptionAddition(
        spell,
        character,
        CLASS_FEATURE.SHAPE_SHIFTER,
        feature.description
      )
    : spell;
}

export function getShapeShifterSpellCastEffects(
  character: Character
): FeatureSpellCastEffectContribution[] {
  if (!hasShapeShifter(character)) return [];
  return [
    {
      id: shapeShifterFreeCastEffectId,
      apply: (current, context) =>
        canUseShapeShifterFreeCast(current, context.spell) && context.sourceSpellSlotLevel == null
          ? spendClassResource(
              current,
              {
                stateKey: "wizard",
                counter: "shapeShifterUsesExpended",
                total: 1,
                remaining: getShapeShifterUsesRemaining(current)
              },
              1
            )
          : current
    }
  ];
}
