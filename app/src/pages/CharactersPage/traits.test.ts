import { describe, expect, it } from "vitest";
import {
  CONDITION_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../types";
import {
  createCharacterStatusEntry,
  hasStatusCondition,
  resolveCharacterStatusEntries,
  upsertManualStatusEntry
} from "./traits";

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
});
