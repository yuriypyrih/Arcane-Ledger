import { hasCharacterClass, getClassSubclassId } from "../../../multiclassState";
import type { SubclassDerivedFeatureState, SubclassRuntimeCharacter } from "../../subclassRuntime";
import { getRangerBeastMasterDerivedFeatureState } from "./rangerBeastMaster";
import { getRangerFeyWandererDerivedFeatureState } from "./rangerFeyWanderer";
import { getRangerGloomStalkerDerivedFeatureState } from "./rangerGloomStalker";
import { getRangerHunterDerivedFeatureState } from "./rangerHunter";
import { getRangerHollowWardenDerivedFeatureState } from "./rangerHollowWarden";
import { getRangerWinterWalkerDerivedFeatureState } from "./rangerWinterWalker";

export function getRangerSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (!hasCharacterClass(character, "Ranger") || !getClassSubclassId(character, "Ranger")) {
    return {};
  }

  switch (getClassSubclassId(character, "Ranger")) {
    case "ranger-beast-master":
      return getRangerBeastMasterDerivedFeatureState(character);
    case "ranger-fey-wanderer":
      return getRangerFeyWandererDerivedFeatureState(character);
    case "ranger-gloom-stalker":
      return getRangerGloomStalkerDerivedFeatureState(character);
    case "ranger-hunter":
      return getRangerHunterDerivedFeatureState(character);
    case "ranger-hollow-warden":
      return getRangerHollowWardenDerivedFeatureState(character);
    case "ranger-winter-walker":
      return getRangerWinterWalkerDerivedFeatureState(character);
    default:
      return {};
  }
}
