import {
  activateSorcererFeatureAction,
  activateSorcererFeatureActionOption,
  activateSorcererFeatureActionOptions,
  advanceSorcererFeaturesForNewRound,
  applyLongRestToSorcererFeatures,
  applyShortRestToSorcererFeatures,
  normalizeSorcererFeatureState
} from "./sorcerer";
import { getSorcererClassFeatureDerivedState } from "./contributions";
import type { ClassFeatureModule } from "../types";

export const sorcererFeatureModule: ClassFeatureModule<"sorcerer"> = {
  className: "Sorcerer",
  stateKey: "sorcerer",
  normalizeState: normalizeSorcererFeatureState,
  collectDerived: getSorcererClassFeatureDerivedState,
  handleAction(character, actionKey) {
    return activateSorcererFeatureAction(character, actionKey);
  },
  handleActionOption(character, actionKey, optionKey) {
    return activateSorcererFeatureActionOption(character, actionKey, optionKey);
  },
  handleActionOptions(character, actionKey, optionKeys) {
    return activateSorcererFeatureActionOptions(character, actionKey, optionKeys);
  },
  applyShortRest: applyShortRestToSorcererFeatures,
  applyLongRest: applyLongRestToSorcererFeatures,
  advanceRound: advanceSorcererFeaturesForNewRound
};
