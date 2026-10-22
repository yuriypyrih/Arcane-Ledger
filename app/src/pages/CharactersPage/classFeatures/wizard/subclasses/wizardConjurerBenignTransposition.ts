import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { Character } from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { createChargesCardUsage, createChargesHeaderTag } from "../../cardUsage";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";

export const benignTranspositionActionKey = "wizard-conjurer-benign-transposition";

export function hasBenignTransposition(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.BENIGN_TRANSPOSITION) !==
    null
  );
}

export function getBenignTranspositionUsesTotal(character: SubclassRuntimeCharacter): number {
  return hasBenignTransposition(character)
    ? Math.max(1, getAbilityModifierForCharacter(character, "INT"))
    : 0;
}

export function normalizeBenignTranspositionUsesExpended(
  value: unknown,
  character: SubclassRuntimeCharacter
): number {
  const expended = Number(value);
  // Preserve spent uses when a temporary Intelligence change lowers the capacity.
  return hasBenignTransposition(character) && Number.isFinite(expended)
    ? Math.max(0, Math.floor(expended))
    : 0;
}

export function getBenignTranspositionUsesRemaining(character: SubclassRuntimeCharacter): number {
  return Math.max(
    0,
    getBenignTranspositionUsesTotal(character) -
      normalizeBenignTranspositionUsesExpended(
        character.classFeatureState?.wizard?.benignTranspositionUsesExpended,
        character
      )
  );
}

export function getBenignTranspositionAction(
  character: SubclassRuntimeCharacter
): FeatureActionCard | null {
  const feature = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.BENIGN_TRANSPOSITION
  );
  if (!feature) return null;
  const usesTotal = getBenignTranspositionUsesTotal(character);
  const usesRemaining = getBenignTranspositionUsesRemaining(character);
  const disabledReason =
    usesRemaining <= 0 ? "Benign Transposition is expended until your next Long Rest." : undefined;
  return {
    key: benignTranspositionActionKey,
    name: feature.name,
    sourceFeature: CLASS_FEATURE.BENIGN_TRANSPOSITION,
    summary: "Teleport or swap places with a willing creature.",
    detail: "Regain all uses after a Long Rest.",
    breakdown: "Teleport up to 30 ft. or swap places",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal,
    cardUsage: createChargesCardUsage(usesRemaining, usesTotal),
    headerTags: [createChargesHeaderTag(usesRemaining, usesTotal)],
    description: feature.description,
    disabled: Boolean(disabledReason),
    disabledReason,
    drawer: { kind: "confirm", blockedReason: disabledReason },
    execute: { kind: "activate" }
  };
}

export function activateBenignTransposition(character: Character): Character {
  return spendClassResource(
    character,
    {
      stateKey: "wizard",
      counter: "benignTranspositionUsesExpended",
      total: getBenignTranspositionUsesTotal(character),
      remaining: getBenignTranspositionUsesRemaining(character)
    },
    1
  );
}

export function restoreBenignTranspositionOnLongRest(character: Character): Character {
  return hasBenignTransposition(character) &&
    character.classFeatureState?.wizard?.benignTranspositionUsesExpended
    ? replaceClassFeatureState(character, "wizard", {
        ...character.classFeatureState?.wizard,
        benignTranspositionUsesExpended: 0
      })
    : character;
}
