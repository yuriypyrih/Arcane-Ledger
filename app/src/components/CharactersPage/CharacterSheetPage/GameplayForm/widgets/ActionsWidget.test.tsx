import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Character } from "../../../../../types";
import {
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { createDefaultAbilities, createEmptyCharacter } from "../../../../../pages/CharactersPage/constants";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { normalizeCharacter } from "../../../../../pages/CharactersPage/storage";
import { createCharacterEquipmentItem } from "../../../../../pages/CharactersPage/inventory";
import { createCharacterStatusEntry } from "../../../../../pages/CharactersPage/traits";
import ActionsWidget from "./ActionsWidget";

const openDiceRollerMock = vi.fn();

vi.mock("../../../../DicePage/DiceRollerPopup", () => ({
  useDiceRollerPopup: () => ({
    openDiceRoller: openDiceRollerMock,
    diceRollerPopup: null
  })
}));

function createCharacter(overrides: Partial<Character>): Character {
  const normalizedCharacter = normalizeCharacter({
    id: 1,
    ...createEmptyCharacter(),
    name: "Action Test",
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

function createPersistSpy(initialCharacter: Character) {
  return vi.fn<PersistCharacterUpdater>((updater) => {
    updater(initialCharacter);
  });
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

describe("ActionsWidget", () => {
  beforeEach(() => {
    openDiceRollerMock.mockReset();
  });

  it("keeps the weapon drawer open while attack and damage rolls are triggered separately", async () => {
    const user = userEvent.setup();
    const character = createCharacter({
      className: "Fighter",
      level: 5,
      equipment: [createCharacterEquipmentItem("Longsword", true, false)],
      roundTracker: {
        turnStarted: true,
        actionAvailable: true,
        bonusActionAvailable: true,
        reactionAvailable: true
      }
    });
    const persistHarness = createPersistHarness(character);

    render(
      <ActionsWidget
        character={character}
        onPersistCharacter={persistHarness.onPersistCharacter}
      />
    );

    await user.click(screen.getByRole("button", { name: /Longsword/i }));

    expect(persistHarness.onPersistCharacter).not.toHaveBeenCalled();
    expect(openDiceRollerMock).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Longsword" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Attack" }));

    expect(persistHarness.onPersistCharacter).toHaveBeenCalledTimes(1);
    expect(openDiceRollerMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog", { name: "Longsword" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Damage" }));

    expect(persistHarness.onPersistCharacter).toHaveBeenCalledTimes(1);
    expect(openDiceRollerMock).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("dialog", { name: "Longsword" })).toBeInTheDocument();
  });

  it("opens dice roller settings without closing the weapon drawer", async () => {
    const user = userEvent.setup();
    const character = createCharacter({
      className: "Fighter",
      level: 5,
      equipment: [createCharacterEquipmentItem("Longsword", true, false)],
      roundTracker: {
        turnStarted: true,
        actionAvailable: true,
        bonusActionAvailable: true,
        reactionAvailable: true
      }
    });
    const persistHarness = createPersistHarness(character);

    render(
      <ActionsWidget
        character={character}
        onPersistCharacter={persistHarness.onPersistCharacter}
      />
    );

    await user.click(screen.getByRole("button", { name: /Longsword/i }));
    await user.click(screen.getByRole("button", { name: "Open dice roller settings" }));

    expect(persistHarness.onPersistCharacter).not.toHaveBeenCalled();
    expect(openDiceRollerMock).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Longsword" })).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Roll Settings" })).toBeInTheDocument();
  });

  it("opens a feature drawer before executing second wind", async () => {
    const user = userEvent.setup();
    const character = createCharacter({
      className: "Fighter",
      level: 2,
      roundTracker: {
        turnStarted: true,
        actionAvailable: true,
        bonusActionAvailable: true,
        reactionAvailable: true
      }
    });
    const onPersistCharacter = createPersistSpy(character);

    render(<ActionsWidget character={character} onPersistCharacter={onPersistCharacter} />);

    const secondWindButton = screen
      .getAllByRole("button")
      .find((button) => button.textContent?.startsWith("Second Wind"));

    if (!secondWindButton) {
      throw new Error("Expected Second Wind action card to be available.");
    }

    await user.click(secondWindButton);

    expect(onPersistCharacter).not.toHaveBeenCalled();
    expect(openDiceRollerMock).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Second Wind" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Use Second Wind" }));

    expect(onPersistCharacter).toHaveBeenCalledTimes(1);
    expect(openDiceRollerMock).toHaveBeenCalledTimes(1);
  });

  it("executes single-select feature options from inside the drawer", async () => {
    const user = userEvent.setup();
    const character = createCharacter({
      className: "Paladin",
      level: 3,
      roundTracker: {
        turnStarted: true,
        actionAvailable: true,
        bonusActionAvailable: true,
        reactionAvailable: true
      }
    });
    const persistHarness = createPersistHarness(character);

    render(
      <ActionsWidget
        character={character}
        onPersistCharacter={persistHarness.onPersistCharacter}
      />
    );

    await user.click(screen.getByRole("button", { name: /Channel Divinity/i }));

    expect(persistHarness.onPersistCharacter).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Channel Divinity" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Divine Sense/i }));

    expect(persistHarness.onPersistCharacter).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Use Channel Divinity" }));

    expect(persistHarness.onPersistCharacter).toHaveBeenCalledTimes(1);
    expect(
      persistHarness.getCharacter().classFeatureState?.paladin?.channelDivinityUsesExpended
    ).toBe(1);
  });

  it("waits for the footer before converting font of magic resources", async () => {
    const user = userEvent.setup();
    const character = createCharacter({
      className: "Sorcerer",
      level: 5,
      spellSlotsExpended: [0, 1, 0, 0, 0, 0, 0, 0, 0],
      classFeatureState: {
        sorcerer: {
          sorceryPointsExpended: 1
        }
      }
    });
    const persistHarness = createPersistHarness(character);

    render(
      <ActionsWidget
        character={character}
        onPersistCharacter={persistHarness.onPersistCharacter}
      />
    );

    await user.click(screen.getByRole("button", { name: /Font of Magic/i }));
    await user.click(screen.getByRole("button", { name: /3.*Level 2 Slot/i }));

    expect(persistHarness.onPersistCharacter).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Convert" }));

    expect(persistHarness.onPersistCharacter).toHaveBeenCalledTimes(1);
  });

  it("validates lay on hands spend inside the drawer before healing", async () => {
    const user = userEvent.setup();
    const character = createCharacter({
      className: "Paladin",
      level: 1,
      hitPoints: 12,
      currentHitPoints: 4,
      roundTracker: {
        turnStarted: true,
        actionAvailable: true,
        bonusActionAvailable: true,
        reactionAvailable: true
      }
    });
    const persistHarness = createPersistHarness(character);

    render(
      <ActionsWidget
        character={character}
        onPersistCharacter={persistHarness.onPersistCharacter}
      />
    );

    await user.click(screen.getByRole("button", { name: /Lay on Hands/i }));

    const healAmountInput = screen.getByLabelText("Heal Amount");
    const healButton = screen.getByRole("button", { name: "Heal" });

    await user.clear(healAmountInput);
    await user.type(healAmountInput, "6");

    expect(screen.getByText("Not enough capacity")).toBeInTheDocument();
    expect(healButton).toBeDisabled();

    await user.clear(healAmountInput);
    await user.type(healAmountInput, "3");

    expect(screen.queryByText("Not enough capacity")).not.toBeInTheDocument();
    expect(healButton).toBeEnabled();

    await user.click(healButton);

    expect(persistHarness.onPersistCharacter).toHaveBeenCalledTimes(1);
    expect(persistHarness.getCharacter().currentHitPoints).toBe(7);
    expect(persistHarness.getCharacter().classFeatureState?.paladin?.layOnHandsExpended).toBe(3);
  });

  it("lets zealot barbarians opt into rage of the gods from the rage drawer", async () => {
    const user = userEvent.setup();
    const character = createCharacter({
      className: "Barbarian",
      level: 14,
      subclassId: "barbarian-path-of-the-zealot",
      roundTracker: {
        turnStarted: true,
        actionAvailable: true,
        bonusActionAvailable: true,
        reactionAvailable: true
      }
    });
    const persistHarness = createPersistHarness(character);

    render(
      <ActionsWidget
        character={character}
        onPersistCharacter={persistHarness.onPersistCharacter}
      />
    );

    await user.click(screen.getByRole("button", { name: /^Rage/i }));

    expect(
      screen.getByText(
        /You can imbue yourself with a primal power called Rage, a force that grants you extraordinary might and resilience\./i
      )
    ).toBeInTheDocument();

    const rageOfTheGodsCheckbox = screen.getByRole("checkbox");
    expect(rageOfTheGodsCheckbox).not.toBeChecked();

    await user.click(rageOfTheGodsCheckbox);
    await user.click(screen.getByRole("button", { name: "Enter Rage" }));

    expect(persistHarness.getCharacter().classFeatureState?.rage?.usesExpended).toBe(1);
    expect(persistHarness.getCharacter().classFeatureState?.rage?.rageOfTheGodsUsesExpended).toBe(
      1
    );
    expect(persistHarness.getCharacter().statusEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: "feature-barbarian-rage-of-the-gods"
        })
      ])
    );
  });

  it("keeps the action drawer open under a nested spell drawer for spell-backed actions", async () => {
    const user = userEvent.setup();
    const character = createCharacter({
      className: "Ranger",
      level: 2,
      background: "Criminal / Spy",
      abilities: {
        ...createDefaultAbilities(),
        WIS: 16
      },
      roundTracker: {
        turnStarted: true,
        actionAvailable: true,
        bonusActionAvailable: true,
        reactionAvailable: true
      }
    });
    const onPersistCharacter = createPersistSpy(character);

    render(<ActionsWidget character={character} onPersistCharacter={onPersistCharacter} />);

    await user.click(screen.getByRole("button", { name: /Favored Enemy/i }));

    expect(screen.getByRole("dialog", { name: "Favored Enemy" })).toBeInTheDocument();
    expect(onPersistCharacter).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Open Hunter's Mark" }));

    expect(screen.getByRole("dialog", { name: "Hunter's Mark" })).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Favored Enemy" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close spell details" }));

    expect(screen.queryByRole("dialog", { name: "Hunter's Mark" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Favored Enemy" })).toBeInTheDocument();
  });

  it("enforces the multi-select metamagic limit inside the drawer", async () => {
    const user = userEvent.setup();
    const character = createCharacter({
      className: "Sorcerer",
      level: 20,
      statusEntries: [
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.EFFECTS,
          value: "Innate Sorcery",
          source: "Innate Sorcery",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          sourceId: "feature-sorcerer-innate-sorcery"
        })
      ],
      classFeatureState: {
        sorcerer: {
          metamagicSelections: ["careful-spell", "subtle-spell", "twinned-spell"]
        }
      }
    });
    const onPersistCharacter = createPersistSpy(character);

    render(<ActionsWidget character={character} onPersistCharacter={onPersistCharacter} />);

    await user.click(screen.getByRole("button", { name: /Metamagic/i }));
    await user.click(screen.getByRole("button", { name: /Careful Spell/i }));
    await user.click(screen.getByRole("button", { name: /Subtle Spell/i }));

    expect(screen.getByRole("button", { name: /Twinned Spell/i })).toBeDisabled();
  });
});
