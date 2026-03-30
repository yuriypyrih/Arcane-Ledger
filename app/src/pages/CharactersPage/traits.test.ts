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
});
