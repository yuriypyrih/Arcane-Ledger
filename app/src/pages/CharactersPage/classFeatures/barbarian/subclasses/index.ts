import { hasCharacterClass, getClassSubclassId } from "../../../multiclassState";
import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  getBarbarianPathOfTheBerserkerDerivedFeatureState,
  pathOfTheBerserkerSubclassId
} from "./barbarianPathOfTheBerserker";
import {
  getBarbarianPathOfTheWildHeartDerivedFeatureState,
  pathOfTheWildHeartSubclassId
} from "./barbarianPathOfTheWildHeart";
import {
  getBarbarianPathOfTheWorldTreeDerivedFeatureState,
  pathOfTheWorldTreeSubclassId
} from "./barbarianPathOfTheWorldTree";
import {
  getBarbarianPathOfTheZealotDerivedFeatureState,
  pathOfTheZealotSubclassId
} from "./barbarianPathOfTheZealot";

export function getBarbarianSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (!hasCharacterClass(character, "Barbarian") || !getClassSubclassId(character, "Barbarian")) {
    return {};
  }

  const barbarianSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
    [pathOfTheBerserkerSubclassId]: getBarbarianPathOfTheBerserkerDerivedFeatureState,
    [pathOfTheWildHeartSubclassId]: getBarbarianPathOfTheWildHeartDerivedFeatureState,
    [pathOfTheWorldTreeSubclassId]: getBarbarianPathOfTheWorldTreeDerivedFeatureState,
    [pathOfTheZealotSubclassId]: getBarbarianPathOfTheZealotDerivedFeatureState
  };

  return (
    barbarianSubclassRuntimeRegistry[getClassSubclassId(character, "Barbarian")]?.(character) ?? {}
  );
}
