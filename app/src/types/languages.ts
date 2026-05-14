import { LANGUAGE_PROFICIENCY } from "./proficiencies";

export enum LANGUAGE_CATEGORY {
  STANDARD = "STANDARD",
  RARE = "RARE"
}

export enum LANGUAGE_SCRIPT {
  COMMON = "COMMON",
  DWARVISH = "DWARVISH",
  ELVISH = "ELVISH",
  CELESTIAL = "CELESTIAL",
  INFERNAL = "INFERNAL",
  DRACONIC = "DRACONIC",
  DRUIDIC = "DRUIDIC",
  NONE = "NONE"
}

export type LanguageEntry = {
  proficiency: LANGUAGE_PROFICIENCY;
  name: string;
  category: LANGUAGE_CATEGORY;
  typicalSpeakers: string[];
  script: LANGUAGE_SCRIPT;
};

export const languageEntries: LanguageEntry[] = [
  {
    proficiency: LANGUAGE_PROFICIENCY.COMMON,
    name: "Common",
    category: LANGUAGE_CATEGORY.STANDARD,
    typicalSpeakers: ["Humans"],
    script: LANGUAGE_SCRIPT.COMMON
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.COMMON_SIGN_LANGUAGE,
    name: "Common Sign Language",
    category: LANGUAGE_CATEGORY.STANDARD,
    typicalSpeakers: ["Signers"],
    script: LANGUAGE_SCRIPT.NONE
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.DRACONIC,
    name: "Draconic",
    category: LANGUAGE_CATEGORY.STANDARD,
    typicalSpeakers: ["Dragons", "Dragonborn"],
    script: LANGUAGE_SCRIPT.DRACONIC
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.DWARVISH,
    name: "Dwarvish",
    category: LANGUAGE_CATEGORY.STANDARD,
    typicalSpeakers: ["Dwarves"],
    script: LANGUAGE_SCRIPT.DWARVISH
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.ELVISH,
    name: "Elvish",
    category: LANGUAGE_CATEGORY.STANDARD,
    typicalSpeakers: ["Elves"],
    script: LANGUAGE_SCRIPT.ELVISH
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.GIANT,
    name: "Giant",
    category: LANGUAGE_CATEGORY.STANDARD,
    typicalSpeakers: ["Ogres", "Giants"],
    script: LANGUAGE_SCRIPT.DWARVISH
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.GNOMISH,
    name: "Gnomish",
    category: LANGUAGE_CATEGORY.STANDARD,
    typicalSpeakers: ["Gnomes"],
    script: LANGUAGE_SCRIPT.DWARVISH
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.GOBLIN,
    name: "Goblin",
    category: LANGUAGE_CATEGORY.STANDARD,
    typicalSpeakers: ["Goblinoids"],
    script: LANGUAGE_SCRIPT.DWARVISH
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.HALFLING,
    name: "Halfling",
    category: LANGUAGE_CATEGORY.STANDARD,
    typicalSpeakers: ["Halflings"],
    script: LANGUAGE_SCRIPT.COMMON
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.ORC,
    name: "Orc",
    category: LANGUAGE_CATEGORY.STANDARD,
    typicalSpeakers: ["Orcs"],
    script: LANGUAGE_SCRIPT.DWARVISH
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.ABYSSAL,
    name: "Abyssal",
    category: LANGUAGE_CATEGORY.RARE,
    typicalSpeakers: ["Demons"],
    script: LANGUAGE_SCRIPT.INFERNAL
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.CELESTIAL,
    name: "Celestial",
    category: LANGUAGE_CATEGORY.RARE,
    typicalSpeakers: ["Celestials"],
    script: LANGUAGE_SCRIPT.CELESTIAL
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.DEEP_SPEECH,
    name: "Deep Speech",
    category: LANGUAGE_CATEGORY.RARE,
    typicalSpeakers: ["Aboleths", "Cloakers"],
    script: LANGUAGE_SCRIPT.NONE
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.DRUIDIC,
    name: "Druidic",
    category: LANGUAGE_CATEGORY.RARE,
    typicalSpeakers: ["Druids"],
    script: LANGUAGE_SCRIPT.DRUIDIC
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.INFERNAL,
    name: "Infernal",
    category: LANGUAGE_CATEGORY.RARE,
    typicalSpeakers: ["Devils"],
    script: LANGUAGE_SCRIPT.INFERNAL
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.PRIMORDIAL,
    name: "Primordial",
    category: LANGUAGE_CATEGORY.RARE,
    typicalSpeakers: ["Elementals"],
    script: LANGUAGE_SCRIPT.DWARVISH
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.SYLVAN,
    name: "Sylvan",
    category: LANGUAGE_CATEGORY.RARE,
    typicalSpeakers: ["Fey creatures"],
    script: LANGUAGE_SCRIPT.ELVISH
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.THIEVES_CANT,
    name: "Thieves' Cant",
    category: LANGUAGE_CATEGORY.RARE,
    typicalSpeakers: ["Rogues"],
    script: LANGUAGE_SCRIPT.NONE
  },
  {
    proficiency: LANGUAGE_PROFICIENCY.UNDERCOMMON,
    name: "Undercommon",
    category: LANGUAGE_CATEGORY.RARE,
    typicalSpeakers: ["Underworld traders"],
    script: LANGUAGE_SCRIPT.ELVISH
  }
];

export const standardLanguageEntries = languageEntries.filter(
  (entry) => entry.category === LANGUAGE_CATEGORY.STANDARD
);

export const rareLanguageEntries = languageEntries.filter(
  (entry) => entry.category === LANGUAGE_CATEGORY.RARE
);

export const languageEntriesByProficiency = new Map(
  languageEntries.map((entry) => [entry.proficiency, entry] as const)
);

export function getLanguageEntry(
  proficiency: LANGUAGE_PROFICIENCY
): LanguageEntry | null {
  return languageEntriesByProficiency.get(proficiency) ?? null;
}
