import { describe, expect, it } from "vitest";
import { PROF_LEVEL, PROFICIENCY_SOURCE } from "../../types";
import {
  getSkillProficiencyForName,
  normalizeCharacterProficiencies
} from "./proficiency";

describe("normalizeCharacterProficiencies", () => {
  it("merges legacy manual expertise with automatic background proficiencies", () => {
    const normalizedProficiencies = normalizeCharacterProficiencies({
      className: "Rogue",
      level: 1,
      species: "Human",
      background: "Acolyte",
      legacySkills: ["Stealth"],
      legacySkillExpertise: ["Stealth"]
    });

    const stealthEntry = normalizedProficiencies.skillProficiencies.find(
      (entry) => entry.proficiency === getSkillProficiencyForName("Stealth")
    );
    const religionEntry = normalizedProficiencies.skillProficiencies.find(
      (entry) => entry.proficiency === getSkillProficiencyForName("Religion")
    );

    expect(stealthEntry?.proficiencyLevel).toBe(PROF_LEVEL.EXPERT);
    expect(stealthEntry?.source).toBe(PROFICIENCY_SOURCE.MANUAL);
    expect(religionEntry?.source).toBe(PROFICIENCY_SOURCE.BACKGROUND);
  });
});
