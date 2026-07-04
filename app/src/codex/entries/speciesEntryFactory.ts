import { ENTRY_CATEGORIES } from "./enums";
import { speciesDescriptions } from "./speciesDescriptions";
import type { SpeciesEntry } from "./types";

export type SpeciesEntryInput = Pick<
  SpeciesEntry,
  | "id"
  | "name"
  | "source"
  | "speed"
  | "size"
  | "trackingState"
  | "trackingMessage"
  | "starterPack"
  | "tags"
  | "summary"
  | "rulesDescription"
>;

export function createSpeciesEntry(entry: SpeciesEntryInput): SpeciesEntry {
  return {
    ...entry,
    category: ENTRY_CATEGORIES.SPECIES,
    description: speciesDescriptions[entry.id] ?? "",
    abilityBonuses: {},
    innateProficiencies: [],
    grantedSkillProficiencies: [],
    grantedToolProficiencies: []
  };
}
