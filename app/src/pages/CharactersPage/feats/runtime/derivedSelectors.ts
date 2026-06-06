import type {
  ArmorClassFeatureContext,
  FeatureArmorClassBonus
} from "../../classFeatures/types";
import { collectFeatDerivedState } from "./state";
import type { FeatDerivedState, FeatRuntimeCharacter } from "./types";

export function getFeatAbilityScoreBonusesForCharacter(
  character: FeatRuntimeCharacter
): FeatDerivedState["abilityScoreBonuses"] {
  return collectFeatDerivedState(character).abilityScoreBonuses;
}

export function getFeatSpeedBonusesForCharacter(
  character: FeatRuntimeCharacter
): FeatDerivedState["speedBonuses"] {
  return collectFeatDerivedState(character).speedBonuses;
}

export function getFeatHitPointMaximumBonusForCharacter(character: FeatRuntimeCharacter): number {
  return collectFeatDerivedState(character).hitPointMaximumBonus;
}

export function getFeatArmorClassBonusesForCharacter(
  character: FeatRuntimeCharacter,
  context: ArmorClassFeatureContext
): FeatureArmorClassBonus[] {
  if (!context.hasWornBodyArmor || !collectFeatDerivedState(character).hasDefenseFightingStyle) {
    return [];
  }

  return [
    {
      label: "Defense",
      value: 1
    }
  ];
}

export function getFeatDerivedStatusEntriesForCharacter(
  character: FeatRuntimeCharacter
): FeatDerivedState["derivedStatusEntries"] {
  return collectFeatDerivedState(character).derivedStatusEntries;
}
