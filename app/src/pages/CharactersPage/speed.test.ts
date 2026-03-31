import { describe, expect, it } from "vitest";
import type { Character } from "../../types";
import { createDefaultAbilities, createEmptyCharacter } from "./constants";
import { normalizeCharacter } from "./storage";
import {
  getMovementSpeedBreakdownsForCharacter,
  hasModifiedSpecialMovementForCharacter
} from "./speed";

function createCharacter(overrides: Partial<Character>): Character {
  const normalizedCharacter = normalizeCharacter({
    id: 1,
    ...createEmptyCharacter(),
    name: "Test Hero",
    species: "Human",
    className: "Barbarian",
    background: "Criminal / Spy",
    abilities: createDefaultAbilities(),
    ...overrides
  });

  if (!normalizedCharacter) {
    throw new Error("Expected test character to normalize successfully.");
  }

  return normalizedCharacter;
}

describe("movement speeds", () => {
  it("derives default climb and swim from walk speed and leaves fly unavailable", () => {
    const character = createCharacter({
      className: "Fighter",
      level: 1
    });

    const movement = getMovementSpeedBreakdownsForCharacter(character);

    expect(movement.walk.total).toBe(30);
    expect(movement.climb.total).toBe(15);
    expect(movement.swim.total).toBe(15);
    expect(movement.fly.total).toBeNull();
    expect(hasModifiedSpecialMovementForCharacter(character)).toBe(false);
  });

  it("lets aspect of the wilds set climb or swim equal to walk speed", () => {
    const pantherCharacter = createCharacter({
      level: 6,
      subclassId: "barbarian-path-of-the-wild-heart",
      classFeatureState: {
        rage: {
          usesExpended: 0,
          active: false,
          wildHeartAspect: "panther"
        }
      }
    });
    const salmonCharacter = createCharacter({
      level: 6,
      subclassId: "barbarian-path-of-the-wild-heart",
      classFeatureState: {
        rage: {
          usesExpended: 0,
          active: false,
          wildHeartAspect: "salmon"
        }
      }
    });

    const pantherMovement = getMovementSpeedBreakdownsForCharacter(pantherCharacter);
    const salmonMovement = getMovementSpeedBreakdownsForCharacter(salmonCharacter);

    expect(pantherMovement.walk.total).toBe(40);
    expect(pantherMovement.climb.total).toBe(40);
    expect(pantherMovement.swim.total).toBe(20);
    expect(hasModifiedSpecialMovementForCharacter(pantherCharacter)).toBe(true);

    expect(salmonMovement.walk.total).toBe(40);
    expect(salmonMovement.climb.total).toBe(20);
    expect(salmonMovement.swim.total).toBe(40);
    expect(hasModifiedSpecialMovementForCharacter(salmonCharacter)).toBe(true);
  });

  it("lets power of the wilds falcon set fly speed equal to walk speed while raging", () => {
    const character = createCharacter({
      level: 14,
      subclassId: "barbarian-path-of-the-wild-heart",
      classFeatureState: {
        rage: {
          usesExpended: 1,
          active: true,
          wildHeartRageOption: "bear",
          wildHeartPowerOption: "falcon"
        }
      }
    });

    const movement = getMovementSpeedBreakdownsForCharacter(character);

    expect(movement.walk.total).toBe(40);
    expect(movement.fly.total).toBe(40);
    expect(movement.fly.baseExpression).toEqual(
      expect.objectContaining({
        kind: "walk",
        walkValue: 40,
        multiplier: 1,
        sourceLabel: "Falcon"
      })
    );
    expect(hasModifiedSpecialMovementForCharacter(character)).toBe(true);
  });
});
