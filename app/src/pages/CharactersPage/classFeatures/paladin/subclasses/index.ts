import { hasCharacterClass, getClassSubclassId } from "../../../multiclass";
import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  getPaladinOathOfDevotionDerivedFeatureState,
  oathOfDevotionSubclassId
} from "./paladinOathOfDevotion";
import {
  getPaladinOathOfGloryDerivedFeatureState,
  oathOfGlorySubclassId
} from "./paladinOathOfGlory";
import {
  getPaladinOathOfTheAncientsDerivedFeatureState,
  oathOfTheAncientsSubclassId
} from "./paladinOathOfTheAncients";
import {
  getPaladinOathOfTheNobleGeniesDerivedFeatureState,
  oathOfTheNobleGeniesSubclassId
} from "./paladinOathOfTheNobleGenies";
import {
  getPaladinOathOfVengeanceDerivedFeatureState,
  oathOfVengeanceSubclassId
} from "./paladinOathOfVengeance";

const paladinSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [oathOfTheAncientsSubclassId]: getPaladinOathOfTheAncientsDerivedFeatureState,
  [oathOfDevotionSubclassId]: getPaladinOathOfDevotionDerivedFeatureState,
  [oathOfGlorySubclassId]: getPaladinOathOfGloryDerivedFeatureState,
  [oathOfTheNobleGeniesSubclassId]: getPaladinOathOfTheNobleGeniesDerivedFeatureState,
  [oathOfVengeanceSubclassId]: getPaladinOathOfVengeanceDerivedFeatureState
};

export function getPaladinSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (!hasCharacterClass(character, "Paladin") || !getClassSubclassId(character, "Paladin")) {
    return {};
  }

  return (
    paladinSubclassRuntimeRegistry[getClassSubclassId(character, "Paladin")]?.(character) ?? {}
  );
}
