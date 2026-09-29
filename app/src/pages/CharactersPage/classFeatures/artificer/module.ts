import {
  activateArtificerArmorerArcaneArmorOption,
  activateArtificerArmorerDefensiveField,
  activateArtificerArmorerGiantStature,
  activateArtificerArmorerInfiltratorsFlight,
  advanceArtificerFeaturesForNewRound,
  activateArtificerArmorerArcaneArmor,
  applyLongRestToArtificerFeatures,
  artificerAdventurersAtlasActionKey,
  artificerArcaneJoltActionKey,
  artificerArmorerArcaneArmorActionKey,
  artificerArmorerDefensiveFieldActionKey,
  artificerArmorerGiantStatureActionKey,
  artificerArmorerInfiltratorsFlightActionKey,
  consumeArtificerArcaneJoltUse,
  createArtificerAdventurersAtlasMapsForCharacter,
  normalizeArtificerFeatureState
} from "./artificer";
import { getArtificerClassFeatureDerivedState } from "./contributions";
import type { ClassFeatureModule } from "../types";

export const artificerFeatureModule: ClassFeatureModule<"artificer"> = {
  className: "Artificer",
  stateKey: "artificer",
  normalizeState: normalizeArtificerFeatureState,
  collectDerived(character) {
    return getArtificerClassFeatureDerivedState(character);
  },
  handleAction(character, actionKey) {
    if (actionKey === artificerArmorerArcaneArmorActionKey) {
      return activateArtificerArmorerArcaneArmor(character);
    }

    if (actionKey === artificerArmorerGiantStatureActionKey) {
      return activateArtificerArmorerGiantStature(character);
    }

    if (actionKey === artificerArmorerDefensiveFieldActionKey) {
      return activateArtificerArmorerDefensiveField(character);
    }

    if (actionKey === artificerArmorerInfiltratorsFlightActionKey) {
      return activateArtificerArmorerInfiltratorsFlight(character);
    }

    if (actionKey === artificerArcaneJoltActionKey) {
      return consumeArtificerArcaneJoltUse(character);
    }

    if (actionKey === artificerAdventurersAtlasActionKey) {
      return createArtificerAdventurersAtlasMapsForCharacter(character);
    }

    return null;
  },
  handleActionOption(character, actionKey, optionKey) {
    return actionKey === artificerArmorerArcaneArmorActionKey
      ? activateArtificerArmorerArcaneArmorOption(character, optionKey)
      : null;
  },
  advanceRound: advanceArtificerFeaturesForNewRound,
  applyLongRest: applyLongRestToArtificerFeatures
};
