import { describe, expect, it } from "vitest";
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
});
