import {
  abjureFoesActionKey,
  activateAbjureFoes,
  activateElderChampion,
  activateHolyNimbus,
  activateLivingLegend,
  activateNobleScion,
  activateAvengingAngel,
  activateNaturesWrath,
  activatePeerlessAthlete,
  activatePaladinFeatureActionOption,
  advancePaladinFeaturesForNewRound,
  applyLongRestToPaladinFeatures,
  applyShortRestToPaladinFeatures,
  elderChampionActionKey,
  faithfulSteedActionKey,
  holyNimbusActionKey,
  livingLegendActionKey,
  nobleScionActionKey,
  avengingAngelActionKey,
  naturesWrathActionKey,
  normalizePaladinFeatureState,
  paladinChannelDivinityActionKey,
  paladinLayOnHandsActionKey,
  paladinsSmiteActionKey,
  peerlessAthleteActionKey
} from "./paladin";
import { getPaladinClassFeatureDerivedState } from "./contributions";
import type { ClassFeatureModule } from "../types";

export const paladinFeatureModule: ClassFeatureModule<"paladin"> = {
  className: "Paladin",
  stateKey: "paladin",
  normalizeState: normalizePaladinFeatureState,
  collectDerived: getPaladinClassFeatureDerivedState,
  handleAction(character, actionKey) {
    if (
      actionKey === paladinLayOnHandsActionKey ||
      actionKey === paladinsSmiteActionKey ||
      actionKey === faithfulSteedActionKey
    ) {
      return character;
    }

    if (actionKey === holyNimbusActionKey) {
      return activateHolyNimbus(character);
    }

    if (actionKey === abjureFoesActionKey) {
      return activateAbjureFoes(character);
    }

    if (actionKey === naturesWrathActionKey) {
      return activateNaturesWrath(character);
    }

    if (actionKey === livingLegendActionKey) {
      return activateLivingLegend(character);
    }

    if (actionKey === nobleScionActionKey) {
      return activateNobleScion(character);
    }

    if (actionKey === avengingAngelActionKey) {
      return activateAvengingAngel(character);
    }

    if (actionKey === elderChampionActionKey) {
      return activateElderChampion(character);
    }

    if (actionKey === peerlessAthleteActionKey) {
      return activatePeerlessAthlete(character);
    }

    return null;
  },
  handleActionOption(character, actionKey, optionKey) {
    return actionKey === paladinChannelDivinityActionKey
      ? activatePaladinFeatureActionOption(character, optionKey)
      : null;
  },
  applyShortRest: applyShortRestToPaladinFeatures,
  applyLongRest: applyLongRestToPaladinFeatures,
  advanceRound: advancePaladinFeaturesForNewRound
};
