import {
  activateRangerBeastMasterAction,
  activateRangerNaturesVeil,
  advanceRangerFeaturesForNewRound,
  applyLongRestToRangerFeatures,
  applyShortRestToRangerFeatures,
  fortifyingSoulActionKey,
  naturesVeilActionKey,
  normalizeRangerFeatureState,
  rangerBeastMasterCommandActionKey,
  rangerBeastMasterReviveActionKey,
  tirelessActionKey,
  consumeRangerTirelessUse,
  consumeRangerWinterWalkerFortifyingSoulUse
} from "./ranger";
import { getRangerClassFeatureDerivedState } from "./contributions";
import type { ClassFeatureModule } from "../types";

export const rangerFeatureModule: ClassFeatureModule<"ranger"> = {
  className: "Ranger",
  stateKey: "ranger",
  normalizeState: normalizeRangerFeatureState,
  collectDerived: getRangerClassFeatureDerivedState,
  handleAction(character, actionKey) {
    if (actionKey === tirelessActionKey) {
      return consumeRangerTirelessUse(character);
    }

    if (actionKey === fortifyingSoulActionKey) {
      return consumeRangerWinterWalkerFortifyingSoulUse(character);
    }

    if (actionKey === naturesVeilActionKey) {
      return activateRangerNaturesVeil(character);
    }

    if (
      actionKey === rangerBeastMasterCommandActionKey ||
      actionKey === rangerBeastMasterReviveActionKey
    ) {
      return activateRangerBeastMasterAction(character, actionKey);
    }

    return null;
  },
  applyShortRest: applyShortRestToRangerFeatures,
  applyLongRest: applyLongRestToRangerFeatures,
  advanceRound: advanceRangerFeaturesForNewRound
};
