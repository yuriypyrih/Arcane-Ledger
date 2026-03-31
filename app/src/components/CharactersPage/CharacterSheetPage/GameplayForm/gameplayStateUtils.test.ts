import { describe, expect, it } from "vitest";
import type { Character } from "../../../../types";
import {
  CONDITION_NAME,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../types";
import { createDefaultAbilities, createEmptyCharacter } from "../../../../pages/CharactersPage/constants";
import { normalizeCharacter } from "../../../../pages/CharactersPage/storage";
import { createCharacterStatusEntry } from "../../../../pages/CharactersPage/traits";
import {
  consumeRoundTrackerResourceForCharacter,
  createTemporaryHitPointsAssignment,
  swapTemporaryHitPointsAssignment
} from "./gameplayStateUtils";

function createCharacter(overrides: Partial<Character>): Character {
  const normalizedCharacter = normalizeCharacter({
    id: 1,
    ...createEmptyCharacter(),
    name: "Test Hero",
    species: "Human",
    className: "Rogue",
    background: "Criminal / Spy",
    abilities: createDefaultAbilities(),
    ...overrides
  });

  if (!normalizedCharacter) {
    throw new Error("Expected test character to normalize successfully.");
  }

  return normalizedCharacter;
}

describe("consumeRoundTrackerResourceForCharacter", () => {
  it("auto-starts the turn before consuming an available action", () => {
    const character = createCharacter({
      roundTracker: {
        turnStarted: false,
        actionAvailable: true,
        bonusActionAvailable: false,
        reactionAvailable: false
      },
      classFeatureState: {
        rogue: {
          sneakAttackUsedThisTurn: true,
          steadyAimActive: true
        }
      },
      statusEntries: [
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.CONDITIONS,
          value: CONDITION_NAME.INVISIBLE,
          source: "Test",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
          duration: {
            kind: STATUS_DURATION_KIND.ROUNDS,
            amount: 2,
            tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
          }
        })
      ]
    });

    const nextCharacter = consumeRoundTrackerResourceForCharacter(character, "action");

    expect(nextCharacter.roundTracker).toEqual({
      turnStarted: true,
      actionAvailable: false,
      bonusActionAvailable: true,
      reactionAvailable: true
    });
    expect(nextCharacter.classFeatureState?.rogue?.sneakAttackUsedThisTurn).toBe(false);
    expect(nextCharacter.classFeatureState?.rogue?.steadyAimActive).toBe(false);
    expect(nextCharacter.statusEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: CONDITION_NAME.INVISIBLE,
          duration: expect.objectContaining({
            amount: 1,
            tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
          })
        })
      ])
    );
  });

  it("does not auto-start the turn when consuming a reaction", () => {
    const character = createCharacter({
      roundTracker: {
        turnStarted: false,
        actionAvailable: false,
        bonusActionAvailable: false,
        reactionAvailable: true
      }
    });

    const nextCharacter = consumeRoundTrackerResourceForCharacter(character, "reaction");

    expect(nextCharacter.roundTracker).toEqual({
      turnStarted: false,
      actionAvailable: false,
      bonusActionAvailable: false,
      reactionAvailable: false
    });
  });
});

describe("swapTemporaryHitPointsAssignment", () => {
  it("replaces temporary hit points and source only when the new amount is higher", () => {
    expect(swapTemporaryHitPointsAssignment(0, undefined, 10, "Vitality Surge")).toEqual({
      temporaryHitPoints: 10,
      temporaryHitPointsSource: "Vitality Surge"
    });
    expect(swapTemporaryHitPointsAssignment(5, "Manual", 4, "Vitality Surge")).toEqual({
      temporaryHitPoints: 5,
      temporaryHitPointsSource: "Manual"
    });
    expect(swapTemporaryHitPointsAssignment(7, "Manual", 20, "Vitality Surge")).toEqual({
      temporaryHitPoints: 20,
      temporaryHitPointsSource: "Vitality Surge"
    });
  });

  it("clears the source when temporary hit points are reduced to zero", () => {
    expect(createTemporaryHitPointsAssignment(0, "Manual")).toEqual({
      temporaryHitPoints: 0,
      temporaryHitPointsSource: undefined
    });
  });
});
