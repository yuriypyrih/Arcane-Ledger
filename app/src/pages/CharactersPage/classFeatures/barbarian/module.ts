import {
  activateBarbarianIntimidatingPresence,
  activateBarbarianBrutalStrike,
  activateBarbarianRecklessAttack,
  activateBarbarianRage,
  activateBarbarianRageOfTheWildsOption,
  activateBarbarianTravelAlongTheTree,
  activateBarbarianZealousPresence,
  advanceBarbarianFeaturesForNewRound,
  applyLongRestToBarbarianFeatures,
  applyShortRestToBarbarianFeatures,
  barbarianBrutalStrikeActionKey,
  barbarianIntimidatingPresenceActionKey,
  barbarianRageActionKey,
  barbarianRecklessAttackActionKey,
  barbarianWarriorOfTheGodsActionKey,
  barbarianTravelAlongTheTreeActionKey,
  barbarianZealousPresenceActionKey,
  normalizeBarbarianRageState
} from "./barbarian";
import { getBarbarianClassFeatureDerivedState } from "./contributions";
import type { ClassFeatureModule } from "../types";

export const barbarianFeatureModule: ClassFeatureModule<"rage"> = {
  className: "Barbarian",
  stateKey: "rage",
  normalizeState: normalizeBarbarianRageState,
  collectDerived(character) {
    return getBarbarianClassFeatureDerivedState(character);
  },
  handleAction(character, actionKey) {
    if (actionKey === barbarianRageActionKey) {
      return activateBarbarianRage(character);
    }

    if (actionKey === barbarianRecklessAttackActionKey) {
      return activateBarbarianRecklessAttack(character);
    }

    if (actionKey === barbarianBrutalStrikeActionKey) {
      return activateBarbarianBrutalStrike(character);
    }

    if (actionKey === barbarianWarriorOfTheGodsActionKey) {
      return character;
    }

    if (actionKey === barbarianIntimidatingPresenceActionKey) {
      return activateBarbarianIntimidatingPresence(character);
    }

    if (actionKey === barbarianZealousPresenceActionKey) {
      return activateBarbarianZealousPresence(character);
    }

    if (actionKey === barbarianTravelAlongTheTreeActionKey) {
      return activateBarbarianTravelAlongTheTree(character);
    }

    return null;
  },
  handleActionOption(character, actionKey, optionKey) {
    return actionKey === barbarianRageActionKey
      ? activateBarbarianRageOfTheWildsOption(character, optionKey)
      : null;
  },
  applyShortRest: applyShortRestToBarbarianFeatures,
  applyLongRest: applyLongRestToBarbarianFeatures,
  advanceRound: advanceBarbarianFeaturesForNewRound
};
