import { ABILITY_TYPES, CLASS_FEATURE, SPELL_LIST_CLASS } from "../../../../../codex/entries/enums";
import type { Character } from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getSpellSaveFormulaCell } from "../../../shared/spellFormulas";
import { createChargesCardUsage, createChargesHeaderTag } from "../../cardUsage";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";

export const hypnoticPresenceActionKey = "wizard-enchanter-hypnotic-presence";

export function hasHypnoticPresence(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.HYPNOTIC_PRESENCE) !== null
  );
}

export function getHypnoticPresenceUsesTotal(character: SubclassRuntimeCharacter): number {
  return hasHypnoticPresence(character)
    ? Math.max(1, getAbilityModifierForCharacter(character, "INT"))
    : 0;
}

export function normalizeHypnoticPresenceUsesExpended(
  value: unknown,
  character: SubclassRuntimeCharacter
): number {
  const expended = Number(value);
  // Keep spent uses when a temporary Intelligence change lowers the capacity.
  return hasHypnoticPresence(character) && Number.isFinite(expended)
    ? Math.max(0, Math.floor(expended))
    : 0;
}

export function getHypnoticPresenceUsesRemaining(character: SubclassRuntimeCharacter): number {
  return Math.max(
    0,
    getHypnoticPresenceUsesTotal(character) -
      normalizeHypnoticPresenceUsesExpended(
        character.classFeatureState?.wizard?.hypnoticPresenceUsesExpended,
        character
      )
  );
}

export function getHypnoticPresenceAction(
  character: SubclassRuntimeCharacter
): FeatureActionCard | null {
  const feature = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.HYPNOTIC_PRESENCE
  );
  if (!feature) return null;
  const usesTotal = getHypnoticPresenceUsesTotal(character);
  const usesRemaining = getHypnoticPresenceUsesRemaining(character);
  const disabledReason =
    usesRemaining <= 0 ? "Hypnotic Presence is expended until your next Long Rest." : undefined;
  const formula = getSpellSaveFormulaCell(
    {
      isSavingThrowSpell: true,
      savingThrowAbility: ABILITY_TYPES.WIS,
      spellLists: [SPELL_LIST_CLASS.WIZARD]
    },
    character as Character,
    "INT"
  );
  return {
    key: hypnoticPresenceActionKey,
    name: feature.name,
    sourceFeature: CLASS_FEATURE.HYPNOTIC_PRESENCE,
    summary: "Charm a creature within 10 feet.",
    detail: "Regain all uses after a Long Rest.",
    breakdown: "Charm a creature | 1 minute",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining,
    usesTotal,
    cardUsage: createChargesCardUsage(usesRemaining, usesTotal),
    headerTags: [createChargesHeaderTag(usesRemaining, usesTotal)],
    description: feature.description,
    facts: formula
      ? [
          {
            label: formula.label,
            value: formula.content,
            breakdown: formula.breakdown,
            fullWidth: true
          }
        ]
      : [],
    disabled: Boolean(disabledReason),
    disabledReason,
    drawer: { kind: "confirm", blockedReason: disabledReason },
    execute: { kind: "activate" }
  };
}

export function activateHypnoticPresence(character: Character): Character {
  return spendClassResource(
    character,
    {
      stateKey: "wizard",
      counter: "hypnoticPresenceUsesExpended",
      total: getHypnoticPresenceUsesTotal(character),
      remaining: getHypnoticPresenceUsesRemaining(character)
    },
    1
  );
}

export function restoreHypnoticPresenceOnLongRest(character: Character): Character {
  return hasHypnoticPresence(character) &&
    character.classFeatureState?.wizard?.hypnoticPresenceUsesExpended
    ? replaceClassFeatureState(character, "wizard", {
        ...character.classFeatureState?.wizard,
        hypnoticPresenceUsesExpended: 0
      })
    : character;
}
