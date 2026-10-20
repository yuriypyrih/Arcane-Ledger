import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { Character } from "../../../../../types";
import {
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import {
  createSubclassContributionSource,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { extractDescriptionSection } from "../../../shared/descriptionSections";
import {
  getFeatureDescriptionForCharacter,
  getFeatureDescriptionMetadataForCharacter
} from "../../featureDescriptions";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import { rogueSneakAttackActionKey } from "../actionKeys";
import { gainPhantomSoulTrinket, getPhantomSoulTrinketsRemaining } from "./roguePhantomTokens";

function hasPhantomDeathsFriend(character: SubclassRuntimeCharacter): boolean {
  return getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.DEATHS_FRIEND) !== null;
}

function getDeathsFriendDescriptionSection(character: SubclassRuntimeCharacter, heading: string) {
  return extractDescriptionSection(
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.DEATHS_FRIEND).filter(
      (entry): entry is string => typeof entry === "string"
    ),
    heading
  );
}

export function applyPhantomDrawOfDeathOnInitiative(character: Character): Character {
  return hasPhantomDeathsFriend(character) && getPhantomSoulTrinketsRemaining(character) === 0
    ? gainPhantomSoulTrinket(character)
    : character;
}

export function getPhantomDrawOfDeathInitiativeDescriptionAdditions(
  character: SubclassRuntimeCharacter
) {
  return hasPhantomDeathsFriend(character)
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.DEATHS_FRIEND,
          getDeathsFriendDescriptionSection(character, "Draw of Death.")
        )
      ]
    : [];
}

export function collectPhantomDeathsFriendContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  if (!hasPhantomDeathsFriend(character)) return [];
  return [
    {
      source: createSubclassContributionSource({
        id: "rogue-phantom-deaths-friend",
        label: "Death's Friend",
        entryId: CLASS_FEATURE.DEATHS_FRIEND
      }),
      featureActionTransforms: [
        {
          id: "rogue-phantom-deaths-lament",
          transform: (action) =>
            action.key === rogueSneakAttackActionKey
              ? appendFeatureSourcedDescriptionAddition(
                  action,
                  character,
                  CLASS_FEATURE.DEATHS_FRIEND,
                  getDeathsFriendDescriptionSection(character, "Death's Lament.")
                )
              : action
        }
      ]
    }
  ];
}
