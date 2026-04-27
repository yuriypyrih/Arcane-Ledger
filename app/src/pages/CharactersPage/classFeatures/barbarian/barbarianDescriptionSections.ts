import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { createFeatureSourcedDescriptionEntries } from "../../actionModalDescriptions";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";
import { hasBarbarianPathOfTheBerserkerMindlessRage } from "./subclasses/barbarianPathOfTheBerserker";
import {
  hasBarbarianPathOfTheWorldTreeTravelAlongTheTree,
  hasBarbarianPathOfTheWorldTreeVitalityOfTheTree
} from "./subclasses/barbarianPathOfTheWorldTree";
import { hasBarbarianPathOfTheZealotDivineFury } from "./subclasses/barbarianPathOfTheZealot";

type BarbarianDescriptionCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId">>;

const instinctivePounceSource = "Instinctive Pounce";
const mindlessRageSource = "Mindless Rage";
const persistentRageSource = "Persistent Rage";
const vitalityOfTheTreeSource = "Vitality of the Tree";
const travelAlongTheTreeSource = "Travel Along the Tree";
const divineFurySource = "Divine Fury";

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
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.PERSISTENT_RAGE,
          initiativeEntries,
          persistentRageSource
        )
      ]
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
      createFeatureSourcedDescriptionEntries(
        character,
        CLASS_FEATURE.PERSISTENT_RAGE,
        persistentRageRageEntries,
        persistentRageSource
      )
    );
  }

  if (instinctivePounceDescription.length > 0) {
    descriptionAdditions.push(
      createFeatureSourcedDescriptionEntries(
        character,
        CLASS_FEATURE.INSTINCTIVE_POUNCE,
        instinctivePounceDescription,
        instinctivePounceSource
      )
    );
  }

  if (hasBarbarianPathOfTheWorldTreeVitalityOfTheTree(character)) {
    const vitalityOfTheTreeDescription = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.VITALITY_OF_THE_TREE
    );

    if (vitalityOfTheTreeDescription.length > 0) {
      descriptionAdditions.push(
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.VITALITY_OF_THE_TREE,
          vitalityOfTheTreeDescription,
          vitalityOfTheTreeSource
        )
      );
    }
  }

  if (hasBarbarianPathOfTheWorldTreeTravelAlongTheTree(character)) {
    const travelAlongTheTreeDescription = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.TRAVEL_ALONG_THE_TREE
    );

    if (travelAlongTheTreeDescription.length > 0) {
      descriptionAdditions.push(
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.TRAVEL_ALONG_THE_TREE,
          travelAlongTheTreeDescription,
          travelAlongTheTreeSource
        )
      );
    }
  }

  if (hasBarbarianPathOfTheZealotDivineFury(character)) {
    const divineFuryDescription = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.DIVINE_FURY
    );

    if (divineFuryDescription.length > 0) {
      descriptionAdditions.push(
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.DIVINE_FURY,
          divineFuryDescription,
          divineFurySource
        )
      );
    }
  }

  if (hasBarbarianPathOfTheBerserkerMindlessRage(character)) {
    const mindlessRageDescription = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.MINDLESS_RAGE
    );

    if (mindlessRageDescription.length > 0) {
      descriptionAdditions.push(
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.MINDLESS_RAGE,
          mindlessRageDescription,
          mindlessRageSource
        )
      );
    }
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
