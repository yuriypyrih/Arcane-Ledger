import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { Character } from "../../../../../types";
import { createFeatureSourcedDescriptionEntries } from "../../../actionModalDescriptions";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import { getArcaneShotUsage } from "./fighterArcaneShot";

export function applyEverReadyShotOnInitiative(character: Character): Character {
  if (!getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.EVER_READY_SHOT)) {
    return character;
  }
  const { usesTotal, usesRemaining } = getArcaneShotUsage(character);
  if (usesRemaining >= usesTotal) return character;
  return replaceClassFeatureState(character, "fighter", {
    ...character.classFeatureState?.fighter,
    arcaneShotUsesExpended: Math.max(0, usesTotal - usesRemaining - 1)
  });
}

export function getEverReadyShotInitiativeDescriptionAdditions(
  character: SubclassRuntimeCharacter
) {
  const feature = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.EVER_READY_SHOT
  );
  return feature
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.EVER_READY_SHOT,
          feature.description
        )
      ]
    : [];
}
