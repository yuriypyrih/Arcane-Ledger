import {
  endPathToTheGraveKey,
  endPathToTheGrave
} from "./subclasses/clericGraveDomain";
import {
  activateClericBlessingOfTheTrickster,
  activateClericCoronaOfLight,
  activateClericDivineForeknowledge,
  activateClericDivineIntervention,
  activateClericFeatureActionOption,
  activateClericInvokeDuplicity,
  activateClericWarPriest,
  blessingOfTheTricksterActionKey,
  activateClericPreserveLife,
  activateClericRadianceOfTheDawn,
  advanceClericFeaturesForNewRound,
  applyLongRestToClericFeatures,
  applyShortRestToClericFeatures,
  coronaOfLightActionKey,
  divineForeknowledgeActionKey,
  divineInterventionActionKey,
  invokeDuplicityActionKey,
  preserveLifeActionKey,
  radianceOfTheDawnActionKey,
  warPriestActionKey,
  normalizeClericFeatureState
} from "./cleric";
import { getClericClassFeatureDerivedState } from "./contributions";
import type { ClassFeatureModule } from "../types";

export const clericFeatureModule: ClassFeatureModule<"cleric"> = {
  className: "Cleric",
  stateKey: "cleric",
  normalizeState: normalizeClericFeatureState,
  collectDerived(character) {
    return getClericClassFeatureDerivedState(character);
  },
  handleAction(character, actionKey) {
    if (actionKey === endPathToTheGraveKey) return endPathToTheGrave(character);
    if (actionKey === blessingOfTheTricksterActionKey) {
      return activateClericBlessingOfTheTrickster(character);
    }

    if (actionKey === invokeDuplicityActionKey) {
      return activateClericInvokeDuplicity(character);
    }

    if (actionKey === divineForeknowledgeActionKey) {
      return activateClericDivineForeknowledge(character);
    }

    if (actionKey === preserveLifeActionKey) {
      return activateClericPreserveLife(character);
    }

    if (actionKey === radianceOfTheDawnActionKey) {
      return activateClericRadianceOfTheDawn(character);
    }

    if (actionKey === coronaOfLightActionKey) {
      return activateClericCoronaOfLight(character);
    }

    if (actionKey === warPriestActionKey) {
      return activateClericWarPriest(character);
    }

    return actionKey === divineInterventionActionKey
      ? activateClericDivineIntervention(character)
      : null;
  },
  handleActionOption(character, actionKey, optionKey) {
    return actionKey === "cleric-channel-divinity"
      ? activateClericFeatureActionOption(character, optionKey)
      : null;
  },
  applyShortRest: applyShortRestToClericFeatures,
  applyLongRest: applyLongRestToClericFeatures,
  advanceRound: advanceClericFeaturesForNewRound
};
