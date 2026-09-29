import {
  activateBardicInspiration,
  activateBardCollegeOfTheMoonLunarVitality,
  advanceBardFeaturesForNewRound,
  activateMantleOfInspiration,
  activateUnbreakableMajesty,
  applyLongRestToBardFeatures,
  applyShortRestToBardFeatures,
  bardicInspirationActionKey,
  mantleOfInspirationActionKey,
  lunarVitalityActionKey,
  unbreakableMajestyActionKey,
  normalizeBardFeatureState
} from "./bard";
import { getBardClassFeatureDerivedState } from "./contributions";
import type { ClassFeatureModule } from "../types";

export const bardFeatureModule: ClassFeatureModule<"bard"> = {
  className: "Bard",
  stateKey: "bard",
  normalizeState: normalizeBardFeatureState,
  collectDerived(character) {
    return getBardClassFeatureDerivedState(character);
  },
  handleAction(character, actionKey) {
    if (actionKey === bardicInspirationActionKey) {
      return activateBardicInspiration(character);
    }

    if (actionKey === mantleOfInspirationActionKey) {
      return activateMantleOfInspiration(character);
    }

    if (actionKey === lunarVitalityActionKey) {
      return activateBardCollegeOfTheMoonLunarVitality(character);
    }

    if (actionKey === unbreakableMajestyActionKey) {
      return activateUnbreakableMajesty(character);
    }

    return null;
  },
  applyShortRest: applyShortRestToBardFeatures,
  applyLongRest: applyLongRestToBardFeatures,
  advanceRound: advanceBardFeaturesForNewRound
};
