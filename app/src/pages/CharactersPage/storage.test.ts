import { describe, expect, it } from "vitest";
import { PROFICIENCY_SOURCE, SKILL_PROFICIENCY } from "../../types";
import { normalizeCharacter } from "./storage";

describe("normalizeCharacter", () => {
  it("normalizes legacy persisted fields and clamps invalid values", () => {
    const normalizedCharacter = normalizeCharacter({
      id: 7,
      name: "Mira",
      role: "Cleric",
      species: "Elf",
      level: "3",
      xp: "950",
      hitPoints: 12,
      currentHitPoints: 99,
      temporaryHitPoints: -4,
      background: "Unknown Background",
      currencies: {
        gold: -10,
        silver: 12.8
      },
      knownSpellIds: ["spell-healing-word", "spell-healing-word"],
      cantripIds: ["spell-guidance", "spell-fire-bolt", "spell-guidance"]
    });

    expect(normalizedCharacter).not.toBeNull();
    expect(normalizedCharacter?.className).toBe("Cleric");
    expect(normalizedCharacter?.background).toBe("");
    expect(normalizedCharacter?.currentHitPoints).toBe(12);
    expect(normalizedCharacter?.temporaryHitPoints).toBe(0);
    expect(normalizedCharacter?.currencies.gold).toBe(0);
    expect(normalizedCharacter?.currencies.silver).toBe(12);
    expect(normalizedCharacter?.preparedSpellIds).toEqual(["spell-healing-word"]);
    expect(normalizedCharacter?.cantripIds).toEqual(["spell-guidance"]);
  });

  it("bakes legacy builder skill selections into class-sourced proficiency entries", () => {
    const normalizedCharacter = normalizeCharacter({
      id: 9,
      name: "Rok",
      className: "Barbarian",
      species: "Elf",
      background: "Acolyte",
      level: 1,
      xp: 0,
      hitPoints: 12,
      currentHitPoints: 12,
      abilities: {
        STR: 15,
        DEX: 14,
        CON: 15,
        INT: 8,
        WIS: 10,
        CHA: 8
      },
      skills: ["Athletics", "Intimidation"]
    });

    expect(normalizedCharacter).not.toBeNull();
    expect(
      normalizedCharacter?.skillProficiencies.some(
        (entry) =>
          entry.source === PROFICIENCY_SOURCE.CLASS &&
          entry.sourceStr === "Barbarian" &&
          entry.proficiency === SKILL_PROFICIENCY.ATHLETICS
      )
    ).toBe(true);
    expect(
      normalizedCharacter?.skillProficiencies.some(
        (entry) =>
          entry.source === PROFICIENCY_SOURCE.SPECIES &&
          entry.sourceStr === "Elf" &&
          entry.proficiency === SKILL_PROFICIENCY.PERCEPTION
      )
    ).toBe(true);
  });
});
