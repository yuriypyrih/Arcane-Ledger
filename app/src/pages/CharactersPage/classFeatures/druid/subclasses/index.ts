import { hasCharacterClass, getClassSubclassId } from "../../../multiclass";
import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  circleOfTheLandSubclassId,
  getDruidCircleOfTheLandDerivedFeatureState
} from "./druidCircleOfTheLand";
import { getDruidCircleOfTheMoonDerivedFeatureState } from "./druidCircleOfTheMoon";
import { circleOfTheMoonSubclassId } from "./druidCircleOfTheMoonFeatures";
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
  if (!hasCharacterClass(character, "Druid") || !getClassSubclassId(character, "Druid")) {
    return {};
  }

  return druidSubclassRuntimeRegistry[getClassSubclassId(character, "Druid")]?.(character) ?? {};
}
