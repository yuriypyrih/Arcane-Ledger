import type { Character, CharacterFighterFeatureState } from "../../../../../types";
import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  banneretSubclassId,
  getFighterBanneretDerivedFeatureState,
  normalizeFighterBanneretFeatureState
} from "./fighterBanneret";
import {
  battleMasterSubclassId,
  getFighterBattleMasterDerivedFeatureState,
  normalizeFighterBattleMasterFeatureState
} from "./fighterBattleMaster";
import {
  advanceFighterChampionFeaturesForNewRound,
  championSubclassId,
  getFighterChampionDerivedFeatureState
} from "./fighterChampion";
import {
  advanceFighterEldritchKnightFeaturesForNewRound,
  eldritchKnightSubclassId,
  getFighterEldritchKnightDerivedFeatureState,
  normalizeFighterEldritchKnightFeatureState
} from "./fighterEldritchKnight";
import {
  advanceFighterPsiWarriorFeaturesForNewRound,
  getFighterPsiWarriorDerivedFeatureState,
  normalizeFighterPsiWarriorFeatureState,
  psiWarriorSubclassId
} from "./fighterPsiWarrior";

const fighterSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [banneretSubclassId]: getFighterBanneretDerivedFeatureState,
  [battleMasterSubclassId]: getFighterBattleMasterDerivedFeatureState,
  [championSubclassId]: getFighterChampionDerivedFeatureState,
  [eldritchKnightSubclassId]: getFighterEldritchKnightDerivedFeatureState,
  [psiWarriorSubclassId]: getFighterPsiWarriorDerivedFeatureState
};

const fighterSubclassStateNormalizers: Record<
  string,
  (
    value: Partial<CharacterFighterFeatureState>,
    character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
  ) => Partial<CharacterFighterFeatureState>
> = {
  [banneretSubclassId]: normalizeFighterBanneretFeatureState,
  [battleMasterSubclassId]: normalizeFighterBattleMasterFeatureState,
  [eldritchKnightSubclassId]: normalizeFighterEldritchKnightFeatureState,
  [psiWarriorSubclassId]: normalizeFighterPsiWarriorFeatureState
};

export function normalizeFighterSubclassFeatureState(
  value: Partial<CharacterFighterFeatureState>,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Partial<CharacterFighterFeatureState> {
  if (character.className !== "Fighter" || !character.subclassId) {
    return {};
  }

  return fighterSubclassStateNormalizers[character.subclassId]?.(value, character) ?? {};
}

export function getFighterSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Fighter" || !character.subclassId) {
    return {};
  }

  return fighterSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}

export function advanceFighterSubclassFeaturesForNewRound(character: Character): Character {
  if (character.className !== "Fighter" || !character.subclassId) {
    return character;
  }

  switch (character.subclassId) {
    case championSubclassId:
      return advanceFighterChampionFeaturesForNewRound(character);
    case eldritchKnightSubclassId:
      return advanceFighterEldritchKnightFeaturesForNewRound(character);
    case psiWarriorSubclassId:
      return advanceFighterPsiWarriorFeaturesForNewRound(character);
    default:
      return character;
  }
}
