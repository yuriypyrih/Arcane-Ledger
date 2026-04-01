import { describe, expect, it } from "vitest";
import type { Character } from "../../../../../types";
import { createDefaultAbilities, createEmptyCharacter } from "../../../../../pages/CharactersPage/constants";
import { normalizeCharacter } from "../../../../../pages/CharactersPage/storage";
import { createLongRestOptions, createShortRestOptions } from "./restOptions";

function createCharacter(overrides: Partial<Character>): Character {
  const normalizedCharacter = normalizeCharacter({
    id: 1,
    ...createEmptyCharacter(),
    name: "Rest Test",
    species: "Human",
    className: "Barbarian",
    background: "Soldier",
    abilities: createDefaultAbilities(),
    ...overrides
  });

  if (!normalizedCharacter) {
    throw new Error("Expected test character to normalize successfully.");
  }

  return normalizedCharacter;
}

describe("barbarian rest options", () => {
  it("shows relentless rage on short rest and barbarian feature recoveries on long rest", () => {
    const character = createCharacter({
      level: 15,
      subclassId: "barbarian-path-of-the-berserker",
      classFeatureState: {
        rage: {
          usesExpended: 2,
          active: false,
          warriorOfTheGodsUsesExpended: 1,
          relentlessRageDcBonus: 10,
          intimidatingPresenceUsesExpended: 1,
          persistentRageUsesExpended: 1
        }
      }
    });

    const shortRestOptions = createShortRestOptions(character);
    const longRestOptions = createLongRestOptions(character);

    expect(shortRestOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "restore-relentless-rage",
          label: "Reset Relentless Rage DC"
        })
      ])
    );
    expect(longRestOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "restore-relentless-rage",
          label: "Reset Relentless Rage DC"
        }),
        expect.objectContaining({
          id: "restore-intimidating-presence",
          label: "Restore Intimidating Presence"
        }),
        expect.objectContaining({
          id: "restore-persistent-rage",
          label: "Restore Persistent Rage"
        })
      ])
    );
  });

  it("shows warrior of the gods recovery on long rest for zealot barbarians", () => {
    const character = createCharacter({
      level: 6,
      subclassId: "barbarian-path-of-the-zealot",
      classFeatureState: {
        rage: {
          usesExpended: 0,
          active: false,
          warriorOfTheGodsUsesExpended: 2
        }
      }
    });

    const longRestOptions = createLongRestOptions(character);

    expect(longRestOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "restore-warrior-of-the-gods",
          label: "Restore Warrior of the Gods"
        })
      ])
    );
  });

  it("shows zealous presence recovery on long rest for level 10 zealot barbarians", () => {
    const character = createCharacter({
      level: 10,
      subclassId: "barbarian-path-of-the-zealot",
      classFeatureState: {
        rage: {
          usesExpended: 0,
          active: false,
          zealousPresenceUsesExpended: 1
        }
      }
    });

    const longRestOptions = createLongRestOptions(character);

    expect(longRestOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "restore-zealous-presence",
          label: "Restore Zealous Presence"
        })
      ])
    );
  });

  it("shows rage of the gods recovery on long rest for level 14 zealot barbarians", () => {
    const character = createCharacter({
      level: 14,
      subclassId: "barbarian-path-of-the-zealot",
      classFeatureState: {
        rage: {
          usesExpended: 0,
          active: false,
          rageOfTheGodsUsesExpended: 1
        }
      }
    });

    const longRestOptions = createLongRestOptions(character);

    expect(longRestOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "restore-rage-of-the-gods",
          label: "Restore Rage of the Gods"
        })
      ])
    );
  });
});
