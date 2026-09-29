import {
  activateWarlockFeatureAction,
  advanceWarlockFeaturesForNewRound,
  applyLongRestToWarlockFeatures,
  applyShortRestToWarlockFeatures,
  normalizeWarlockFeatureState
} from "./warlock";
import { getWarlockClassFeatureDerivedState } from "./contributions";
import type { ClassFeatureModule } from "../types";

export const warlockFeatureModule: ClassFeatureModule<"warlock"> = {
  className: "Warlock",
  stateKey: "warlock",
  normalizeState: normalizeWarlockFeatureState,
  collectDerived: getWarlockClassFeatureDerivedState,
  handleAction(character, actionKey) {
    return activateWarlockFeatureAction(character, actionKey);
  },
  applyShortRest: applyShortRestToWarlockFeatures,
  advanceRound: advanceWarlockFeaturesForNewRound,
  applyLongRest: applyLongRestToWarlockFeatures
};
