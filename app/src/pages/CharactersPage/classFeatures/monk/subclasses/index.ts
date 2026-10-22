import { hasCharacterClass, getClassSubclassId } from "../../../multiclassState";
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
import {
  getMonkWarriorOfTheMysticArtsDerivedFeatureState,
  warriorOfTheMysticArtsSubclassId
} from "./monkWarriorOfTheMysticArts";

const monkSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [warriorOfMercySubclassId]: getMonkWarriorOfMercyDerivedFeatureState,
  [warriorOfShadowSubclassId]: getMonkWarriorOfShadowDerivedFeatureState,
  [warriorOfTheElementsSubclassId]: getMonkWarriorOfTheElementsDerivedFeatureState,
  [warriorOfTheOpenHandSubclassId]: getMonkWarriorOfTheOpenHandDerivedFeatureState,
  [warriorOfTheMysticArtsSubclassId]: getMonkWarriorOfTheMysticArtsDerivedFeatureState
};

export function getMonkSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (!hasCharacterClass(character, "Monk") || !getClassSubclassId(character, "Monk")) {
    return {};
  }

  return monkSubclassRuntimeRegistry[getClassSubclassId(character, "Monk")]?.(character) ?? {};
}
