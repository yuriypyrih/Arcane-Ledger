import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createDefaultAbilities, createEmptyCharacter } from "../../../../pages/CharactersPage/constants";
import { normalizeCharacter } from "../../../../pages/CharactersPage/storage";
import type { Character } from "../../../../types";
import ClassFeaturesAndFeats from "./ClassFeaturesAndFeats";

function createCharacter(overrides: Partial<Character> = {}): Character {
  const normalizedCharacter = normalizeCharacter({
    id: 1,
    ...createEmptyCharacter(),
    name: "Guide Test",
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

describe("ClassFeaturesAndFeats", () => {
  it("opens the class features guide from the build header", async () => {
    const user = userEvent.setup();

    render(
      <ClassFeaturesAndFeats
        character={createCharacter()}
        onPersistCharacter={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Open class features guide" }));

    const dialog = screen.getByRole("dialog", { name: "Class Features Guide" });
    const dialogScope = within(dialog);

    expect(
      dialogScope.getByText(/Class features unlock as you gain levels in your class/i)
    ).toBeInTheDocument();
    expect(dialogScope.getByRole("button", { name: "Tracked" })).toBeDisabled();
    expect(dialogScope.getByRole("button", { name: "Not Tracked" })).toBeDisabled();
    expect(dialogScope.getByRole("button", { name: "Semi Tracked" })).toBeDisabled();
    expect(
      dialogScope.getByText(/Tracked means the app is doing the heavy lifting for you/i)
    ).toBeInTheDocument();
  });
});
