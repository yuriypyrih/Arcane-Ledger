import { describe, expect, it } from "vitest";
import { getSpellEntryById, getSpellEntryByName } from "../../src/codex/spells";
import { getSpellEntries } from "../../src/codex/selectors";
import {
  getPreparedSpellSelectionOptionsForCharacter,
  normalizePreparedSpellIds
} from "../../src/pages/CharactersPage/spellcasting";

describe("spell catalog corrections", () => {
  it("removes Wild Cunning from lookup, class choices, and saved preparation", () => {
    expect(getSpellEntryById("spell-wild-cunning")).toBeNull();
    expect(getSpellEntryByName("Wild Cunning")).toBeNull();
    for (const className of ["Druid", "Ranger"]) {
      expect(
        getPreparedSpellSelectionOptionsForCharacter(className, 3).map((s) => s.id)
      ).not.toContain("spell-wild-cunning");
    }
    expect(
      normalizePreparedSpellIds(["spell-wild-cunning", "spell-cure-wounds"], getSpellEntries(), 4)
    ).toEqual(["spell-cure-wounds"]);
  });

  it("finds Bigby's Hand by name while preserving existing saved spell IDs", () => {
    const spell = getSpellEntryByName("Bigby's Hand");
    expect(spell).not.toBeNull();
    expect(getSpellEntryById("spell-arcane-hand")).toBe(spell);
    expect(getSpellEntries().filter((entry) => entry.name === "Bigby's Hand")).toHaveLength(1);
    expect(getSpellEntryByName("Arcane Hand")).toBeNull();
    expect(normalizePreparedSpellIds(["spell-arcane-hand"], getSpellEntries(), 1)).toEqual([
      "spell-arcane-hand"
    ]);
  });

  it("includes the four hand effects and their 2024 rules", () => {
    const description = getSpellEntryById("spell-arcane-hand")!.description.join(" ");
    for (const effect of ["Clenched Fist", "Forceful Hand", "Grasping Hand", "Interposing Hand"]) {
      expect(description).toContain(`<strong>${effect}.</strong>`);
    }
    for (const rule of [
      "5d8",
      "4d6",
      "Strength saving throw",
      "Dexterity saving throw",
      "spell save DC",
      "Half Cover",
      "Difficult Terrain",
      "2d8",
      "2d6"
    ]) {
      expect(description).toContain(rule);
    }
  });
});
