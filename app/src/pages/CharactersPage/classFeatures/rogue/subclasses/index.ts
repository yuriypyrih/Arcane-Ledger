import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  arcaneTricksterSubclassId,
  getRogueArcaneTricksterDerivedFeatureState
} from "./rogueArcaneTrickster";
import { assassinSubclassId, getRogueAssassinDerivedFeatureState } from "./rogueAssassin";
import {
  getRogueScionOfTheThreeDerivedFeatureState,
  scionOfTheThreeSubclassId
} from "./rogueScionOfTheThree";
import { getRogueSoulknifeDerivedFeatureState, soulknifeSubclassId } from "./rogueSoulknife";
import { getRogueThiefDerivedFeatureState, thiefSubclassId } from "./rogueThief";

const rogueSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [arcaneTricksterSubclassId]: getRogueArcaneTricksterDerivedFeatureState,
  [assassinSubclassId]: getRogueAssassinDerivedFeatureState,
  [scionOfTheThreeSubclassId]: getRogueScionOfTheThreeDerivedFeatureState,
  [soulknifeSubclassId]: getRogueSoulknifeDerivedFeatureState,
  [thiefSubclassId]: getRogueThiefDerivedFeatureState
};

export function getRogueSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Rogue" || !character.subclassId) {
    return {};
  }

  return rogueSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}
