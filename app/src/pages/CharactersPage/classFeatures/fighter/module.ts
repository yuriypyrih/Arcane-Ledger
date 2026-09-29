import {
  activateFighterPsiWarriorBulwarkOfForceForCharacter,
  activateFighterPsiWarriorTelekineticMovementForCharacter,
  activateFighterPsiWarriorPsiPoweredLeapForCharacter,
  activateFighterActionSurge,
  advanceFighterFeaturesForNewRound,
  applyLongRestToFighterFeatures,
  applyShortRestToFighterFeatures,
  consumeFighterIndomitableUse,
  consumeFighterSecondWindUse,
  fighterActionSurgeActionKey,
  fighterIndomitableActionKey,
  fighterPsiWarriorBulwarkOfForceActionKey,
  fighterPsiPoweredLeapActionKey,
  fighterPsiWarriorTelekineticMovementActionKey,
  fighterSecondWindActionKey,
  fighterTacticalMindActionKey,
  normalizeFighterFeatureState
} from "./fighter";
import { getFighterClassFeatureDerivedState } from "./contributions";
import type { ClassFeatureModule } from "../types";

export const fighterFeatureModule: ClassFeatureModule<"fighter"> = {
  className: "Fighter",
  stateKey: "fighter",
  normalizeState: normalizeFighterFeatureState,
  collectDerived: getFighterClassFeatureDerivedState,
  handleAction(character, actionKey) {
    if (actionKey === fighterActionSurgeActionKey) {
      return activateFighterActionSurge(character);
    }

    if (actionKey === fighterSecondWindActionKey || actionKey === fighterTacticalMindActionKey) {
      return consumeFighterSecondWindUse(character);
    }

    if (actionKey === fighterIndomitableActionKey) {
      return consumeFighterIndomitableUse(character);
    }

    if (actionKey === fighterPsiWarriorTelekineticMovementActionKey) {
      return activateFighterPsiWarriorTelekineticMovementForCharacter(character);
    }

    if (actionKey === fighterPsiPoweredLeapActionKey) {
      return activateFighterPsiWarriorPsiPoweredLeapForCharacter(character);
    }

    if (actionKey === fighterPsiWarriorBulwarkOfForceActionKey) {
      return activateFighterPsiWarriorBulwarkOfForceForCharacter(character);
    }

    return null;
  },
  applyShortRest: applyShortRestToFighterFeatures,
  applyLongRest: applyLongRestToFighterFeatures,
  advanceRound: advanceFighterFeaturesForNewRound
};
