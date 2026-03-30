import { SKILL } from "../../types/skills";
import { ABILITY_TYPES, ENTRY_CATEGORIES, SPECIES_TYPES } from "./enums";
import type { SpeciesEntry } from "./types";

export const speciesEntries: SpeciesEntry[] = [
  {
    id: "species-elf",
    name: "Elf",
    category: ENTRY_CATEGORIES.SPECIES,
    tags: [SPECIES_TYPES.HUMANOID, SPECIES_TYPES.FEY_ANCESTRY, SPECIES_TYPES.ARCANE_AFFINITY],
    speed: 30,
    abilityBonuses: {
      [ABILITY_TYPES.DEX]: 2,
      [ABILITY_TYPES.INT]: 1
    },
    innateProficiencies: [],
    grantedSkillProficiencies: [SKILL.PERCEPTION],
    grantedToolProficiencies: [],
    summary: "Graceful, long-lived people known for keen senses and innate magical talent."
  }
];
