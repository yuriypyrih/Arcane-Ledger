import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import { banneretSubclassId, getFighterBanneretDerivedFeatureState } from "./fighterBanneret";
import {
  battleMasterSubclassId,
  getFighterBattleMasterDerivedFeatureState
} from "./fighterBattleMaster";
import { championSubclassId, getFighterChampionDerivedFeatureState } from "./fighterChampion";
import {
  eldritchKnightSubclassId,
  getFighterEldritchKnightDerivedFeatureState
} from "./fighterEldritchKnight";
import { getFighterPsiWarriorDerivedFeatureState, psiWarriorSubclassId } from "./fighterPsiWarrior";

const fighterSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [banneretSubclassId]: getFighterBanneretDerivedFeatureState,
  [battleMasterSubclassId]: getFighterBattleMasterDerivedFeatureState,
  [championSubclassId]: getFighterChampionDerivedFeatureState,
  [eldritchKnightSubclassId]: getFighterEldritchKnightDerivedFeatureState,
  [psiWarriorSubclassId]: getFighterPsiWarriorDerivedFeatureState
};

export function getFighterSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Fighter" || !character.subclassId) {
    return {};
  }

  return fighterSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}
