import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { getSpellEntryById } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { createDefaultAbilities, createEmptyCharacter } from "../../../../pages/CharactersPage/constants";
import { normalizeCharacter } from "../../../../pages/CharactersPage/storage";
import CharacterSpellDrawer from "./CharacterSpellDrawer";

function createCharacter(overrides: Partial<Character> = {}): Character {
  const normalizedCharacter = normalizeCharacter({
    id: 1,
    ...createEmptyCharacter(),
    name: "Drawer Test",
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

describe("CharacterSpellDrawer", () => {
  it("shows custom spell-slot guidance when a free cast still allows upcasting", () => {
    const spell = getSpellEntryById("spell-command");

    if (!spell) {
      throw new Error("Expected Command to exist.");
    }

    render(
      <CharacterSpellDrawer
        character={createCharacter()}
        spell={spell}
        mode="standard"
        spellSlotTotals={[4, 3, 3, 0, 0, 0, 0, 0, 0]}
        spellSlotsRemaining={[4, 3, 3, 0, 0, 0, 0, 0, 0]}
        selectedSpellSlotLevel={1}
        onSelectedSpellSlotLevelChange={vi.fn()}
        onClose={vi.fn()}
        onAction={vi.fn()}
        freeCastSlotLevel={1}
        actionAvailabilityText="Mantle of Majesty is active. Cast at level 1 without expending a spell slot, or upcast normally."
      />
    );

    expect(
      screen.getByText(
        "Mantle of Majesty is active. Cast at level 1 without expending a spell slot, or upcast normally."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Cast at slot level" })).toBeInTheDocument();
  });

  it("renders footer action options and forwards beguiling magic selection with the cast action", async () => {
    const user = userEvent.setup();
    const spell = getSpellEntryById("spell-charm-person");

    if (!spell) {
      throw new Error("Expected Charm Person to exist.");
    }

    const spellEntry = spell;

    const onAction = vi.fn();

    function Harness() {
      const [useBeguilingMagic, setUseBeguilingMagic] = useState(false);

      return (
        <CharacterSpellDrawer
          character={createCharacter()}
          spell={spellEntry}
          mode="standard"
          spellSlotTotals={[4, 0, 0, 0, 0, 0, 0, 0, 0]}
          spellSlotsRemaining={[4, 0, 0, 0, 0, 0, 0, 0, 0]}
          selectedSpellSlotLevel={1}
          onSelectedSpellSlotLevelChange={vi.fn()}
          onClose={vi.fn()}
          onAction={(options) =>
            onAction({
              ...options,
              useBeguilingMagic
            })
          }
          actionOptions={[
            {
              id: "beguiling-magic",
              label: "Beguiling Magic",
              checked: useBeguilingMagic,
              onCheckedChange: setUseBeguilingMagic,
              tracker: {
                current: 0,
                total: 1
              },
              fallbackCost: {
                label: "Use 1",
                icon: "music"
              }
            }
          ]}
        />
      );
    }

    render(<Harness />);

    expect(screen.getByRole("checkbox", { name: /Beguiling Magic/ })).toBeInTheDocument();
    expect(screen.getByText("Charges")).toBeInTheDocument();
    expect(screen.getByText("Use 1")).toBeInTheDocument();
    expect(screen.queryByText(/slots remaining at level/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /Beguiling Magic/ }));
    await user.click(screen.getByRole("button", { name: "Cast" }));

    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({
        useBeguilingMagic: true
      })
    );
  });

  it("shows reaction timing badges in both the casting-time cell and cast button", () => {
    const spell = getSpellEntryById("spell-shield");

    if (!spell) {
      throw new Error("Expected Shield to exist.");
    }

    render(
      <CharacterSpellDrawer
        character={createCharacter()}
        spell={spell}
        mode="standard"
        spellSlotTotals={[4, 0, 0, 0, 0, 0, 0, 0, 0]}
        spellSlotsRemaining={[4, 0, 0, 0, 0, 0, 0, 0, 0]}
        selectedSpellSlotLevel={1}
        onSelectedSpellSlotLevelChange={vi.fn()}
        onClose={vi.fn()}
        onAction={vi.fn()}
      />
    );

    const castingTimeCell = screen.getByText("Casting Time").parentElement;

    if (!castingTimeCell) {
      throw new Error("Expected casting time cell to exist.");
    }

    expect(within(castingTimeCell).getByTitle("Reaction timing badge")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cast" })).toContainElement(
      screen.getAllByTitle("Reaction timing badge")[1]
    );
  });

  it("shows non-combat timing badges for spells without action economy timing", () => {
    const spell = getSpellEntryById("spell-identify");

    if (!spell) {
      throw new Error("Expected Identify to exist.");
    }

    render(
      <CharacterSpellDrawer
        character={createCharacter()}
        spell={spell}
        mode="standard"
        spellSlotTotals={[4, 0, 0, 0, 0, 0, 0, 0, 0]}
        spellSlotsRemaining={[4, 0, 0, 0, 0, 0, 0, 0, 0]}
        selectedSpellSlotLevel={1}
        onSelectedSpellSlotLevelChange={vi.fn()}
        onClose={vi.fn()}
        onAction={vi.fn()}
      />
    );

    expect(screen.getAllByTitle("Non-combat timing badge")).toHaveLength(2);
  });

  it("hides spent-turn warning copy while leaving cast disabled", () => {
    const spell = getSpellEntryById("spell-shield");

    if (!spell) {
      throw new Error("Expected Shield to exist.");
    }

    render(
      <CharacterSpellDrawer
        character={createCharacter()}
        spell={spell}
        mode="standard"
        spellSlotTotals={[4, 0, 0, 0, 0, 0, 0, 0, 0]}
        spellSlotsRemaining={[4, 0, 0, 0, 0, 0, 0, 0, 0]}
        selectedSpellSlotLevel={1}
        onSelectedSpellSlotLevelChange={vi.fn()}
        onClose={vi.fn()}
        onAction={vi.fn()}
        actionWarning="You already used the reaction for this turn"
        actionDisabled
      />
    );

    expect(
      screen.queryByText("You already used the reaction for this turn")
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cast" })).toBeDisabled();
  });
});
