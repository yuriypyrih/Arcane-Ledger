import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Character } from "../../../../types";
import { createDefaultAbilities, createEmptyCharacter } from "../../../../pages/CharactersPage/constants";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { normalizeCharacter } from "../../../../pages/CharactersPage/storage";
import StatsForm from "./StatsForm";

const openDiceRollerMock = vi.fn();

vi.mock("../../../DicePage/DiceRollerPopup", () => ({
  useDiceRollerPopup: () => ({
    openDiceRoller: openDiceRollerMock,
    diceRollerPopup: null
  })
}));

function createCharacter(overrides: Partial<Character>): Character {
  const normalizedCharacter = normalizeCharacter({
    id: 1,
    ...createEmptyCharacter(),
    name: "Stats Test",
    species: "Human",
    className: "Bard",
    background: "Entertainer",
    abilities: createDefaultAbilities(),
    ...overrides
  });

  if (!normalizedCharacter) {
    throw new Error("Expected test character to normalize successfully.");
  }

  return normalizedCharacter;
}

function createPersistHarness(initialCharacter: Character) {
  let currentCharacter = initialCharacter;
  const onPersistCharacter = vi.fn<PersistCharacterUpdater>((updater) => {
    currentCharacter = updater(currentCharacter);
  });

  return {
    onPersistCharacter,
    getCharacter: () => currentCharacter
  };
}

describe("StatsForm", () => {
  beforeEach(() => {
    openDiceRollerMock.mockReset();
  });

  it("offers tandem footwork in the initiative drawer and spends bardic inspiration when used", async () => {
    const user = userEvent.setup();
    const character = createCharacter({
      className: "Bard",
      level: 6,
      subclassId: "bard-college-of-dance",
      abilities: {
        ...createDefaultAbilities(),
        DEX: 14,
        CHA: 16
      }
    });
    const persistHarness = createPersistHarness(character);

    render(<StatsForm character={character} onPersistCharacter={persistHarness.onPersistCharacter} />);

    await user.click(screen.getByRole("button", { name: /Initiative/i }));

    const initiativeDrawer = screen.getByRole("dialog", { name: "Initiative" });
    const initiativeScope = within(initiativeDrawer);

    expect(initiativeScope.getByLabelText(/Tandem Footwork/i)).toBeInTheDocument();
    expect(initiativeScope.getByText("Use 1")).toBeInTheDocument();

    await user.click(initiativeScope.getByLabelText(/Tandem Footwork/i));
    await user.click(initiativeScope.getByRole("button", { name: "Roll Initiative" }));

    expect(openDiceRollerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Initiative",
        formula: "1d20 + 2 + 1d8",
        formulaDisplay: "1d20 + 2 + 1d8"
      })
    );
    expect(persistHarness.getCharacter().classFeatureState?.bard?.bardicInspirationUsesExpended).toBe(1);
  });

  it("opens the reusable dice roller settings button from the initiative drawer", async () => {
    const user = userEvent.setup();
    const character = createCharacter({
      className: "Bard",
      level: 6,
      subclassId: "bard-college-of-dance"
    });

    render(<StatsForm character={character} onPersistCharacter={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /Initiative/i }));
    await user.click(screen.getByRole("button", { name: "Open dice roller settings" }));

    expect(screen.getByRole("dialog", { name: "Roll Settings" })).toBeInTheDocument();
  });

  it("shows leading evasion on the dexterity save card and in the drawer formula", async () => {
    const user = userEvent.setup();
    const character = createCharacter({
      className: "Bard",
      level: 14,
      subclassId: "bard-college-of-dance",
      abilities: {
        ...createDefaultAbilities(),
        DEX: 18,
        CHA: 16
      }
    });

    render(<StatsForm character={character} onPersistCharacter={vi.fn()} />);

    expect(screen.getByLabelText("Leading Evasion active")).toBeInTheDocument();

    const dexterityBadge = screen.getByLabelText("DEX score 18");
    const dexterityButton = dexterityBadge.closest("button");

    expect(dexterityButton).not.toBeNull();

    await user.click(dexterityButton!);

    const dexterityDrawer = screen.getByRole("dialog", { name: "DEX" });

    expect(within(dexterityDrawer).getByText("Saving Throw Formula")).toBeInTheDocument();
    expect(within(dexterityDrawer).getByText(/\+ Leading Evasion/)).toBeInTheDocument();
  });
});
