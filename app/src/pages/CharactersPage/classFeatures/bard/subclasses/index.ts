import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  collegeOfDanceSubclassId,
  getBardCollegeOfDanceDerivedFeatureState
} from "./bardCollegeOfDance";
import {
  collegeOfGlamourSubclassId,
  getBardCollegeOfGlamourDerivedFeatureState
} from "./bardCollegeOfGlamour";
import {
  collegeOfLoreSubclassId,
  getBardCollegeOfLoreDerivedFeatureState
} from "./bardCollegeOfLore";
import {
  collegeOfTheMoonSubclassId,
  getBardCollegeOfTheMoonDerivedFeatureState
} from "./bardCollegeOfTheMoon";
import {
  collegeOfValorSubclassId,
  getBardCollegeOfValorDerivedFeatureState
} from "./bardCollegeOfValor";

const bardSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [collegeOfDanceSubclassId]: getBardCollegeOfDanceDerivedFeatureState,
  [collegeOfGlamourSubclassId]: getBardCollegeOfGlamourDerivedFeatureState,
  [collegeOfLoreSubclassId]: getBardCollegeOfLoreDerivedFeatureState,
  [collegeOfTheMoonSubclassId]: getBardCollegeOfTheMoonDerivedFeatureState,
  [collegeOfValorSubclassId]: getBardCollegeOfValorDerivedFeatureState
};

export function getBardSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Bard" || !character.subclassId) {
    return {};
  }

  return bardSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}
