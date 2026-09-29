import {
  activateDruidLandsAid,
  activateDruidMoonlightStep,
  activateDruidNaturesSanctuary,
  activateDruidWrathOfTheSea,
  advanceDruidFeaturesForNewRound,
  applyLongRestToDruidFeatures,
  applyShortRestToDruidFeatures,
  druidLandsAidActionKey,
  druidMoonlightStepActionKey,
  druidNaturesSanctuaryActionKey,
  druidWrathOfTheSeaActionKey,
  druidNatureMagicianActionKey,
  druidWildResurgenceActionKey,
  normalizeDruidFeatureState
} from "./druid";
import { getDruidClassFeatureDerivedState } from "./contributions";
import type { ClassFeatureModule } from "../types";

export const druidFeatureModule: ClassFeatureModule<"druid"> = {
  className: "Druid",
  stateKey: "druid",
  normalizeState: normalizeDruidFeatureState,
  collectDerived: getDruidClassFeatureDerivedState,
  handleAction(character, actionKey) {
    if (actionKey === druidLandsAidActionKey) {
      return activateDruidLandsAid(character);
    }

    if (actionKey === druidMoonlightStepActionKey) {
      return activateDruidMoonlightStep(character);
    }

    if (actionKey === druidNaturesSanctuaryActionKey) {
      return activateDruidNaturesSanctuary(character);
    }

    if (actionKey === druidWrathOfTheSeaActionKey) {
      return activateDruidWrathOfTheSea(character);
    }

    if (actionKey === druidNatureMagicianActionKey) {
      return character;
    }

    if (actionKey === druidWildResurgenceActionKey) {
      return character;
    }

    return null;
  },
  applyShortRest: applyShortRestToDruidFeatures,
  applyLongRest: applyLongRestToDruidFeatures,
  advanceRound: advanceDruidFeaturesForNewRound
};
