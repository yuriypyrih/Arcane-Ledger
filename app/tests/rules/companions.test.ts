import { describe, expect, it } from "vitest";
import {
  applyDamageToCharacterCompanion,
  applyHealingToCharacterCompanion,
  getCompanionStatusLabel,
  normalizeCharacterCompanions
} from "../../src/pages/CharactersPage/companions";

function companion() {
  return normalizeCharacterCompanions([
    { id: "owl", name: "Owl", maxHitPoints: 10, currentHitPoints: 10, temporaryHitPoints: 4 }
  ])[0];
}
describe("companion health", () => {
  it("absorbs damage with temporary HP before health without changing the original", () => {
    const original = companion();
    const hurt = applyDamageToCharacterCompanion(original, 7);
    expect(hurt).toMatchObject({ currentHitPoints: 7, temporaryHitPoints: 0 });
    expect(original.currentHitPoints).toBe(10);
    expect(original.temporaryHitPoints).toBe(4);
  });
  it("heals only up to maximum and clears death saves when revived", () => {
    const hurt = { ...companion(), currentHitPoints: 0, deathSaves: { successes: 1, failures: 2 } };
    expect(applyHealingToCharacterCompanion(hurt, 30)).toMatchObject({
      currentHitPoints: 10,
      deathSaves: { successes: 0, failures: 0 }
    });
  });
  it("distinguishes unconsciousness and massive-damage instant death", () => {
    expect(getCompanionStatusLabel(applyDamageToCharacterCompanion(companion(), 14))).toBe(
      "Unconscious"
    );
    expect(getCompanionStatusLabel(applyDamageToCharacterCompanion(companion(), 24))).toBe(
      "Instant Death"
    );
  });
  it("does not accept negative damage or duplicate companions", () => {
    const original = companion();
    expect(applyDamageToCharacterCompanion(original, -9)).toBe(original);
    expect(normalizeCharacterCompanions([original, original, { name: "" }])).toHaveLength(1);
  });
});
