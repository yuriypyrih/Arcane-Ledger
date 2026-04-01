import { render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import type { Character } from "../../../../../types";
import { createDefaultAbilities, createEmptyCharacter } from "../../../../../pages/CharactersPage/constants";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getAutomaticMaxHitPointsForCharacter } from "../../../../../pages/CharactersPage/gameplay";
import { normalizeCharacter } from "../../../../../pages/CharactersPage/storage";
import HitPointsWidget from "./HitPointsWidget";

function createCharacter(overrides: Partial<Character> = {}): Character {
  const normalizedCharacter = normalizeCharacter({
    id: 1,
    ...createEmptyCharacter(),
    name: "Hit Point Test",
    species: "Human",
    className: "Fighter",
    background: "Soldier",
    abilities: createDefaultAbilities(),
    ...overrides
  });

  if (!normalizedCharacter) {
    throw new Error("Expected test character to normalize successfully.");
  }

  return normalizedCharacter;
}

describe("HitPointsWidget", () => {
  it("raises current HP by the same amount as max HP when automatic HP increases", async () => {
    const abilities = {
      ...createDefaultAbilities(),
      CON: 14
    };
    const leveledCharacter = createCharacter({
      className: "Fighter",
      level: 5,
      abilities,
      maxHitPointsMode: "automatic"
    });
    const previousAutomaticHitPoints = getAutomaticMaxHitPointsForCharacter({
      className: leveledCharacter.className,
      level: leveledCharacter.level - 1,
      abilities: leveledCharacter.abilities,
      classFeatureState: leveledCharacter.classFeatureState
    });
    const nextAutomaticHitPoints = getAutomaticMaxHitPointsForCharacter(leveledCharacter);
    const missingHitPoints = 5;
    const initialCharacter = createCharacter({
      className: "Fighter",
      level: 5,
      abilities,
      maxHitPointsMode: "automatic",
      hitPoints: previousAutomaticHitPoints,
      currentHitPoints: previousAutomaticHitPoints - missingHitPoints
    });
    const expectedCurrentHitPoints = nextAutomaticHitPoints - missingHitPoints;

    function Harness() {
      const [character, setCharacter] = useState(initialCharacter);

      const handlePersistCharacter: PersistCharacterUpdater = (updater) => {
        setCharacter((currentCharacter) => updater(currentCharacter));
      };

      return <HitPointsWidget character={character} onPersistCharacter={handlePersistCharacter} />;
    }

    render(<Harness />);

    await waitFor(() => {
      expect(
        screen.getByText(`${expectedCurrentHitPoints}/${nextAutomaticHitPoints} HP`)
      ).toBeInTheDocument();
    });
  });
});
