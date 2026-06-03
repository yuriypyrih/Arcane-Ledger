import type { CharacterStatusEntry } from "../../../types";
import { STATUS_ENTRY_GROUP } from "../../../types";
import type { CharacterStatusRuntime } from "./statusRuntime";

export type CharacterCombatSummaryDefenses = {
  statusEntries: CharacterStatusEntry[];
  effects: CharacterStatusEntry[];
  reactions: CharacterStatusEntry[];
  senses: CharacterStatusEntry[];
  auras: CharacterStatusEntry[];
  resistances: CharacterStatusEntry[];
  vulnerabilities: CharacterStatusEntry[];
  immunities: CharacterStatusEntry[];
  conditions: CharacterStatusEntry[];
};

function getEntriesForGroup(
  statusEntries: CharacterStatusEntry[],
  group: STATUS_ENTRY_GROUP
): CharacterStatusEntry[] {
  return statusEntries.filter((entry) => entry.group === group);
}

export function createCombatSummaryDefenses(
  statusRuntime: CharacterStatusRuntime
): CharacterCombatSummaryDefenses {
  const statusEntries = statusRuntime.statusEntries;

  return {
    statusEntries,
    effects: getEntriesForGroup(statusEntries, STATUS_ENTRY_GROUP.EFFECTS),
    reactions: getEntriesForGroup(statusEntries, STATUS_ENTRY_GROUP.REACTIONS),
    senses: getEntriesForGroup(statusEntries, STATUS_ENTRY_GROUP.SENSES),
    auras: getEntriesForGroup(statusEntries, STATUS_ENTRY_GROUP.AURAS),
    resistances: getEntriesForGroup(statusEntries, STATUS_ENTRY_GROUP.RESISTANCES),
    vulnerabilities: getEntriesForGroup(statusEntries, STATUS_ENTRY_GROUP.VULNERABILITIES),
    immunities: getEntriesForGroup(statusEntries, STATUS_ENTRY_GROUP.IMMUNITIES),
    conditions: getEntriesForGroup(statusEntries, STATUS_ENTRY_GROUP.CONDITIONS)
  };
}
