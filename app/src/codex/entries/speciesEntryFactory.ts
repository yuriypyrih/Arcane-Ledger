import { ENTRY_CATEGORIES } from "./enums";
import type { SpeciesEntry } from "./types";

export type SpeciesEntryInput = Pick<
  SpeciesEntry,
  | "id"
  | "name"
  | "source"
  | "speed"
  | "size"
  | "trackingState"
  | "starterPack"
  | "tags"
  | "summary"
  | "description"
>;

export function createSpeciesEntry(entry: SpeciesEntryInput): SpeciesEntry {
  return {
    ...entry,
    category: ENTRY_CATEGORIES.SPECIES,
    abilityBonuses: {},
    innateProficiencies: [],
    grantedSkillProficiencies: [],
    grantedToolProficiencies: []
  };
}
