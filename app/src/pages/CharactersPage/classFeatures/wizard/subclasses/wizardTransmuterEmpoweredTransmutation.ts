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

export const empoweredTransmutationEffectId = "wizard-transmuter-empowered-transmutation";

export function hasEmpoweredTransmutation(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.EMPOWERED_TRANSMUTATION) !==
    null
  );
}

export function supportsEmpoweredTransmutation(
  character: SubclassRuntimeCharacter,
  spell: Pick<SpellEntry, "spellLevel" | "magicSchool" | "isAttackSpell" | "isSavingThrowSpell">
): boolean {
  return (
    hasEmpoweredTransmutation(character) &&
    spell.spellLevel > 0 &&
    spell.magicSchool === MAGIC_SCHOOL.TRANSMUTATION &&
    spell.isAttackSpell !== true &&
    spell.isSavingThrowSpell !== true
  );
}

export function normalizeEmpoweredTransmutationUsesExpended(
  value: unknown,
  character: SubclassRuntimeCharacter
): number {
  const expended = Number(value);
  // Preserve spent uses when a temporary Intelligence change lowers the capacity.
  return hasEmpoweredTransmutation(character) && Number.isFinite(expended)
    ? Math.max(0, Math.floor(expended))
    : 0;
}

export function getEmpoweredTransmutationUsesTotal(character: SubclassRuntimeCharacter): number {
  return hasEmpoweredTransmutation(character)
    ? Math.max(1, getAbilityModifierForCharacter(character, "INT"))
    : 0;
}

export function getEmpoweredTransmutationUsesRemaining(
  character: SubclassRuntimeCharacter
): number {
  return Math.max(
    0,
    getEmpoweredTransmutationUsesTotal(character) -
      normalizeEmpoweredTransmutationUsesExpended(
        character.classFeatureState?.wizard?.empoweredTransmutationUsesExpended,
        character
      )
  );
}

export function restoreEmpoweredTransmutationOnLongRest(character: Character): Character {
  return hasEmpoweredTransmutation(character) &&
    character.classFeatureState?.wizard?.empoweredTransmutationUsesExpended
    ? replaceClassFeatureState(character, "wizard", {
        ...character.classFeatureState?.wizard,
        empoweredTransmutationUsesExpended: 0
      })
    : character;
}

export function transformEmpoweredTransmutationSpell(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  const feature = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.EMPOWERED_TRANSMUTATION
  );
  return feature && supportsEmpoweredTransmutation(character, spell)
    ? appendFeatureSourcedDescriptionAddition(
        spell,
        character,
        CLASS_FEATURE.EMPOWERED_TRANSMUTATION,
        feature.description
      )
    : spell;
}

export function getEmpoweredTransmutationSpellCastEffects(
  character: Character
): FeatureSpellCastEffectContribution[] {
  if (!hasEmpoweredTransmutation(character)) return [];
  return [
    {
      id: empoweredTransmutationEffectId,
      apply: (current, context) => {
        const spell =
          getCharacterCustomSpellSnapshotBySpellId(current, context.spell.id)?.spell ??
          getSpellEntryById(context.spell.id);
        if (
          !spell ||
          !supportsEmpoweredTransmutation(current, spell) ||
          !(context.sourceSpellSlotLevel && context.sourceSpellSlotLevel > 0)
        )
          return current;
        return spendClassResource(
          current,
          {
            stateKey: "wizard",
            counter: "empoweredTransmutationUsesExpended",
            total: getEmpoweredTransmutationUsesTotal(current),
            remaining: getEmpoweredTransmutationUsesRemaining(current)
          },
          1
        );
      }
    }
  ];
}
