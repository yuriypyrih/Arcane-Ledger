import { describe, expect, it } from "vitest";
import { barbarianFeatureMap } from "../../codex/classes";
import { CLASS_FEATURE } from "../../codex/entries";
import {
  CONDITION_NAME,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../types";
import {
  advanceCharacterStatusEntries,
  createCharacterStatusEntry,
  getStatusEntryDescriptionEntries,
  hasStatusCondition,
  reconcileCharacterStatusConsequences,
  resolveCharacterStatusEntries,
  upsertManualStatusEntry
} from "./traits";
import {
  isStatusEntryDurationEditable,
  isStatusEntryRemovable
} from "../../components/CharactersPage/CharacterSheetPage/GameplayForm/widgets/traitsWidgetUtils";
import { createDefaultAbilities, createEmptyCharacter } from "./constants";
import { normalizeCharacter } from "./storage";
import type { Character } from "../../types";

function createCharacter(overrides: Partial<Character>): Character {
  const normalizedCharacter = normalizeCharacter({
    id: 1,
    ...createEmptyCharacter(),
    name: "Test Hero",
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

describe("status entry immunities", () => {
  it("removes a matching manual condition when a manual immunity is added", () => {
    const entries = [
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.CONDITIONS,
        value: CONDITION_NAME.CHARMED,
        source: "Test",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL
      })
    ];

    const nextEntries = upsertManualStatusEntry(entries, {
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: CONDITION_NAME.CHARMED,
      source: "Test Immunity",
      duration: { kind: STATUS_DURATION_KIND.INFINITE }
    });

    expect(hasStatusCondition(nextEntries, CONDITION_NAME.CHARMED)).toBe(false);
  });

  it("filters matching conditions out of resolved entries when a derived immunity is present", () => {
    const manualEntries = [
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.CONDITIONS,
        value: CONDITION_NAME.FRIGHTENED,
        source: "Test",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL
      })
    ];

    const resolvedEntries = resolveCharacterStatusEntries(manualEntries, [
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.IMMUNITIES,
        value: CONDITION_NAME.FRIGHTENED,
        source: "Test Immunity",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE
      })
    ]);

    expect(hasStatusCondition(resolvedEntries, CONDITION_NAME.FRIGHTENED)).toBe(false);
  });

  it("ticks round durations only on their configured turn boundary", () => {
    const roundStartEntry = createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.CONDITIONS,
      value: CONDITION_NAME.INVISIBLE,
      source: "Round Start Test",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: 2,
        tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
      }
    });
    const roundEndEntry = createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.CONDITIONS,
      value: CONDITION_NAME.POISONED,
      source: "Round End Test",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: 2,
        tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
      }
    });

    const afterRoundStart = advanceCharacterStatusEntries(
      [roundStartEntry, roundEndEntry],
      STATUS_DURATION_ROUND_TICK.ROUND_START
    );
    const afterRoundEnd = advanceCharacterStatusEntries(
      [roundStartEntry, roundEndEntry],
      STATUS_DURATION_ROUND_TICK.ROUND_END
    );

    expect(afterRoundStart).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: CONDITION_NAME.INVISIBLE,
          duration: expect.objectContaining({ amount: 1 })
        }),
        expect.objectContaining({
          value: CONDITION_NAME.POISONED,
          duration: expect.objectContaining({ amount: 2 })
        })
      ])
    );
    expect(afterRoundEnd).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: CONDITION_NAME.INVISIBLE,
          duration: expect.objectContaining({ amount: 2 })
        }),
        expect.objectContaining({
          value: CONDITION_NAME.POISONED,
          duration: expect.objectContaining({ amount: 1 })
        })
      ])
    );
  });

  it("ends barbarian rage when incapacitated is present", () => {
    const character = createCharacter({
      level: 6,
      classFeatureState: {
        rage: {
          usesExpended: 1,
          active: true,
          frenzyPending: true
        }
      },
      statusEntries: [
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.CONDITIONS,
          value: CONDITION_NAME.INCAPACITATED,
          source: "Test",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL
        })
      ]
    });

    const reconciledCharacter = reconcileCharacterStatusConsequences(character);

    expect(reconciledCharacter.classFeatureState?.rage?.active).toBe(false);
    expect(reconciledCharacter.classFeatureState?.rage?.frenzyPending).toBe(false);
  });

  it("drops concentration and unbreakable majesty when incapacitated is present", () => {
    const character = createCharacter({
      className: "Bard",
      level: 14,
      subclassId: "bard-college-of-glamour",
      statusEntries: [
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.EFFECTS,
          value: "Concentration",
          source: "Mantle of Majesty",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
          duration: {
            kind: STATUS_DURATION_KIND.ROUNDS,
            amount: 10,
            tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
          },
          sourceId: "feature-bard-mantle-of-majesty-concentration"
        }),
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.EFFECTS,
          value: "Mantle of Majesty",
          source: "College of Glamour",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
          duration: {
            kind: STATUS_DURATION_KIND.LINKED,
            linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
            linkedValue: "Concentration"
          },
          sourceId: "feature-bard-mantle-of-majesty"
        }),
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.EFFECTS,
          value: "Unbreakable Majesty",
          source: "College of Glamour",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
          duration: {
            kind: STATUS_DURATION_KIND.ROUNDS,
            amount: 10,
            tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
          },
          sourceId: "feature-bard-unbreakable-majesty"
        }),
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.CONDITIONS,
          value: CONDITION_NAME.INCAPACITATED,
          source: "Test",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL
        })
      ]
    });

    const reconciledCharacter = reconcileCharacterStatusConsequences(character);

    expect(
      reconciledCharacter.statusEntries?.some((entry) => entry.value === "Concentration")
    ).toBe(false);
    expect(
      reconciledCharacter.statusEntries?.some((entry) => entry.value === "Mantle of Majesty")
    ).toBe(false);
    expect(
      reconciledCharacter.statusEntries?.some((entry) => entry.value === "Unbreakable Majesty")
    ).toBe(false);
  });

  it("uses the barbarian feature description for instinctive pounce status entries", () => {
    const entry = createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: "Instinctive Pounce",
      source: "Instinctive Pounce",
      sourceId: "feature-barbarian-instinctive-pounce",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: 1,
        tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
      }
    });

    expect(getStatusEntryDescriptionEntries(entry)).toEqual(
      barbarianFeatureMap[CLASS_FEATURE.INSTINCTIVE_POUNCE]?.description
    );
  });

  it("allows fanatical focus to be removed manually but not have its duration edited", () => {
    const entry = createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: "Fanatical Focus",
      source: "Path of the Zealot",
      sourceId: "feature-barbarian-fanatical-focus",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: "Rage"
      }
    });

    expect(isStatusEntryRemovable(entry)).toBe(true);
    expect(isStatusEntryDurationEditable(entry)).toBe(false);
  });

  it("uses the class feature description for Divine Foreknowledge status entries", () => {
    const entry = createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: "Divine Foreknowledge",
      source: "Knowledge Domain",
      sourceId: "feature-cleric-divine-foreknowledge",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.HOURS,
        amount: 1
      }
    });

    expect(getStatusEntryDescriptionEntries(entry)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("magically expand your mind to the future"),
        expect.stringContaining("level 6+ spell slot")
      ])
    );
  });
});
