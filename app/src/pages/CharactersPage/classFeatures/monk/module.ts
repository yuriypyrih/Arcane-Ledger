import {
  activateMonkCloakOfShadow,
  activateMonkElementalBurst,
  activateMonkElementalAttunement,
  activateMonkFlurryOfBlows,
  activateMonkPatientDefense,
  activateMonkHandOfHealing,
  activateMonkHandOfUltimateJustice,
  activateMonkShadowStep,
  activateMonkStepOfTheWind,
  activateMonkSuperiorDefense,
  activateMonkWholenessOfBody,
  advanceMonkFeaturesForNewRound,
  applyLongRestToMonkFeatures,
  applyShortRestToMonkFeatures,
  monkHandOfHealingActionKey,
  monkHandOfUltimateJusticeActionKey,
  monkFlurryOfBlowsActionKey,
  monkPatientDefenseActionKey,
  monkCloakOfShadowActionKey,
  monkElementalBurstActionKey,
  monkElementalAttunementActionKey,
  monkShadowStepActionKey,
  monkStepOfTheWindActionKey,
  monkSuperiorDefenseActionKey,
  monkWholenessOfBodyActionKey,
  normalizeMonkFeatureState
} from "./monk";
import { getMonkClassFeatureDerivedState } from "./contributions";
import type { ClassFeatureModule } from "../types";

export const monkFeatureModule: ClassFeatureModule<"monk"> = {
  className: "Monk",
  stateKey: "monk",
  normalizeState: normalizeMonkFeatureState,
  collectDerived: getMonkClassFeatureDerivedState,
  handleAction(character, actionKey) {
    if (actionKey === monkFlurryOfBlowsActionKey) {
      return activateMonkFlurryOfBlows(character);
    }

    if (actionKey === monkPatientDefenseActionKey) {
      return activateMonkPatientDefense(character);
    }

    if (actionKey === monkStepOfTheWindActionKey) {
      return activateMonkStepOfTheWind(character);
    }

    if (actionKey === monkSuperiorDefenseActionKey) {
      return activateMonkSuperiorDefense(character);
    }

    if (actionKey === monkHandOfHealingActionKey) {
      return activateMonkHandOfHealing(character);
    }

    if (actionKey === monkHandOfUltimateJusticeActionKey) {
      return activateMonkHandOfUltimateJustice(character);
    }

    if (actionKey === monkShadowStepActionKey) {
      return activateMonkShadowStep(character);
    }

    if (actionKey === monkWholenessOfBodyActionKey) {
      return activateMonkWholenessOfBody(character);
    }

    if (actionKey === monkCloakOfShadowActionKey) {
      return activateMonkCloakOfShadow(character);
    }

    if (actionKey === monkElementalAttunementActionKey) {
      return activateMonkElementalAttunement(character);
    }

    if (actionKey === monkElementalBurstActionKey) {
      return activateMonkElementalBurst(character);
    }

    return null;
  },
  applyShortRest: applyShortRestToMonkFeatures,
  applyLongRest: applyLongRestToMonkFeatures,
  advanceRound: advanceMonkFeaturesForNewRound
};
