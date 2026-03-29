import { describe, expect, it } from "vitest";
import { createDefaultAbilities, createEmptyCharacter } from "../constants";
import { applyShortRestToFeatureState, advanceFeatureStateForNewRound } from "./index";
import type { Character } from "../../../types";
import { normalizeCharacter } from "../storage";

function createCharacter(overrides: Partial<Character>): Character {
  const normalizedCharacter = normalizeCharacter({
    id: 1,
    ...createEmptyCharacter(),
    name: "Test Hero",
    species: "Human",
    className: "Bard",
    background: "Entertainer",
    abilities: {
      ...createDefaultAbilities(),
      CHA: 16
    },
    ...overrides
  });

  if (!normalizedCharacter) {
    throw new Error("Expected test character to normalize successfully.");
  }

  return normalizedCharacter;
}

describe("class feature state reducers", () => {
  it("restores bardic inspiration on short rest when the feature qualifies", () => {
    const character = createCharacter({
      className: "Bard",
      level: 5,
      classFeatureState: {
        bard: {
          bardicInspirationUsesExpended: 3
        }
      }
    });

    const restedCharacter = applyShortRestToFeatureState(character);

    expect(restedCharacter.classFeatureState?.bard?.bardicInspirationUsesExpended).toBe(0);
  });

  it("resets rogue turn flags when a new round starts", () => {
    const character = createCharacter({
      className: "Rogue",
      background: "Criminal / Spy",
      classFeatureState: {
        rogue: {
          sneakAttackUsedThisTurn: true,
          steadyAimActive: true
        }
      }
    });

    const advancedCharacter = advanceFeatureStateForNewRound(character);

    expect(advancedCharacter.classFeatureState?.rogue?.sneakAttackUsedThisTurn).toBe(false);
    expect(advancedCharacter.classFeatureState?.rogue?.steadyAimActive).toBe(false);
  });
});
