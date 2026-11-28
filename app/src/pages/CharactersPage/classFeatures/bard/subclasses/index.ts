import { hasCharacterClass, getClassSubclassId } from "../../../multiclassState";
import { collegeOfSpiritsSubclassId } from "./bardCollegeOfSpiritsState";
import { getBardCollegeOfSpiritsDerivedFeatureState } from "./bardCollegeOfSpirits";
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

export function getBardSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (!hasCharacterClass(character, "Bard") || !getClassSubclassId(character, "Bard")) {
    return {};
  }

  const bardSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
    [collegeOfSpiritsSubclassId]: getBardCollegeOfSpiritsDerivedFeatureState,
    [collegeOfDanceSubclassId]: getBardCollegeOfDanceDerivedFeatureState,
    [collegeOfGlamourSubclassId]: getBardCollegeOfGlamourDerivedFeatureState,
    [collegeOfLoreSubclassId]: getBardCollegeOfLoreDerivedFeatureState,
    [collegeOfTheMoonSubclassId]: getBardCollegeOfTheMoonDerivedFeatureState,
    [collegeOfValorSubclassId]: getBardCollegeOfValorDerivedFeatureState
  };

  return bardSubclassRuntimeRegistry[getClassSubclassId(character, "Bard")]?.(character) ?? {};
}
