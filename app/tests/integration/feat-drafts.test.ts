import { describe, expect, it } from "vitest";
import { FEATS } from "../../src/codex/entries/enums";
import {
  PROF_LEVEL,
  SAVING_THROW_PROFICIENCY,
  SKILL_PROFICIENCY,
  type CharacterFeatEntry
} from "../../src/types";
import {
  createFeatEditorDraft,
  upsertFeatInDraft,
  updateFeatInDraft,
  removeFeatFromDraft,
  applyFeatEditorDraftToCharacter
} from "../../src/components/CharactersPage/CharacterSheetPage/ClassFeaturesAndFeats/featDrafts";
import {
  getResolvedSkillProficiencyEntry,
  getResolvedProficiencyEntry
} from "../../src/pages/CharactersPage/proficiency";
import { getAbilityScoreForCharacter } from "../../src/pages/CharactersPage/abilities";
import { createPortableCharacterSheet } from "../../src/pages/CharactersPage/portableCharacterSheet";
import { normalizeCharacter } from "../../src/pages/CharactersPage/storage";
import { characterFixture } from "../fixtures/character";
import { skillExpertFeat } from "../fixtures/feats";

describe("feat editor drafts preserve the rest of the sheet", () => {
  it("adds, edits, saves and removes Skill Expert with its sourced proficiency", () => {
    const original = characterFixture({ level: 4, xp: 2700 });
    const feat = skillExpertFeat();
    const added = upsertFeatInDraft(createFeatEditorDraft(original), feat, null);
    expect(original.feats).toEqual([]);
    expect(
      getResolvedSkillProficiencyEntry(added.skillProficiencies, SKILL_PROFICIENCY.ARCANA)
        .proficiencyLevel
    ).toBe(PROF_LEVEL.EXPERT);
    const changed: CharacterFeatEntry = {
      ...feat,
      skillExpert: { ability: "WIS", skillProficiency: "Medicine", skillExpertise: "Medicine" }
    };
    const edited = updateFeatInDraft(added, feat, changed);
    expect(
      getResolvedSkillProficiencyEntry(edited.skillProficiencies, SKILL_PROFICIENCY.ARCANA)
        .proficiencyLevel
    ).toBe(PROF_LEVEL.NONE);
    expect(
      getResolvedSkillProficiencyEntry(edited.skillProficiencies, SKILL_PROFICIENCY.MEDICINE)
        .proficiencyLevel
    ).toBe(PROF_LEVEL.EXPERT);
    const applied = applyFeatEditorDraftToCharacter({ ...original, currentHitPoints: 11 }, edited);
    const restored = normalizeCharacter(createPortableCharacterSheet(applied))!;
    expect(restored.currentHitPoints).toBe(11);
    expect(getAbilityScoreForCharacter(restored, "WIS")).toBe(13);
    expect(restored.feats).toContainEqual(changed);
    const removed = applyFeatEditorDraftToCharacter(
      restored,
      removeFeatFromDraft(createFeatEditorDraft(restored), changed)
    );
    expect(getAbilityScoreForCharacter(removed, "WIS")).toBe(12);
    expect(
      getResolvedSkillProficiencyEntry(removed.skillProficiencies, SKILL_PROFICIENCY.MEDICINE)
        .proficiencyLevel
    ).toBe(PROF_LEVEL.NONE);
  });
  it("Resilient removal keeps the class's independent saving-throw proficiency", () => {
    const original = characterFixture({ level: 4 });
    const feat: CharacterFeatEntry = {
      id: "resilient",
      feat: FEATS.RESILIENT,
      source: { type: "manual" },
      takenAtLevel: 4,
      resilient: { ability: "CON" }
    };
    const added = upsertFeatInDraft(createFeatEditorDraft(original), feat, null);
    const removed = removeFeatFromDraft(added, feat);
    expect(
      getResolvedProficiencyEntry(removed.savingThrowProficiencies, SAVING_THROW_PROFICIENCY.CON)
    ).toMatchObject({ proficiencyLevel: PROF_LEVEL.PROFICIENT, locked: true });
    expect(removed.feats).toEqual([]);
  });
  it("cannot remove a feat owned by a background through the manual editor", () => {
    const feat: CharacterFeatEntry = {
      id: "background-tough",
      feat: FEATS.TOUGH,
      source: { type: "background", background: "Farmer" },
      takenAtLevel: 1
    };
    const draft = { ...createFeatEditorDraft(characterFixture()), feats: [feat] };
    expect(removeFeatFromDraft(draft, feat)).toBe(draft);
  });
});
