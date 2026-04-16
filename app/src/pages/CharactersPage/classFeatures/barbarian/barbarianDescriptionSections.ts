import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { createSourcedDescriptionEntries } from "../../actionModalDescriptions";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";

type BarbarianDescriptionCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId">>;

const instinctivePounceSource = "Instinctive Pounce";
const persistentRageSource = "Persistent Rage";

function getPersistentRageDescriptionSplit(character: BarbarianDescriptionCharacter): {
  initiativeEntries: SpellDescriptionEntry[];
  rageEntries: SpellDescriptionEntry[];
} {
  const persistentRageDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.PERSISTENT_RAGE
  );

  return {
    initiativeEntries: persistentRageDescription.slice(0, 1),
    rageEntries: persistentRageDescription.slice(1)
  };
}

export function getBarbarianPersistentRageInitiativeDescriptionAdditions(
  character: BarbarianDescriptionCharacter
): SpellDescriptionEntry[][] {
  const { initiativeEntries } = getPersistentRageDescriptionSplit(character);

  return initiativeEntries.length > 0
    ? [createSourcedDescriptionEntries(persistentRageSource, initiativeEntries)]
    : [];
}

export function getBarbarianRageActionDescriptionAdditions(
  character: BarbarianDescriptionCharacter
): SpellDescriptionEntry[][] {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];
  const { rageEntries: persistentRageRageEntries } = getPersistentRageDescriptionSplit(character);
  const instinctivePounceDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.INSTINCTIVE_POUNCE
  );

  if (persistentRageRageEntries.length > 0) {
    descriptionAdditions.push(
      createSourcedDescriptionEntries(persistentRageSource, persistentRageRageEntries)
    );
  }

  if (instinctivePounceDescription.length > 0) {
    descriptionAdditions.push(
      createSourcedDescriptionEntries(instinctivePounceSource, instinctivePounceDescription)
    );
  }

  return descriptionAdditions;
}

export function getBarbarianRageDescriptionContent(character: BarbarianDescriptionCharacter): {
  description: SpellDescriptionEntry[];
  descriptionAdditions: SpellDescriptionEntry[][];
} {
  return {
    description: getFeatureDescriptionForCharacter(character, CLASS_FEATURE.RAGE),
    descriptionAdditions: getBarbarianRageActionDescriptionAdditions(character)
  };
}
