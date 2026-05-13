import type {
  Character,
  CharacterFeatEntry,
  CharacterFeatSource,
  ArmorProficiencyEntry,
  SavingThrowProficiencyEntry,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../../types";
import {
  addFeatGrantedProficienciesToCollections,
  removeFeatGrantedProficienciesFromCollections
} from "../../../../pages/CharactersPage/feats/proficiencyGrants";
import { isFeatEntryRemovable } from "../../../../pages/CharactersPage/feats";
import { isFeatFromClassFeatureSource } from "./helpers";

export type FeatEditorDraft = {
  feats: CharacterFeatEntry[];
  armorProficiencies: ArmorProficiencyEntry[];
  savingThrowProficiencies: SavingThrowProficiencyEntry[];
  skillProficiencies: SkillProficiencyEntry[];
  toolProficiencies: ToolProficiencyEntry[];
  weaponProficiencies: WeaponProficiencyEntry[];
};

type ClassFeatureFeatSource = CharacterFeatSource & {
  type: "class-feature";
};

function areDraftListsEqual<T>(left: T[], right: T[]): boolean {
  return left === right || JSON.stringify(left) === JSON.stringify(right);
}

export function createFeatEditorDraft(character: Character): FeatEditorDraft {
  return {
    feats: character.feats ?? [],
    armorProficiencies: character.armorProficiencies,
    savingThrowProficiencies: character.savingThrowProficiencies,
    skillProficiencies: character.skillProficiencies,
    toolProficiencies: character.toolProficiencies,
    weaponProficiencies: character.weaponProficiencies
  };
}

export function applyFeatEditorDraftToCharacter(
  currentCharacter: Character,
  draft: FeatEditorDraft
): Character {
  if (
    areDraftListsEqual(currentCharacter.feats ?? [], draft.feats) &&
    areDraftListsEqual(currentCharacter.armorProficiencies, draft.armorProficiencies) &&
    areDraftListsEqual(
      currentCharacter.savingThrowProficiencies,
      draft.savingThrowProficiencies
    ) &&
    areDraftListsEqual(currentCharacter.skillProficiencies, draft.skillProficiencies) &&
    areDraftListsEqual(currentCharacter.toolProficiencies, draft.toolProficiencies) &&
    areDraftListsEqual(currentCharacter.weaponProficiencies, draft.weaponProficiencies)
  ) {
    return currentCharacter;
  }

  return {
    ...currentCharacter,
    feats: draft.feats,
    armorProficiencies: draft.armorProficiencies,
    savingThrowProficiencies: draft.savingThrowProficiencies,
    skillProficiencies: draft.skillProficiencies,
    toolProficiencies: draft.toolProficiencies,
    weaponProficiencies: draft.weaponProficiencies
  };
}

export function removeFeatFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (!isFeatEntryRemovable(entryToRemove)) {
    return draft;
  }

  const nextDraft = removeFeatGrantedProficienciesFromCollections(draft, entryToRemove);

  return {
    ...nextDraft,
    feats: nextDraft.feats.filter((entry) => entry.id !== entryToRemove.id)
  };
}

export function updateFeatInDraft(
  draft: FeatEditorDraft,
  previousEntry: CharacterFeatEntry,
  nextEntry: CharacterFeatEntry
): FeatEditorDraft {
  const nextDraft = removeFeatGrantedProficienciesFromCollections(draft, previousEntry);

  return addFeatGrantedProficienciesToCollections(
    {
      ...nextDraft,
      feats: nextDraft.feats.map((entry) => (entry.id === previousEntry.id ? nextEntry : entry))
    },
    nextEntry
  );
}

export function upsertFeatInDraft(
  draft: FeatEditorDraft,
  featEntry: CharacterFeatEntry,
  sourceContext: ClassFeatureFeatSource | null
): FeatEditorDraft {
  const existingEntries = sourceContext
    ? draft.feats.filter((entry) =>
        isFeatFromClassFeatureSource(entry, sourceContext.level, sourceContext.feature)
      )
    : [];
  let nextDraft = draft;

  existingEntries.forEach((entry) => {
    nextDraft = removeFeatGrantedProficienciesFromCollections(nextDraft, entry);
  });

  const nextFeats = sourceContext
    ? [
        ...nextDraft.feats.filter(
          (entry) => !isFeatFromClassFeatureSource(entry, sourceContext.level, sourceContext.feature)
        ),
        featEntry
      ]
    : [...nextDraft.feats, featEntry];

  nextDraft = {
    ...nextDraft,
    feats: nextFeats
  };

  return addFeatGrantedProficienciesToCollections(nextDraft, featEntry);
}
