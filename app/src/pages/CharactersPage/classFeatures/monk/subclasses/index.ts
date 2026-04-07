import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  getMonkWarriorOfMercyDerivedFeatureState,
  warriorOfMercySubclassId
} from "./monkWarriorOfMercy";
import {
  getMonkWarriorOfShadowDerivedFeatureState,
  warriorOfShadowSubclassId
} from "./monkWarriorOfShadow";
import {
  getMonkWarriorOfTheElementsDerivedFeatureState,
  warriorOfTheElementsSubclassId
} from "./monkWarriorOfTheElements";
import {
  getMonkWarriorOfTheOpenHandDerivedFeatureState,
  warriorOfTheOpenHandSubclassId
} from "./monkWarriorOfTheOpenHand";

const monkSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [warriorOfMercySubclassId]: getMonkWarriorOfMercyDerivedFeatureState,
  [warriorOfShadowSubclassId]: getMonkWarriorOfShadowDerivedFeatureState,
  [warriorOfTheElementsSubclassId]: getMonkWarriorOfTheElementsDerivedFeatureState,
  [warriorOfTheOpenHandSubclassId]: getMonkWarriorOfTheOpenHandDerivedFeatureState
};

export function getMonkSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Monk" || !character.subclassId) {
    return {};
  }

  return monkSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}
