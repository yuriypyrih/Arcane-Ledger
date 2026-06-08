import { CLASS_FEATURE, FEATS, type SpellDescriptionEntry } from "../../../codex/entries";
import type { Character } from "../../../types";
import {
  createFeatureSourcedDescriptionEntries,
  createSourcedDescriptionEntries
} from "../actionModalDescriptions";
import { hasFeatForCharacter } from "../feats/runtime";
import { getFeatDefinition } from "../feats";
import { getBarbarianFeatureDescriptionAdditions } from "./barbarian/contributions";
import { getFeatureDescriptionForCharacter } from "./featureDescriptions";
import { getMonkInitiativeDescriptionAdditions } from "./monk/monkDescriptionSections";
import { getRogueThiefInitiativeDescriptionAdditions } from "./rogue/subclasses/rogueThief";

type InitiativeDescriptionCharacter = Character;

const alertInitiativeSwapSource = "Alert";
const tandemFootworkSource = "Tandem Footwork";
const superiorInspirationSource = "Superior Inspiration";

function descriptionEntryIncludesText(entry: SpellDescriptionEntry, text: string): boolean {
  return typeof entry === "string"
    ? entry.includes(text)
    : entry.items.some((item) => item.includes(text));
}

function getAlertInitiativeDescriptionAdditions(
  character: InitiativeDescriptionCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.ALERT)) {
    return [];
  }

  const initiativeSwapDescription =
    getFeatDefinition(FEATS.ALERT)?.description.filter((entry) =>
      descriptionEntryIncludesText(entry, "Initiative Swap")
    ) ?? [];

  return initiativeSwapDescription.length > 0
    ? [createSourcedDescriptionEntries(alertInitiativeSwapSource, initiativeSwapDescription)]
    : [];
}

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
    ...getAlertInitiativeDescriptionAdditions(character),
    ...getBarbarianFeatureDescriptionAdditions(character, "initiative"),
    ...getBardInitiativeDescriptionAdditions(character),
    ...getMonkInitiativeDescriptionAdditions(character),
    ...getRogueThiefInitiativeDescriptionAdditions(character)
  ];
}
