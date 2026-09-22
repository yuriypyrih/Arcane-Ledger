import { hasCharacterClass, getClassSubclassId } from "../../../multiclass";
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

const barbarianSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [pathOfTheBerserkerSubclassId]: getBarbarianPathOfTheBerserkerDerivedFeatureState,
  [pathOfTheWildHeartSubclassId]: getBarbarianPathOfTheWildHeartDerivedFeatureState,
  [pathOfTheWorldTreeSubclassId]: getBarbarianPathOfTheWorldTreeDerivedFeatureState,
  [pathOfTheZealotSubclassId]: getBarbarianPathOfTheZealotDerivedFeatureState
};

export function getBarbarianSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (!hasCharacterClass(character, "Barbarian") || !getClassSubclassId(character, "Barbarian")) {
    return {};
  }

  return (
    barbarianSubclassRuntimeRegistry[getClassSubclassId(character, "Barbarian")]?.(character) ?? {}
  );
}
