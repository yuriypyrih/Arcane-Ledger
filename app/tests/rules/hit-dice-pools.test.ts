import { describe, expect, it } from "vitest";
import {
  getHitDicePools,
  getClassHitDicePools,
  spendClassHitDice,
  restoreClassHitDice,
  getHitDiceRemainingForCharacter,
  restoreHitDicePool,
  spendHitDice
} from "../../src/pages/CharactersPage/hitDice";
import {
  createMulticlassDraft,
  applyClassProgression
} from "../../src/pages/CharactersPage/multiclassProgression";
import { readMulticlass } from "../../src/pages/CharactersPage/multiclass";
import { normalizeCharacter } from "../../src/pages/CharactersPage/storage";
import { createPortableCharacterSheet } from "../../src/pages/CharactersPage/portableCharacterSheet";
import { multiclassFixture } from "../fixtures/multiclass";
import { characterFixture } from "../fixtures/character";

function mixed() {
  return multiclassFixture(
    [
      { className: "Wizard", level: 2 },
      { className: "Sorcerer", level: 2 },
      { className: "Fighter", level: 3 },
      { className: "Barbarian", level: 1 }
    ],
    { currentHitPoints: 12 }
  );
}

describe("manual Hit Dice pool management", () => {
  it("combines matching dice and keeps different dice independent", () => {
    expect(getHitDicePools(mixed())).toEqual([
      { die: "d6", remaining: 4, total: 4 },
      { die: "d10", remaining: 3, total: 3 },
      { die: "d12", remaining: 1, total: 1 }
    ]);
  });
  it("spends and restores only the selected pool, updates the total, and survives reload", () => {
    const original = mixed();
    let character = spendHitDice(original, "d6", 2);
    character = spendHitDice(character, "d10", 1);
    character = restoreHitDicePool(character, "d6", 1);
    expect(getClassHitDicePools(character).map((pool) => pool.remaining)).toEqual([1, 2, 2, 1]);
    expect(character.multiclass?.hitDiceExpended).toBeUndefined();
    expect(character.hitDiceRemaining).toBe(6);
    character = restoreHitDicePool(character, "d6");
    const reopened = normalizeCharacter(createPortableCharacterSheet(character))!;
    expect(getHitDicePools(reopened)).toEqual([
      { die: "d6", remaining: 4, total: 4 },
      { die: "d10", remaining: 2, total: 3 },
      { die: "d12", remaining: 1, total: 1 }
    ]);
    expect(getHitDiceRemainingForCharacter(reopened)).toBe(7);
    expect(reopened.currentHitPoints).toBe(original.currentHitPoints);
  });
  it("clamps a reset to the pool capacity and never changes unrelated pools", () => {
    const character = spendHitDice(spendHitDice(mixed(), "d6", 4), "d10", 3);
    expect(
      getClassHitDicePools(restoreHitDicePool(character, "d6", 99)).map((pool) => pool.remaining)
    ).toEqual([2, 2, 0, 1]);
    expect(spendHitDice(character, "d6", 1)).toBe(character);
    expect(restoreHitDicePool(character, "d8", 1)).toBe(character);
  });
  it.each([0, -1, 0.5, NaN])("ignores invalid restore amounts (%s)", (count) => {
    const character = spendHitDice(mixed(), "d6", 1);
    expect(restoreHitDicePool(character, "d6", count)).toBe(character);
  });
  it("preserves the legacy single-class format for spending and resets", () => {
    const original = characterFixture({
      className: "Fighter",
      level: 3,
      xp: 900,
      hitDiceRemaining: 3
    });
    const spent = spendHitDice(original, "d10", 2);
    const restored = restoreHitDicePool(spent, "d10", 1);
    expect(restored.hitDiceRemaining).toBe(2);
    expect(restoreHitDicePool(restored, "d10").hitDiceRemaining).toBe(3);
    const portable = createPortableCharacterSheet(restored);
    expect(portable.schemaVersion).toBe(2);
    expect(normalizeCharacter(portable)!.hitDiceRemaining).toBe(2);
  });
});

describe("class-owned Hit Dice", () => {
  it("spends and resets identical dice independently, including after a save/load", () => {
    const original = mixed();
    const wizardId = original.multiclass!.startingClassId;
    const spent = spendClassHitDice(spendClassHitDice(original, wizardId, 1), "class-1", 2);
    expect(
      getClassHitDicePools(spent).map((pool) => [pool.className, pool.die, pool.remaining])
    ).toEqual([
      ["Wizard", "d6", 1],
      ["Sorcerer", "d6", 0],
      ["Fighter", "d10", 3],
      ["Barbarian", "d12", 1]
    ]);
    const reset = restoreClassHitDice(spent, "class-1");
    const reopened = normalizeCharacter(createPortableCharacterSheet(reset))!;
    expect(getClassHitDicePools(reopened).map((pool) => pool.remaining)).toEqual([1, 2, 3, 1]);
    expect(reopened.hitDiceRemaining).toBe(7);
    expect(reopened.currentHitPoints).toBe(original.currentHitPoints);
    expect(reopened.multiclass?.hitDiceExpended).toBeUndefined();
    expect(spendClassHitDice(reopened, wizardId, 2)).toBe(reopened);
    expect(restoreClassHitDice(reopened, "missing")).toBe(reopened);
  });
  it("preserves old die-size spending and pins ownership before levels are redistributed", () => {
    const original = mixed();
    original.multiclass = {
      ...original.multiclass!,
      hitDiceExpendedByClass: undefined,
      hitDiceExpended: { d6: 3, d10: 1 }
    };
    expect(getClassHitDicePools(original).map((pool) => pool.remaining)).toEqual([0, 1, 2, 1]);
    const draft = createMulticlassDraft(original);
    expect(draft.hitDiceExpended).toBeUndefined();
    draft.classes = [...draft.classes].reverse();
    const saved = applyClassProgression(original, draft);
    const byClass = Object.fromEntries(
      getClassHitDicePools(saved).map((pool) => [pool.className, pool.remaining])
    );
    expect(byClass).toEqual({ Wizard: 0, Sorcerer: 1, Fighter: 2, Barbarian: 1 });
    expect(getHitDiceRemainingForCharacter(saved)).toBe(4);
  });
  it("retains spends when a class gains a level and prunes counters of removed classes", () => {
    const spent = spendClassHitDice(mixed(), "class-1", 2);
    const draft = createMulticlassDraft(spent);
    draft.classes[1].level = 3;
    const leveled = applyClassProgression(spent, draft);
    expect(getClassHitDicePools(leveled)[1].remaining).toBe(1);
    const removed = createMulticlassDraft(leveled);
    removed.classes = removed.classes.filter((entry) => entry.id !== "class-1");
    const saved = applyClassProgression(leveled, removed);
    expect(saved.multiclass?.hitDiceExpendedByClass?.["class-1"]).toBeUndefined();
  });
  it.each([-1, 0.5, "1", null, []])("rejects malformed stored class spending (%j)", (count) => {
    const draft = createMulticlassDraft(mixed());
    expect(
      readMulticlass({ ...draft, hitDiceExpendedByClass: { [draft.startingClassId]: count } })
    ).toBeNull();
  });
  it.each([0, -1, 0.5, NaN])("ignores invalid class restore amounts (%s)", (count) => {
    const spent = spendClassHitDice(mixed(), "class-1", 1);
    expect(restoreClassHitDice(spent, "class-1", count)).toBe(spent);
  });
});
