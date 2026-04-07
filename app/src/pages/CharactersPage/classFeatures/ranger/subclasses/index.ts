import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import { beastMasterSubclassId, getRangerBeastMasterDerivedFeatureState } from "./rangerBeastMaster";
import {
  feyWandererSubclassId,
  getRangerFeyWandererDerivedFeatureState
} from "./rangerFeyWanderer";
import {
  getRangerGloomStalkerDerivedFeatureState,
  gloomStalkerSubclassId
} from "./rangerGloomStalker";
import { getRangerHunterDerivedFeatureState, hunterSubclassId } from "./rangerHunter";
import {
  getRangerWinterWalkerDerivedFeatureState,
  winterWalkerSubclassId
} from "./rangerWinterWalker";

const rangerSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [beastMasterSubclassId]: getRangerBeastMasterDerivedFeatureState,
  [feyWandererSubclassId]: getRangerFeyWandererDerivedFeatureState,
  [gloomStalkerSubclassId]: getRangerGloomStalkerDerivedFeatureState,
  [hunterSubclassId]: getRangerHunterDerivedFeatureState,
  [winterWalkerSubclassId]: getRangerWinterWalkerDerivedFeatureState
};

export function getRangerSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Ranger" || !character.subclassId) {
    return {};
  }

  return rangerSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}
