import { characterFixture } from "../fixtures/character";
import { describe, expect, it } from "vitest";
import {
  getMonkFocusPointsRemainingForCharacter,
  expendMonkFocusPointForCharacter,
  applyShortRestToFeatureState,
  getBarbarianRageUsesRemainingForCharacter,
  expendBarbarianRageUseForCharacter,
  applyLongRestToFeatureState
} from "../../src/pages/CharactersPage/classFeatures";
import {
  getFighterSecondWindUsesRemainingForCharacter,
  consumeFighterSecondWindUseForCharacter,
  restoreFighterSecondWindOnShortRestForCharacter,
  restoreFighterSecondWindOnLongRestForCharacter
} from "../../src/pages/CharactersPage/classFeatures/resources";
import {
  createShortRestOptions,
  createLongRestOptions
} from "../../src/components/CharactersPage/CharacterSheetPage/GameplayForm/widgets/restOptions";

describe("spending and recovering class resources", () => {
  it("Focus cannot go below zero and a short rest restores the pool", () => {
    let monk = characterFixture({
      className: "Monk",
      subclassId: "monk-warrior-of-the-open-hand",
      level: 5,
      xp: 6500
    });
    expect(getMonkFocusPointsRemainingForCharacter(monk)).toBe(5);
    for (let i = 0; i < 8; i++) monk = expendMonkFocusPointForCharacter(monk);
    expect(getMonkFocusPointsRemainingForCharacter(monk)).toBe(0);
    expect(getMonkFocusPointsRemainingForCharacter(applyShortRestToFeatureState(monk))).toBe(5);
  });
  it("Second Wind restores one use on a short rest and all uses on a long rest", () => {
    let fighter = characterFixture();
    const total = getFighterSecondWindUsesRemainingForCharacter(fighter);
    for (let i = 0; i < total; i++) fighter = consumeFighterSecondWindUseForCharacter(fighter);
    expect(getFighterSecondWindUsesRemainingForCharacter(fighter)).toBe(0);
    expect(
      getFighterSecondWindUsesRemainingForCharacter(
        restoreFighterSecondWindOnShortRestForCharacter(fighter)
      )
    ).toBe(1);
    expect(
      getFighterSecondWindUsesRemainingForCharacter(
        restoreFighterSecondWindOnLongRestForCharacter(fighter)
      )
    ).toBe(total);
    expect(createShortRestOptions(fighter).some((o) => /Second Wind/i.test(o.label))).toBe(true);
    expect(createLongRestOptions(fighter).some((o) => /Second Wind/i.test(o.label))).toBe(true);
  });
  it("Rage spending preserves other fields and a long rest recovers the pool", () => {
    const barbarian = characterFixture({
      className: "Barbarian",
      subclassId: "barbarian-berserker"
    });
    const total = getBarbarianRageUsesRemainingForCharacter(barbarian);
    const spent = expendBarbarianRageUseForCharacter(barbarian);
    expect(getBarbarianRageUsesRemainingForCharacter(spent)).toBe(total - 1);
    expect(spent.currentHitPoints).toBe(barbarian.currentHitPoints);
    expect(getBarbarianRageUsesRemainingForCharacter(applyLongRestToFeatureState(spent))).toBe(
      total
    );
  });
});
