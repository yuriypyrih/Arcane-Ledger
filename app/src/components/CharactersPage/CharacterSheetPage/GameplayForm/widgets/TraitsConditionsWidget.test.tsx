import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createDefaultAbilities, createEmptyCharacter } from "../../../../../pages/CharactersPage/constants";
import { normalizeCharacter } from "../../../../../pages/CharactersPage/storage";
import type { Character } from "../../../../../types";
import TraitsConditionsWidget from "./TraitsConditionsWidget";

function createCharacter(overrides: Partial<Character>): Character {
  const normalizedCharacter = normalizeCharacter({
    id: 1,
    ...createEmptyCharacter(),
    name: "Lore Test",
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

function createPersistHarness(initialCharacter: Character) {
  let currentCharacter = initialCharacter;
  const onPersistCharacter = vi.fn((updater: (character: Character) => Character) => {
    currentCharacter = updater(currentCharacter);
  });

  return {
    onPersistCharacter,
    getCharacter: () => currentCharacter
  };
}

describe("TraitsConditionsWidget", () => {
  it("spends bardic inspiration when taking the cutting words reaction", async () => {
    const user = userEvent.setup();
    const character = createCharacter({
      level: 3,
      subclassId: "bard-college-of-lore",
      roundTracker: {
        turnStarted: true,
        actionAvailable: true,
        bonusActionAvailable: true,
        reactionAvailable: true
      }
    });
    const persistHarness = createPersistHarness(character);

    render(
      <TraitsConditionsWidget
        character={character}
        onPersistCharacter={persistHarness.onPersistCharacter}
      />
    );

    await user.click(screen.getByRole("button", { name: /Cutting Words/i }));

    const drawer = screen.getByRole("dialog", { name: "Cutting Words" });
    const drawerScope = within(drawer);

    await user.click(drawerScope.getByRole("button", { name: /Take Reaction/i }));

    expect(persistHarness.getCharacter().classFeatureState?.bard?.bardicInspirationUsesExpended).toBe(
      1
    );
    expect(persistHarness.getCharacter().roundTracker?.reactionAvailable).toBe(false);
  });

  it("disables cutting words when no bardic inspiration uses remain", async () => {
    const user = userEvent.setup();
    const character = createCharacter({
      level: 3,
      subclassId: "bard-college-of-lore",
      classFeatureState: {
        bard: {
          bardicInspirationUsesExpended: 3
        }
      },
      roundTracker: {
        turnStarted: true,
        actionAvailable: true,
        bonusActionAvailable: true,
        reactionAvailable: true
      }
    });

    render(<TraitsConditionsWidget character={character} onPersistCharacter={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /Cutting Words/i }));

    const drawer = screen.getByRole("dialog", { name: "Cutting Words" });
    const drawerScope = within(drawer);
    const takeReactionButton = drawerScope.getByRole("button", { name: /Take Reaction/i });

    expect(drawerScope.getByText("No Bardic Inspiration uses remaining.")).toBeInTheDocument();
    expect(takeReactionButton).toBeDisabled();
  });
});
