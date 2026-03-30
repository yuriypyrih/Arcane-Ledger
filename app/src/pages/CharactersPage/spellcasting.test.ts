import { describe, expect, it } from "vitest";
import type { Character } from "../../types";
import { createDefaultAbilities, createEmptyCharacter } from "./constants";
import { normalizeCharacter } from "./storage";
import { getSpellSelectionInputStatusForCharacter } from "./spellSelection";
import {
  getPreparedSpellSelectionOptionsForCharacter,
  normalizePreparedSpellIds
} from "./spellcasting";

function createCharacter(overrides: Partial<Character>): Character {
  const normalizedCharacter = normalizeCharacter({
    id: 1,
    ...createEmptyCharacter(),
    name: "Test Hero",
    species: "Human",
    className: "Cleric",
    background: "Entertainer",
    abilities: {
      ...createDefaultAbilities(),
      WIS: 16,
      CHA: 14
    },
    ...overrides
  });

  if (!normalizedCharacter) {
    throw new Error("Expected test character to normalize successfully.");
  }

  return normalizedCharacter;
}

describe("normalizePreparedSpellIds", () => {
  it("deduplicates ids, removes invalid spells, and honors the limit", () => {
    const availableSpells = getPreparedSpellSelectionOptionsForCharacter("Cleric", 1);
    const normalizedSpellIds = normalizePreparedSpellIds(
      ["spell-healing-word", "spell-guidance", "spell-magic-missile", "spell-healing-word"],
      availableSpells,
      1
    );

    expect(normalizedSpellIds).toEqual(["spell-healing-word"]);
  });

  it("reports missing spellcasting inputs for cantrips, spells, and invocations", () => {
    const cleric = createCharacter({
      className: "Cleric",
      level: 1,
      cantripIds: [],
      preparedSpellIds: []
    });
    const warlock = createCharacter({
      className: "Warlock",
      level: 2,
      cantripIds: [],
      preparedSpellIds: [],
      classFeatureState: {
        warlock: {
          eldritchInvocationIds: []
        }
      }
    });

    const clericInputStatus = getSpellSelectionInputStatusForCharacter(cleric);
    const warlockInputStatus = getSpellSelectionInputStatusForCharacter(warlock);

    expect(clericInputStatus).toEqual(
      expect.objectContaining({
        hasInputRequired: true,
        needsCantrips: true,
        needsPreparedSpells: true
      })
    );
    expect(clericInputStatus.message).toContain("cantrips and spells");
    expect(warlockInputStatus).toEqual(
      expect.objectContaining({
        hasInputRequired: true,
        needsInvocations: true
      })
    );
    expect(warlockInputStatus.message).toContain("eldritch invocations");
  });
});
