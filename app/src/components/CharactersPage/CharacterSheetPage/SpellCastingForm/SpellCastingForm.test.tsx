import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import type { Character } from "../../../../types";
import { createDefaultAbilities, createEmptyCharacter } from "../../../../pages/CharactersPage/constants";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { normalizeCharacter } from "../../../../pages/CharactersPage/storage";
import SpellCastingForm from "./SpellCastingForm";

function createCharacter(overrides: Partial<Character> = {}): Character {
  const normalizedCharacter = normalizeCharacter({
    id: 1,
    ...createEmptyCharacter(),
    name: "Spell Test",
    species: "Human",
    className: "Wizard",
    background: "Sage",
    abilities: {
      ...createDefaultAbilities(),
      INT: 16
    },
    level: 5,
    ...overrides
  });

  if (!normalizedCharacter) {
    throw new Error("Expected test character to normalize successfully.");
  }

  return normalizedCharacter;
}

describe("SpellCastingForm", () => {
  it("opens the manual spell slot editor and clamps slot changes to the available totals", async () => {
    const user = userEvent.setup();
    const initialCharacter = createCharacter({
      spellSlotsExpended: [2, 1, 0, 0, 0, 0, 0, 0, 0]
    });

    function Harness() {
      const [character, setCharacter] = useState(initialCharacter);

      const handlePersistCharacter: PersistCharacterUpdater = (updater) => {
        setCharacter((currentCharacter) => updater(currentCharacter));
      };

      return <SpellCastingForm character={character} onPersistCharacter={handlePersistCharacter} />;
    }

    render(<Harness />);

    await user.click(screen.getByRole("button", { name: /Edit/i }));

    expect(screen.getByText("Edit your Spell Slots Manually")).toBeInTheDocument();
    expect(
      screen.getByText("Use or reset your spell slots up to their current limit.")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Edit your Spell Slots Manually/i }));

    expect(
      screen.getByRole("heading", { name: "Edit your Spell Slots Manually" })
    ).toBeInTheDocument();

    const levelOneRow = screen.getByText("Level 1").closest("section");

    if (!levelOneRow) {
      throw new Error("Expected level 1 spell slot row to exist.");
    }

    const levelOneScope = within(levelOneRow);

    expect(levelOneScope.getByText("2/4 available")).toBeInTheDocument();

    await user.click(levelOneScope.getByRole("button", { name: "Use level 1 spell slot" }));
    expect(levelOneScope.getByText("1/4 available")).toBeInTheDocument();

    await user.click(levelOneScope.getByRole("button", { name: "Reset level 1 spell slot" }));
    expect(levelOneScope.getByText("2/4 available")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset all" }));
    expect(levelOneScope.getByText("4/4 available")).toBeInTheDocument();
    expect(levelOneScope.getByRole("button", { name: "Reset level 1 spell slot" })).toBeDisabled();
  });
});
