import {
  activateRogueSneakAttack,
  activateRogueSteadyAim,
  advanceRogueFeaturesForNewRound,
  applyLongRestToRogueFeatures,
  applyShortRestToRogueFeatures,
  consumeRogueStrokeOfLuckUse,
  normalizeRogueFeatureState,
  rogueSneakAttackActionKey,
  rogueSteadyAimActionKey,
  rogueStrokeOfLuckActionKey
} from "./rogue";
import { getRogueClassFeatureDerivedState } from "./contributions";
import {
  activateRogueSoulknifePsychicTeleportation,
  activateRogueSoulknifePsychicWhispers,
  activateRogueSoulknifePsychicVeil,
  rogueSoulknifePsychicTeleportationActionKey,
  rogueSoulknifePsychicWhispersActionKey,
  rogueSoulknifePsychicVeilActionKey
} from "./subclasses/rogueSoulknife";
import type { ClassFeatureModule } from "../types";

export const rogueFeatureModule: ClassFeatureModule<"rogue"> = {
  className: "Rogue",
  stateKey: "rogue",
  normalizeState: normalizeRogueFeatureState,
  collectDerived: getRogueClassFeatureDerivedState,
  handleAction(character, actionKey) {
    if (actionKey === rogueSneakAttackActionKey) {
      return activateRogueSneakAttack(character);
    }

    if (actionKey === rogueSteadyAimActionKey) {
      return activateRogueSteadyAim(character);
    }

    if (actionKey === rogueSoulknifePsychicVeilActionKey) {
      return activateRogueSoulknifePsychicVeil(character);
    }

    if (actionKey === rogueSoulknifePsychicWhispersActionKey) {
      return activateRogueSoulknifePsychicWhispers(character);
    }

    if (actionKey === rogueSoulknifePsychicTeleportationActionKey) {
      return activateRogueSoulknifePsychicTeleportation(character);
    }

    if (actionKey === rogueStrokeOfLuckActionKey) {
      return consumeRogueStrokeOfLuckUse(character);
    }

    return null;
  },
  applyShortRest: applyShortRestToRogueFeatures,
  applyLongRest: applyLongRestToRogueFeatures,
  advanceRound: advanceRogueFeaturesForNewRound
};
