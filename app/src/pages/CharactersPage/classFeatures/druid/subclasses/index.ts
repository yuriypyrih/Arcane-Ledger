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
  getCircleOfTheStarsAlwaysPreparedSpellIds,
  getCircleOfTheStarsFeatureActions,
  getCircleOfTheStarsWeaponActions
} from "./druidCircleOfTheStars";

const druidSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [circleOfTheLandSubclassId]: getDruidCircleOfTheLandDerivedFeatureState,
  [circleOfTheMoonSubclassId]: getDruidCircleOfTheMoonDerivedFeatureState,
  [circleOfTheSeaSubclassId]: getDruidCircleOfTheSeaDerivedFeatureState,
  [circleOfTheStarsSubclassId]: (character) => ({
    featureActions: getCircleOfTheStarsFeatureActions(character),
    weaponActions: getCircleOfTheStarsWeaponActions(character),
    alwaysPreparedSpellIds: getCircleOfTheStarsAlwaysPreparedSpellIds(character)
  })
};

export function getDruidSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Druid" || !character.subclassId) {
    return {};
  }

  return druidSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}
