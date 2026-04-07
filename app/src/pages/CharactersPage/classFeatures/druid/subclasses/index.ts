import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  circleOfTheLandSubclassId,
  getDruidCircleOfTheLandDerivedFeatureState
} from "./druidCircleOfTheLand";
import {
  circleOfTheMoonSubclassId,
  getDruidCircleOfTheMoonDerivedFeatureState
} from "./druidCircleOfTheMoon";
import {
  circleOfTheSeaSubclassId,
  getDruidCircleOfTheSeaDerivedFeatureState
} from "./druidCircleOfTheSea";
import {
  circleOfTheStarsSubclassId,
  getDruidCircleOfTheStarsDerivedFeatureState
} from "./druidCircleOfTheStars";

const druidSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [circleOfTheLandSubclassId]: getDruidCircleOfTheLandDerivedFeatureState,
  [circleOfTheMoonSubclassId]: getDruidCircleOfTheMoonDerivedFeatureState,
  [circleOfTheSeaSubclassId]: getDruidCircleOfTheSeaDerivedFeatureState,
  [circleOfTheStarsSubclassId]: getDruidCircleOfTheStarsDerivedFeatureState
};

export function getDruidSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Druid" || !character.subclassId) {
    return {};
  }

  return druidSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}
