import { getSpellEntryById, type SpellEntry } from "../../../../../codex/entries";
import { CLASS_FEATURE, MAGIC_SCHOOL } from "../../../../../codex/entries/enums";
import type { Character } from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { getCharacterCustomSpellSnapshotBySpellId } from "../../../customSpells";
import type { FeatureSpellCastEffectContribution } from "../../../featureContributions";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";

export const splitEnchantmentEffectId = "wizard-enchanter-split-enchantment";

export function hasSplitEnchantment(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.SPLIT_ENCHANTMENT) !== null
  );
}

export function supportsSplitEnchantment(
  character: SubclassRuntimeCharacter,
  spell: Pick<SpellEntry, "magicSchool">
): boolean {
  return hasSplitEnchantment(character) && spell.magicSchool === MAGIC_SCHOOL.ENCHANTMENT;
}

export function getSplitEnchantmentUsesTotal(character: SubclassRuntimeCharacter): number {
  return hasSplitEnchantment(character)
    ? Math.max(0, getAbilityModifierForCharacter(character, "INT"))
    : 0;
}

export function normalizeSplitEnchantmentUsesExpended(
  value: unknown,
  character: SubclassRuntimeCharacter
): number {
  const expended = Number(value);
  // Preserve spent uses when a temporary Intelligence change lowers the capacity.
  return hasSplitEnchantment(character) && Number.isFinite(expended)
    ? Math.max(0, Math.floor(expended))
    : 0;
}

export function getSplitEnchantmentUsesRemaining(character: SubclassRuntimeCharacter): number {
  return Math.max(
    0,
    getSplitEnchantmentUsesTotal(character) -
      normalizeSplitEnchantmentUsesExpended(
        character.classFeatureState?.wizard?.splitEnchantmentUsesExpended,
        character
      )
  );
}

export function restoreSplitEnchantmentOnLongRest(character: Character): Character {
  return hasSplitEnchantment(character) &&
    character.classFeatureState?.wizard?.splitEnchantmentUsesExpended
    ? replaceClassFeatureState(character, "wizard", {
        ...character.classFeatureState?.wizard,
        splitEnchantmentUsesExpended: 0
      })
    : character;
}

export function transformSplitEnchantmentSpell(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  const feature = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.SPLIT_ENCHANTMENT
  );
  return feature && supportsSplitEnchantment(character, spell)
    ? appendFeatureSourcedDescriptionAddition(
        spell,
        character,
        CLASS_FEATURE.SPLIT_ENCHANTMENT,
        feature.description
      )
    : spell;
}

export function getSplitEnchantmentSpellCastEffects(
  character: Character
): FeatureSpellCastEffectContribution[] {
  if (!hasSplitEnchantment(character)) return [];
  return [
    {
      id: splitEnchantmentEffectId,
      apply: (current, context) => {
        const spell =
          getCharacterCustomSpellSnapshotBySpellId(current, context.spell.id)?.spell ??
          getSpellEntryById(context.spell.id);
        if (
          !spell ||
          !supportsSplitEnchantment(current, spell) ||
          !(context.sourceSpellSlotLevel && context.sourceSpellSlotLevel > 0)
        )
          return current;
        return spendClassResource(
          current,
          {
            stateKey: "wizard",
            counter: "splitEnchantmentUsesExpended",
            total: getSplitEnchantmentUsesTotal(current),
            remaining: getSplitEnchantmentUsesRemaining(current)
          },
          1
        );
      }
    }
  ];
}
