import { describe, expect, it } from "vitest";
import { getSpellEntries } from "../../src/codex/selectors";
import {
  normalizePreparedSpellIds,
  getAlwaysPreparedSpellIds,
  getPreparedSpellSelectionOptionsForCharacter,
  getPreparedSpellLimitForCharacter
} from "../../src/pages/CharactersPage/spellcasting";

describe("spell choices and subclass grants", () => {
  it("excludes always-prepared spells, cantrips, duplicates and invalid choices without consuming capacity", () => {
    expect(
      normalizePreparedSpellIds(
        [
          "spell-bless",
          "spell-fire-bolt",
          "missing",
          "spell-shield",
          "spell-shield",
          "spell-mage-armor",
          "spell-magic-missile"
        ],
        getSpellEntries(),
        2,
        ["spell-bless"]
      )
    ).toEqual(["spell-shield", "spell-mage-armor"]);
  });
  it.each([
    [0, []],
    [1, ["spell-shield"]],
    [2, ["spell-shield", "spell-mage-armor"]],
    [null, ["spell-shield", "spell-mage-armor", "spell-magic-missile"]]
  ] as const)("enforces preparation capacity %s after filtering choices", (limit, expected) => {
    expect(
      normalizePreparedSpellIds(
        ["missing", "spell-shield", "spell-mage-armor", "spell-magic-missile"],
        getSpellEntries(),
        limit
      )
    ).toEqual(expected);
  });
  it("offers only spells legal for the class and level", () => {
    const wizard = getPreparedSpellSelectionOptionsForCharacter("Wizard", 1).map((s) => s.id);
    expect(wizard).toContain("spell-shield");
    expect(wizard).not.toContain("spell-bless");
    expect(wizard).not.toContain("spell-fireball");
    expect(wizard).not.toContain("spell-fire-bolt");
    expect(getPreparedSpellSelectionOptionsForCharacter("Wizard", 5).map((s) => s.id)).toContain(
      "spell-fireball"
    );
    expect(getPreparedSpellLimitForCharacter("Wizard", 1)).toBe(4);
    expect(getPreparedSpellLimitForCharacter("Wizard", 3)).toBe(6);
  });
  it.each([
    [2, []],
    [3, ["spell-aid", "spell-bless", "spell-cure-wounds", "spell-lesser-restoration"]],
    [4, ["spell-aid", "spell-bless", "spell-cure-wounds", "spell-lesser-restoration"]],
    [
      5,
      [
        "spell-aid",
        "spell-bless",
        "spell-cure-wounds",
        "spell-lesser-restoration",
        "spell-mass-healing-word",
        "spell-revivify"
      ]
    ]
  ] as const)("unlocks exactly the Life Domain grants at level %i", (level, expected) => {
    const grants = getAlwaysPreparedSpellIds("Cleric", level, {}, [], "cleric-life-domain");
    expect([...grants].sort()).toEqual([...expected].sort());
  });
});
