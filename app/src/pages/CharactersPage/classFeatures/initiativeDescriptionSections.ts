import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../codex/entries";
import type { Character } from "../../../types";
import { createSourcedDescriptionEntries } from "../actionModalDescriptions";
import { getBarbarianPersistentRageInitiativeDescriptionAdditions } from "./barbarian/barbarianDescriptionSections";
import { getFeatureDescriptionForCharacter } from "./featureDescriptions";
import { getMonkInitiativeDescriptionAdditions } from "./monk/monkDescriptionSections";

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
      createSourcedDescriptionEntries(tandemFootworkSource, tandemFootworkDescription)
    );
  }

  if (superiorInspirationDescription.length > 0) {
    descriptionAdditions.push(
      createSourcedDescriptionEntries(
        superiorInspirationSource,
        superiorInspirationDescription
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
    ...getMonkInitiativeDescriptionAdditions(character)
  ];
}
