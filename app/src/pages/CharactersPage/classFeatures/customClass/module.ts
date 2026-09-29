import {
  activateCustomClassFeatureAction,
  advanceCustomClassFeaturesForNewRound,
  getCustomClassClassFeatureDerivedState,
  normalizeCustomClassFeatureState
} from "./customClass";
import type { ClassFeatureModule } from "../types";

export const customClassFeatureModule: ClassFeatureModule<"customClass"> = {
  className: "Custom",
  stateKey: "customClass",
  normalizeState: normalizeCustomClassFeatureState,
  collectDerived: getCustomClassClassFeatureDerivedState,
  handleAction(character, actionKey) {
    return activateCustomClassFeatureAction(character, actionKey);
  },
  advanceRound: advanceCustomClassFeaturesForNewRound
};
