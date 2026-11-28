import { hasCharacterClass, getClassSubclassId } from "../../../multiclassState";
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
  arcaneArcherSubclassId,
  getArcaneArcherDerivedFeatureState,
  normalizeArcaneArcherFeatureState
} from "./fighterArcaneArcher";
import { advanceArcaneShotForNewRound } from "./fighterArcaneShot";
import {
  advanceFighterBattleMasterFeaturesForNewRound,
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

export function normalizeFighterSubclassFeatureState(
  value: Partial<CharacterFighterFeatureState>,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Partial<CharacterFighterFeatureState> {
  if (!hasCharacterClass(character, "Fighter") || !getClassSubclassId(character, "Fighter")) {
    return {};
  }

  switch (getClassSubclassId(character, "Fighter")) {
    case arcaneArcherSubclassId:
      return normalizeArcaneArcherFeatureState(value, character);
    case banneretSubclassId:
      return normalizeFighterBanneretFeatureState(value, character);
    case battleMasterSubclassId:
      return normalizeFighterBattleMasterFeatureState(value, character);
    case eldritchKnightSubclassId:
      return normalizeFighterEldritchKnightFeatureState(value, character);
    case psiWarriorSubclassId:
      return normalizeFighterPsiWarriorFeatureState(value, character);
    default:
      return {};
  }
}

export function getFighterSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (!hasCharacterClass(character, "Fighter") || !getClassSubclassId(character, "Fighter")) {
    return {};
  }

  // Subclasses use the shared ability helpers, which also depend on class features.
  const fighterSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
    [arcaneArcherSubclassId]: getArcaneArcherDerivedFeatureState,
    [banneretSubclassId]: getFighterBanneretDerivedFeatureState,
    [battleMasterSubclassId]: getFighterBattleMasterDerivedFeatureState,
    [championSubclassId]: getFighterChampionDerivedFeatureState,
    [eldritchKnightSubclassId]: getFighterEldritchKnightDerivedFeatureState,
    [psiWarriorSubclassId]: getFighterPsiWarriorDerivedFeatureState
  };

  return (
    fighterSubclassRuntimeRegistry[getClassSubclassId(character, "Fighter")]?.(character) ?? {}
  );
}

export function advanceFighterSubclassFeaturesForNewRound(character: Character): Character {
  if (!hasCharacterClass(character, "Fighter") || !getClassSubclassId(character, "Fighter")) {
    return character;
  }

  switch (getClassSubclassId(character, "Fighter")) {
    case arcaneArcherSubclassId:
      return advanceArcaneShotForNewRound(character);
    case battleMasterSubclassId:
      return advanceFighterBattleMasterFeaturesForNewRound(character);
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
