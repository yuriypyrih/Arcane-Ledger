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
  if (character.className !== "Barbarian" || !character.subclassId) {
    return {};
  }

  return barbarianSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}
