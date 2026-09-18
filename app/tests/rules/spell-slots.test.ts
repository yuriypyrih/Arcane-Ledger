import { describe, expect, it } from "vitest";
import {
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended
} from "../../src/pages/CharactersPage/spellSlots";

describe("spell slot progression", () => {
  it.each([
    ["Wizard", 1, undefined, [2, 0, 0]],
    ["Wizard", 5, undefined, [4, 3, 2]],
    ["Paladin", 5, undefined, [4, 2, 0]],
    ["Fighter", 5, "fighter-champion", [0, 0, 0]],
    ["Fighter", 3, "fighter-eldritch-knight", [2, 0, 0]],
    ["Rogue", 3, "rogue-arcane-trickster", [2, 0, 0]]
  ])(
    "%s level %i (%s) has the expected spell capacity",
    (className, level, subclassId, expected) => {
      expect(getSpellSlotTotalsForCharacter(className, level, subclassId).slice(0, 3)).toEqual(
        expected
      );
    }
  );
  it("clamps spent slots when changing level/class", () => {
    expect(normalizeSpellSlotsExpended([9, -1, 4], [4, 2, 0])).toEqual([4, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

it.each([
  ["Wizard", 20, undefined, [4, 3, 3, 3, 3, 2, 2, 1, 1]],
  ["Warlock", 3, undefined, [0, 2, 0, 0, 0, 0, 0, 0, 0]],
  ["Warlock", 17, undefined, [0, 0, 0, 0, 4, 0, 0, 0, 0]],
  ["Fighter", 20, "fighter-eldritch-knight", [4, 3, 3, 1, 0, 0, 0, 0, 0]],
  ["Fighter", 20, "fighter-champion", [0, 0, 0, 0, 0, 0, 0, 0, 0]]
])(
  "%s at level %i has the complete nine-level slot progression",
  (className, level, subclassId, expected) => {
    expect(getSpellSlotTotalsForCharacter(className, level, subclassId)).toEqual(expected);
  }
);
