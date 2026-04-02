import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createDefaultAbilities, createEmptyCharacter } from "../../../../pages/CharactersPage/constants";
import { normalizeCharacter } from "../../../../pages/CharactersPage/storage";
import { SKILL, type Character } from "../../../../types";
import SkillsAndProficienciesForm from "./SkillsAndProficienciesForm";

function createCharacter(overrides: Partial<Character> = {}): Character {
  const normalizedCharacter = normalizeCharacter({
    id: 1,
    ...createEmptyCharacter(),
    name: "Skill Test",
    species: "Human",
    className: "Cleric",
    background: "Acolyte",
    abilities: createDefaultAbilities(),
    ...overrides
  });

  if (!normalizedCharacter) {
    throw new Error("Expected test character to normalize successfully.");
  }

  return normalizedCharacter;
}

describe("SkillsAndProficienciesForm", () => {
  it("marks expertise skills and disables lower dropdown options beneath a non-manual floor", async () => {
    const user = userEvent.setup();

    render(
      <SkillsAndProficienciesForm
        character={createCharacter({
          level: 3,
          subclassId: "cleric-knowledge-domain",
          classFeatureState: {
            cleric: {
              knowledgeBlessingsSkills: [SKILL.ARCANA, SKILL.HISTORY]
            }
          }
        })}
        onPersistCharacter={vi.fn()}
      />
    );

    const arcanaButton = screen.getByRole("button", { name: "Arcana" });
    const arcanaRow = arcanaButton.closest("li");

    if (!arcanaRow) {
      throw new Error("Expected Arcana row to exist.");
    }

    expect(within(arcanaRow).getByTitle("Expertise")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Edit skills/i }));

    const arcanaSelect = within(arcanaRow).getByRole("combobox");

    expect(within(arcanaSelect).getByRole("option", { name: "None" })).toBeDisabled();
    expect(within(arcanaSelect).getByRole("option", { name: "Proficient" })).toBeDisabled();
    expect(within(arcanaSelect).getByRole("option", { name: "Expert" })).toBeEnabled();
  });
});
