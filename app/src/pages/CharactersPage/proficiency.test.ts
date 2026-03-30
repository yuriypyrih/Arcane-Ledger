import { describe, expect, it } from "vitest";
import { PROF_LEVEL, PROFICIENCY_SOURCE, SAVING_THROW_PROFICIENCY, SKILL } from "../../types";
import {
  getSelectedClassSkillSelectionsFromEntries,
  getSavingThrowLevelFromEntries,
  getResolvedSkillProficiencyEntry,
  getSkillProficiencyForName,
  normalizeCharacterProficiencies,
  upsertManualSkillEntry
} from "./proficiency";

describe("normalizeCharacterProficiencies", () => {
  it("merges legacy manual expertise with automatic background proficiencies", () => {
    const normalizedProficiencies = normalizeCharacterProficiencies({
      className: "Rogue",
      level: 1,
      species: "Human",
      background: "Acolyte",
      legacySkills: [SKILL.STEALTH],
      legacySkillExpertise: [SKILL.STEALTH]
    });

    const stealthEntry = normalizedProficiencies.skillProficiencies.find(
      (entry) => entry.proficiency === getSkillProficiencyForName(SKILL.STEALTH)
    );
    const religionEntry = normalizedProficiencies.skillProficiencies.find(
      (entry) => entry.proficiency === getSkillProficiencyForName(SKILL.RELIGION)
    );

    expect(stealthEntry?.proficiencyLevel).toBe(PROF_LEVEL.EXPERT);
    expect(stealthEntry?.source).toBe(PROFICIENCY_SOURCE.MANUAL);
    expect(religionEntry?.source).toBe(PROFICIENCY_SOURCE.BACKGROUND);
  });

  it("does not auto-grant class skill options that should remain player choices", () => {
    const normalizedProficiencies = normalizeCharacterProficiencies({
      className: "Barbarian",
      level: 1,
      species: "Human",
      background: "Acolyte"
    });
    const athleticsProficiency = getSkillProficiencyForName(SKILL.ATHLETICS);
    const religionProficiency = getSkillProficiencyForName(SKILL.RELIGION);

    if (!athleticsProficiency || !religionProficiency) {
      throw new Error("Expected athletics and religion proficiencies to exist.");
    }

    const religionResolved = getResolvedSkillProficiencyEntry(
      normalizedProficiencies.skillProficiencies,
      religionProficiency
    );
    const attemptedOverride = upsertManualSkillEntry(
      normalizedProficiencies.skillProficiencies,
      athleticsProficiency,
      PROF_LEVEL.NONE
    );

    expect(
      getResolvedSkillProficiencyEntry(normalizedProficiencies.skillProficiencies, athleticsProficiency)
        .proficiencyLevel
    ).toBe(PROF_LEVEL.NONE);
    expect(religionResolved.locked).toBe(true);
    expect(
      getResolvedSkillProficiencyEntry(attemptedOverride, athleticsProficiency).proficiencyLevel
    ).toBe(PROF_LEVEL.NONE);
  });

  it("keeps class saving throw proficiencies derived even when skill choices stay unselected", () => {
    const normalizedProficiencies = normalizeCharacterProficiencies({
      className: "Barbarian",
      level: 1,
      species: "Human",
      background: "Acolyte"
    });

    expect(
      getSavingThrowLevelFromEntries(
        normalizedProficiencies.savingThrowProficiencies,
        SAVING_THROW_PROFICIENCY.STR
      )
    ).toBe(PROF_LEVEL.PROFICIENT);
    expect(
      getSavingThrowLevelFromEntries(
        normalizedProficiencies.savingThrowProficiencies,
        SAVING_THROW_PROFICIENCY.CON
      )
    ).toBe(PROF_LEVEL.PROFICIENT);
  });

  it("bakes class skill selections as class-sourced entries instead of manual overrides", () => {
    const normalizedProficiencies = normalizeCharacterProficiencies({
      className: "Barbarian",
      level: 1,
      species: "Human",
      background: "Acolyte",
      legacySkills: [SKILL.ATHLETICS, SKILL.INTIMIDATION]
    });
    const athleticsProficiency = getSkillProficiencyForName(SKILL.ATHLETICS);

    if (!athleticsProficiency) {
      throw new Error("Expected athletics proficiency to exist.");
    }

    const athleticsEntries = normalizedProficiencies.skillProficiencies.filter(
      (entry) => entry.proficiency === athleticsProficiency
    );

    expect(getSelectedClassSkillSelectionsFromEntries(normalizedProficiencies.skillProficiencies, "Barbarian")).toEqual([
      SKILL.ATHLETICS,
      SKILL.INTIMIDATION
    ]);
    expect(athleticsEntries.some((entry) => entry.source === PROFICIENCY_SOURCE.CLASS)).toBe(true);
    expect(athleticsEntries.some((entry) => entry.source === PROFICIENCY_SOURCE.MANUAL)).toBe(false);
  });

  it("adds primal knowledge skill choices as locked feature-granted proficiencies", () => {
    const normalizedProficiencies = normalizeCharacterProficiencies({
      className: "Barbarian",
      level: 3,
      species: "Human",
      background: "Acolyte",
      classFeatureState: {
        rage: {
          usesExpended: 0,
          active: false,
          primalKnowledgeSkill: SKILL.PERCEPTION
        }
      }
    });
    const perceptionProficiency = getSkillProficiencyForName(SKILL.PERCEPTION);

    if (!perceptionProficiency) {
      throw new Error("Expected perception proficiency to exist.");
    }

    const perceptionEntries = normalizedProficiencies.skillProficiencies.filter(
      (entry) => entry.proficiency === perceptionProficiency
    );

    expect(
      perceptionEntries.some(
        (entry) =>
          entry.source === PROFICIENCY_SOURCE.CLASS &&
          entry.sourceStr === "Primal Knowledge" &&
          entry.proficiencyLevel === PROF_LEVEL.PROFICIENT
      )
    ).toBe(true);
    expect(
      getResolvedSkillProficiencyEntry(
        normalizedProficiencies.skillProficiencies,
        perceptionProficiency
      ).locked
    ).toBe(true);
  });
});
