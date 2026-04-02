import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createDefaultAbilities, createEmptyCharacter } from "../../../../pages/CharactersPage/constants";
import { normalizeCharacter } from "../../../../pages/CharactersPage/storage";
import type { Character } from "../../../../types";
import { PROF_LEVEL, PROFICIENCY_SOURCE, SKILL } from "../../../../types";
import { getSkillProficiencyForName } from "../../../../pages/CharactersPage/proficiency";
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

  it("shows college of lore bonus proficiency selectors in the build section", async () => {
    const user = userEvent.setup();

    render(
      <ClassFeaturesAndFeats
        character={createCharacter({
          className: "Bard",
          level: 3,
          subclassId: "bard-college-of-lore"
        })}
        onPersistCharacter={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /Bonus Proficiencies/i }));

    expect(screen.getByLabelText("Bonus Proficiency 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Bonus Proficiency 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Bonus Proficiency 3")).toBeInTheDocument();
  });

  it("shows college of lore magical discoveries selectors in the build section", async () => {
    const user = userEvent.setup();

    render(
      <ClassFeaturesAndFeats
        character={createCharacter({
          className: "Bard",
          level: 6,
          subclassId: "bard-college-of-lore"
        })}
        onPersistCharacter={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /Magical Discoveries/i }));

    expect(screen.getByLabelText("Magical Discovery 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Magical Discovery 2")).toBeInTheDocument();
  });

  it("shows college of the moon primal lore selectors in the build section", async () => {
    const user = userEvent.setup();

    render(
      <ClassFeaturesAndFeats
        character={createCharacter({
          className: "Bard",
          level: 3,
          subclassId: "bard-college-of-the-moon"
        })}
        onPersistCharacter={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /Primal Lore/i }));

    expect(screen.getByLabelText("Primal Lore Cantrip")).toBeInTheDocument();
    expect(screen.getByLabelText("Primal Lore Skill")).toBeInTheDocument();
  });

  it("shows Knowledge Domain Blessings of Knowledge selectors in the build section", async () => {
    const user = userEvent.setup();

    render(
      <ClassFeaturesAndFeats
        character={createCharacter({
          className: "Cleric",
          level: 3,
          subclassId: "cleric-knowledge-domain"
        })}
        onPersistCharacter={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /Blessings of Knowledge/i }));

    expect(screen.getByLabelText("Blessing Skill 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Blessing Skill 2")).toBeInTheDocument();
  });

  it("lets Blessings of Knowledge pick already proficient skills as long as they are not already expertise", async () => {
    const user = userEvent.setup();
    const arcanaProficiency = getSkillProficiencyForName(SKILL.ARCANA);
    const historyProficiency = getSkillProficiencyForName(SKILL.HISTORY);

    if (!arcanaProficiency || !historyProficiency) {
      throw new Error("Expected Arcana and History proficiencies to exist.");
    }

    render(
      <ClassFeaturesAndFeats
        character={createCharacter({
          className: "Cleric",
          level: 3,
          subclassId: "cleric-knowledge-domain",
          skillProficiencies: [
            {
              source: PROFICIENCY_SOURCE.MANUAL,
              proficiency: arcanaProficiency,
              proficiencyLevel: PROF_LEVEL.PROFICIENT
            },
            {
              source: PROFICIENCY_SOURCE.FEAT,
              sourceStr: "Background Expertise",
              proficiency: historyProficiency,
              proficiencyLevel: PROF_LEVEL.EXPERT
            }
          ]
        })}
        onPersistCharacter={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /Blessings of Knowledge/i }));

    const blessingSkillOne = screen.getByLabelText("Blessing Skill 1");
    const blessingSkillOneOptions = within(blessingSkillOne).getAllByRole("option");

    expect(
      blessingSkillOneOptions.some((option) => option.textContent === SKILL.ARCANA)
    ).toBe(true);
    expect(
      blessingSkillOneOptions.some((option) => option.textContent === SKILL.HISTORY)
    ).toBe(false);
  });

  it("shows the locked Unfettered Mind save selector for Knowledge Domain clerics", async () => {
    const user = userEvent.setup();

    render(
      <ClassFeaturesAndFeats
        character={createCharacter({
          className: "Cleric",
          level: 6,
          subclassId: "cleric-knowledge-domain"
        })}
        onPersistCharacter={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /Unfettered Mind/i }));

    expect(screen.getByLabelText("Unfettered Mind Save")).toBeDisabled();
  });
});
