import { FEATS } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { isCharacterBloodied } from "../../bloodied";
import type { FeatureIndicator } from "../../classFeatures/types";
import { collectFeatDerivedState } from "./state";

const purpleDragonCommandantLastStandIndicator: FeatureIndicator = {
  label: "Last Stand",
  tone: "advantage",
  source: "Purple Dragon Commandant"
};

export function getFeatAttackRollIndicatorsForCharacter(
  character: Pick<Character, "className" | "statusEntries"> &
    Partial<
      Pick<
        Character,
        | "currentHitPoints"
        | "customSpecies"
        | "feats"
        | "hitPoints"
        | "inventoryItems"
        | "level"
        | "species"
        | "subclassId"
      >
    >
): FeatureIndicator[] {
  if (
    typeof character.level !== "number" ||
    !collectFeatDerivedState({
      level: character.level,
      feats: character.feats
    }).featSet.has(FEATS.PURPLE_DRAGON_COMMANDANT) ||
    !isCharacterBloodied(character)
  ) {
    return [];
  }

  return [purpleDragonCommandantLastStandIndicator];
}

export function getFeatWeaponAttackIndicatorsForCharacter(
  character: Parameters<typeof getFeatAttackRollIndicatorsForCharacter>[0]
): FeatureIndicator[] {
  return getFeatAttackRollIndicatorsForCharacter(character);
}
