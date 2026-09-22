import { hasCharacterClass, getClassSubclassId } from "../../../multiclass";
import type { SubclassDerivedFeatureState, SubclassRuntimeCharacter } from "../../subclassRuntime";
import { getRangerBeastMasterDerivedFeatureState } from "./rangerBeastMaster";
import { getRangerFeyWandererDerivedFeatureState } from "./rangerFeyWanderer";
import { getRangerGloomStalkerDerivedFeatureState } from "./rangerGloomStalker";
import { getRangerHunterDerivedFeatureState } from "./rangerHunter";
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
    case "ranger-winter-walker":
      return getRangerWinterWalkerDerivedFeatureState(character);
    default:
      return {};
  }
}
