import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../codex/entries";
import type { Character } from "../../../types";
import { createFeatureSourcedDescriptionEntries } from "../actionModalDescriptions";
import { getBarbarianPersistentRageInitiativeDescriptionAdditions } from "./barbarian/barbarianDescriptionSections";
import { getFeatureDescriptionForCharacter } from "./featureDescriptions";
import { getMonkInitiativeDescriptionAdditions } from "./monk/monkDescriptionSections";
import { getRogueThiefInitiativeDescriptionAdditions } from "./rogue/subclasses/rogueThief";

type InitiativeDescriptionCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId">>;

const tandemFootworkSource = "Tandem Footwork";
const superiorInspirationSource = "Superior Inspiration";

function getBardInitiativeDescriptionAdditions(
  character: InitiativeDescriptionCharacter
): SpellDescriptionEntry[][] {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];
  const tandemFootworkDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.TANDEM_FOOTWORK
  );
  const superiorInspirationDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.SUPERIOR_INSPIRATION
  );

  if (tandemFootworkDescription.length > 0) {
    descriptionAdditions.push(
      createFeatureSourcedDescriptionEntries(
        character,
        CLASS_FEATURE.TANDEM_FOOTWORK,
        tandemFootworkDescription,
        tandemFootworkSource
      )
    );
  }

  if (superiorInspirationDescription.length > 0) {
    descriptionAdditions.push(
      createFeatureSourcedDescriptionEntries(
        character,
        CLASS_FEATURE.SUPERIOR_INSPIRATION,
        superiorInspirationDescription,
        superiorInspirationSource
      )
    );
  }

  return descriptionAdditions;
}

export function getInitiativeReferenceDescriptionAdditions(
  character: InitiativeDescriptionCharacter
): SpellDescriptionEntry[][] {
  return [
    ...getBarbarianPersistentRageInitiativeDescriptionAdditions(character),
    ...getBardInitiativeDescriptionAdditions(character),
    ...getMonkInitiativeDescriptionAdditions(character),
    ...getRogueThiefInitiativeDescriptionAdditions(character)
  ];
}
