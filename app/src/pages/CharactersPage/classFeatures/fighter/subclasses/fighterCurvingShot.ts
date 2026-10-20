import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { Character } from "../../../../../types";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import {
  consumeRoundTrackerResource,
  isRoundTrackerResourceAvailable,
  shouldTrackRoundScopedResources
} from "../../../combat";
import {
  createSubclassContributionSource,
  type FeatureContributionSpec
} from "../../../featureContributions";
import type { WeaponAction } from "../../../gameplay";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import { isArcaneShotWeapon } from "./fighterArcaneShot";

export function getCurvingShotWeaponOptionState(character: Character, action: WeaponAction | null) {
  if (
    !isArcaneShotWeapon(action) ||
    !getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.CURVING_SHOT)
  )
    return null;
  const disabled =
    shouldTrackRoundScopedResources(character.roundTracker) &&
    !isRoundTrackerResourceAvailable(character.roundTracker, "bonusAction");
  return {
    disabled,
    disabledReason: disabled ? "Your Bonus Action has already been used this turn." : null
  };
}

export function consumeCurvingShot(character: Character, action: WeaponAction): Character {
  const state = getCurvingShotWeaponOptionState(character, action);
  if (!state || state.disabled) return character;
  return {
    ...character,
    roundTracker: consumeRoundTrackerResource(character.roundTracker, "bonusAction")
  };
}

export function collectCurvingShotContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  const feature = getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.CURVING_SHOT);
  if (!feature) return [];
  return [
    {
      source: createSubclassContributionSource({
        id: "fighter-curving-shot",
        label: "Curving Shot",
        entryId: CLASS_FEATURE.CURVING_SHOT
      }),
      weaponActionTransforms: [
        {
          id: "fighter-curving-shot-weapon",
          transform: (_character, value) => {
            const action = value as WeaponAction;
            return isArcaneShotWeapon(action)
              ? appendFeatureSourcedDescriptionAddition(
                  action,
                  character,
                  CLASS_FEATURE.CURVING_SHOT,
                  feature.description
                )
              : action;
          }
        }
      ]
    }
  ];
}
