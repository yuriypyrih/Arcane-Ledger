import {
  activateWizardFeatureAction,
  advanceWizardFeaturesForNewRound,
  applyLongRestToWizardFeatures,
  applyShortRestToWizardFeatures,
  normalizeWizardFeatureState
} from "./wizard";
import { getWizardClassFeatureDerivedState } from "./contributions";
import type { ClassFeatureModule } from "../types";

export const wizardFeatureModule: ClassFeatureModule<"wizard"> = {
  className: "Wizard",
  stateKey: "wizard",
  normalizeState(value, character) {
    return normalizeWizardFeatureState(
      value as Parameters<typeof normalizeWizardFeatureState>[0],
      character
    );
  },
  collectDerived: getWizardClassFeatureDerivedState,
  handleAction(character, actionKey) {
    return activateWizardFeatureAction(character, actionKey);
  },
  advanceRound: advanceWizardFeaturesForNewRound,
  applyShortRest: applyShortRestToWizardFeatures,
  applyLongRest: applyLongRestToWizardFeatures
};
