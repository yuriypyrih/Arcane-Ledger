import { FEATS } from "../../../../codex/entries";
import type {
  Character,
  CharacterFeatEntry,
  CharacterFeatSource,
  SkillProficiencyEntry,
  ToolProficiencyEntry
} from "../../../../types";
import {
  addFeatGrantedSkillEntries,
  addFeatGrantedToolEntries,
  removeFeatGrantedSkillEntries,
  removeFeatGrantedToolEntries
} from "../../../../pages/CharactersPage/proficiency";
import { isFeatFromClassFeatureSource } from "./helpers";
import { splitSkilledSelections } from "./featEditorUtils";

export type FeatEditorDraft = {
  feats: CharacterFeatEntry[];
  skillProficiencies: SkillProficiencyEntry[];
  toolProficiencies: ToolProficiencyEntry[];
};

type ClassFeatureFeatSource = CharacterFeatSource & {
  type: "class-feature";
};

function areDraftListsEqual<T>(left: T[], right: T[]): boolean {
  return left === right || JSON.stringify(left) === JSON.stringify(right);
}

function removeSkilledProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.SKILLED || !entryToRemove.skilled) {
    return draft;
  }

  const { skills, tools } = splitSkilledSelections(entryToRemove.skilled);

  return {
    ...draft,
    skillProficiencies: removeFeatGrantedSkillEntries(
      draft.skillProficiencies,
      skills,
      "Skilled",
      entryToRemove.id
    ),
    toolProficiencies: removeFeatGrantedToolEntries(
      draft.toolProficiencies,
      tools,
      "Skilled",
      entryToRemove.id
    )
  };
}

export function createFeatEditorDraft(character: Character): FeatEditorDraft {
  return {
    feats: character.feats ?? [],
    skillProficiencies: character.skillProficiencies,
    toolProficiencies: character.toolProficiencies
  };
}

export function applyFeatEditorDraftToCharacter(
  currentCharacter: Character,
  draft: FeatEditorDraft
): Character {
  if (
    areDraftListsEqual(currentCharacter.feats ?? [], draft.feats) &&
    areDraftListsEqual(currentCharacter.skillProficiencies, draft.skillProficiencies) &&
    areDraftListsEqual(currentCharacter.toolProficiencies, draft.toolProficiencies)
  ) {
    return currentCharacter;
  }

  return {
    ...currentCharacter,
    feats: draft.feats,
    skillProficiencies: draft.skillProficiencies,
    toolProficiencies: draft.toolProficiencies
  };
}

export function removeFeatFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  const nextDraft = removeSkilledProficienciesFromDraft(draft, entryToRemove);

  return {
    ...nextDraft,
    feats: nextDraft.feats.filter((entry) => entry.id !== entryToRemove.id)
  };
}

export function upsertFeatInDraft(
  draft: FeatEditorDraft,
  featEntry: CharacterFeatEntry,
  sourceContext: ClassFeatureFeatSource | null
): FeatEditorDraft {
  const skilledSelections =
    featEntry.feat === FEATS.SKILLED ? splitSkilledSelections(featEntry.skilled) : null;
  const existingEntries = sourceContext
    ? draft.feats.filter((entry) =>
        isFeatFromClassFeatureSource(entry, sourceContext.level, sourceContext.feature)
      )
    : [];
  let nextDraft = draft;

  existingEntries.forEach((entry) => {
    nextDraft = removeSkilledProficienciesFromDraft(nextDraft, entry);
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

  if (!skilledSelections) {
    return nextDraft;
  }

  return {
    ...nextDraft,
    skillProficiencies: addFeatGrantedSkillEntries(
      nextDraft.skillProficiencies,
      skilledSelections.skills,
      "Skilled",
      featEntry.id
    ),
    toolProficiencies: addFeatGrantedToolEntries(
      nextDraft.toolProficiencies,
      skilledSelections.tools,
      "Skilled",
      featEntry.id
    )
  };
}
