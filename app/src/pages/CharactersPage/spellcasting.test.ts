import { describe, expect, it } from "vitest";
import {
  getPreparedSpellSelectionOptionsForCharacter,
  normalizePreparedSpellIds
} from "./spellcasting";

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
});
