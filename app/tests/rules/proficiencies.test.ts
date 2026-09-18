import { describe, expect, it } from "vitest";
import {
  PROF_LEVEL,
  PROFICIENCY_SOURCE,
  SKILL_PROFICIENCY,
  SAVING_THROW_PROFICIENCY,
  ARMOR_PROFICIENCY,
  WEAPON_PROFICIENCY,
  TOOL_PROFICIENCY,
  LANGUAGE_PROFICIENCY
} from "../../src/types";
import {
  createSkillEntry,
  createSavingThrowEntry,
  createArmorEntry,
  createWeaponEntry,
  createToolEntry,
  createLanguageEntry,
  getResolvedSkillProficiencyEntry,
  getResolvedProficiencyEntry,
  upsertManualSkillEntry,
  isManualSkillLevelSelectable,
  mergeProficiencyEntries
} from "../../src/pages/CharactersPage/proficiency";
import { getSkillRowsByAbility } from "../../src/pages/CharactersPage/skills";
import { characterFixture } from "../fixtures/character";

const arcana = SKILL_PROFICIENCY.ARCANA;
const granted = () =>
  createSkillEntry(arcana, PROFICIENCY_SOURCE.CLASS, "Wizard", PROF_LEVEL.PROFICIENT);

describe("proficiency sources and numerical bonuses", () => {
  it.each([
    [1, PROF_LEVEL.NONE, 3],
    [1, PROF_LEVEL.PROFICIENT, 5],
    [1, PROF_LEVEL.EXPERT, 7],
    [5, PROF_LEVEL.PROFICIENT, 6],
    [5, PROF_LEVEL.EXPERT, 9],
    [17, PROF_LEVEL.EXPERT, 15]
  ] as const)("level %i Arcana %s has modifier %i", (level, proficiencyLevel, totalModifier) => {
    const character = characterFixture({ level, xp: 0 });
    const entries = [
      createSkillEntry(arcana, PROFICIENCY_SOURCE.MANUAL, undefined, proficiencyLevel)
    ];
    expect(
      getSkillRowsByAbility(character, entries)
        .flatMap((g) => g.rows)
        .find((r) => r.name === "Arcana")
    ).toMatchObject({ totalModifier });
  });
  it("manual expertise upgrades an automatic proficiency without erasing its source", () => {
    const initial = [granted()];
    const upgraded = upsertManualSkillEntry(initial, arcana, PROF_LEVEL.EXPERT);
    expect(getResolvedSkillProficiencyEntry(upgraded, arcana)).toMatchObject({
      proficiencyLevel: PROF_LEVEL.EXPERT,
      locked: true
    });
    expect(upgraded).toContainEqual(granted());
    expect(initial).toEqual([granted()]);
    expect(
      getResolvedSkillProficiencyEntry(
        upsertManualSkillEntry(upgraded, arcana, PROF_LEVEL.NONE),
        arcana
      )
    ).toMatchObject({ proficiencyLevel: PROF_LEVEL.PROFICIENT, sourceLabels: ["Wizard"] });
  });
  it("cannot select a manual level below a granted floor", () => {
    expect(isManualSkillLevelSelectable([granted()], arcana, PROF_LEVEL.NONE)).toBe(false);
    expect(isManualSkillLevelSelectable([granted()], arcana, PROF_LEVEL.PROFICIENT)).toBe(true);
    expect(isManualSkillLevelSelectable([granted()], arcana, PROF_LEVEL.EXPERT)).toBe(true);
  });
  it("overlapping expertise grants do not multiply the proficiency bonus again", () => {
    const entries = ["Class expertise", "Feat expertise"].map((source) =>
      createSkillEntry(arcana, PROFICIENCY_SOURCE.FEAT, source, PROF_LEVEL.EXPERT)
    );
    const resolved = getResolvedSkillProficiencyEntry(entries, arcana);
    expect(resolved.sourceLabels).toEqual(
      expect.arrayContaining(["Class expertise", "Feat expertise"])
    );
    expect(
      getSkillRowsByAbility(characterFixture(), entries)
        .flatMap((g) => g.rows)
        .find((r) => r.name === "Arcana")?.totalModifier
    ).toBe(7);
  });
  it("deduplicates a repeated source while retaining independent grants", () => {
    const other = createSkillEntry(
      arcana,
      PROFICIENCY_SOURCE.FEAT,
      "Skilled",
      PROF_LEVEL.PROFICIENT
    );
    expect(mergeProficiencyEntries([granted(), granted(), other])).toHaveLength(2);
    expect(getResolvedSkillProficiencyEntry([other], arcana).proficiencyLevel).toBe(
      PROF_LEVEL.PROFICIENT
    );
    expect(getResolvedSkillProficiencyEntry([], arcana).proficiencyLevel).toBe(PROF_LEVEL.NONE);
  });
  it.each([
    createSavingThrowEntry(
      SAVING_THROW_PROFICIENCY.WIS,
      PROFICIENCY_SOURCE.CLASS,
      "Cleric",
      PROF_LEVEL.PROFICIENT
    ),
    createArmorEntry(
      ARMOR_PROFICIENCY.HEAVY,
      PROFICIENCY_SOURCE.CLASS,
      "Fighter",
      PROF_LEVEL.PROFICIENT
    ),
    createWeaponEntry(
      WEAPON_PROFICIENCY.SIMPLE,
      PROFICIENCY_SOURCE.CLASS,
      "Fighter",
      PROF_LEVEL.PROFICIENT
    ),
    createToolEntry(
      TOOL_PROFICIENCY.THIEVES_TOOLKIT,
      PROFICIENCY_SOURCE.CLASS,
      "Rogue",
      PROF_LEVEL.PROFICIENT
    ),
    createLanguageEntry(
      LANGUAGE_PROFICIENCY.ELVISH,
      PROFICIENCY_SOURCE.SPECIES,
      "Elf",
      PROF_LEVEL.PROFICIENT
    )
  ])("preserves the automatic $proficiency grant against a manual removal", (entry) => {
    const manual = {
      ...entry,
      source: PROFICIENCY_SOURCE.MANUAL,
      sourceStr: undefined,
      proficiencyLevel: PROF_LEVEL.NONE
    };
    expect(getResolvedProficiencyEntry([entry, manual], entry.proficiency)).toMatchObject({
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      locked: true,
      sourceLabels: [entry.sourceStr]
    });
    expect(getResolvedProficiencyEntry([manual], entry.proficiency).proficiencyLevel).toBe(
      PROF_LEVEL.NONE
    );
  });
});
