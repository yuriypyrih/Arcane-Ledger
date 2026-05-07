import {
  getSpeciesEntryByName,
  getSpellEntryById,
  type SpellEntry,
  type SpeciesEntry
} from "../../codex/entries";
import {
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type AbilityKey,
  type Character,
  type CharacterElfLineage,
  type CharacterElfSkillProficiency,
  type CharacterElfSpellcastingAbility,
  type CharacterStatusEntry,
  type SkillName
} from "../../types";
import { addSpellSource } from "./classFeatures/spellSources";
import type { FeatureSpeedBonus, SpellSourceMap } from "./classFeatures/types";

export type ElfLineageOption = {
  key: CharacterElfLineage;
  name: string;
};

const elfSpeciesId = "species-elf-2024";
const elfDefaultLineage: CharacterElfLineage = "high-elf";
const elfDefaultSkillProficiency: CharacterElfSkillProficiency = "Perception";
const elfDefaultSpellcastingAbility: CharacterElfSpellcastingAbility = "INT";
const elfSkillProficiencyOptions = [
  "Insight",
  "Perception",
  "Survival"
] as const satisfies readonly CharacterElfSkillProficiency[];
const elfSpellcastingAbilityOptions = [
  "INT",
  "WIS",
  "CHA"
] as const satisfies readonly CharacterElfSpellcastingAbility[];
const elfLineageOptions = [
  {
    key: "drow",
    name: "Drow"
  },
  {
    key: "high-elf",
    name: "High Elf"
  },
  {
    key: "wood-elf",
    name: "Wood Elf"
  }
] as const satisfies readonly ElfLineageOption[];

const elfLineageCantripIds: Record<CharacterElfLineage, string> = {
  drow: "spell-dancing-lights",
  "high-elf": "spell-prestidigitation",
  "wood-elf": "spell-druidcraft"
};

const elfLineageSpellIdsByLevel: Record<
  CharacterElfLineage,
  Array<{ level: number; id: string }>
> = {
  drow: [
    {
      level: 3,
      id: "spell-faerie-fire"
    },
    {
      level: 5,
      id: "spell-darkness"
    }
  ],
  "high-elf": [
    {
      level: 3,
      id: "spell-detect-magic"
    },
    {
      level: 5,
      id: "spell-misty-step"
    }
  ],
  "wood-elf": [
    {
      level: 3,
      id: "spell-longstrider"
    },
    {
      level: 5,
      id: "spell-pass-without-trace"
    }
  ]
};

const elfLineageNameByKey = elfLineageOptions.reduce<Record<CharacterElfLineage, string>>(
  (names, option) => {
    names[option.key] = option.name;
    return names;
  },
  {} as Record<CharacterElfLineage, string>
);
const elfLineageAliases = new Map<string, CharacterElfLineage>();
const elfSkillProficiencySet = new Set<string>(elfSkillProficiencyOptions);
const elfSpellcastingAbilitySet = new Set<string>(elfSpellcastingAbilityOptions);

elfLineageOptions.forEach((option) => {
  elfLineageAliases.set(option.key, option.key);
  elfLineageAliases.set(option.name.toLowerCase(), option.key);
});
elfLineageAliases.set("high", "high-elf");
elfLineageAliases.set("wood", "wood-elf");
elfLineageAliases.set("woof", "wood-elf");
elfLineageAliases.set("woof elf", "wood-elf");
elfLineageAliases.set("woof-elf", "wood-elf");

type ElfRuntimeCharacter = Pick<Character, "species"> &
  Partial<Pick<Character, "level" | "speciesChoices">>;

function getElfEntry(species = "Elf"): SpeciesEntry | null {
  const entry = getSpeciesEntryByName(species.trim());

  return entry?.id === elfSpeciesId ? entry : null;
}

function getSpeciesDescriptionSection(entry: SpeciesEntry, heading: string): string[] {
  const description = entry.description.filter(
    (descriptionEntry): descriptionEntry is string => typeof descriptionEntry === "string"
  );
  const startIndex = description.findIndex((descriptionEntry) =>
    descriptionEntry.includes(`<strong>${heading}.`)
  );

  if (startIndex < 0) {
    return [];
  }

  const section: string[] = [];

  for (let index = startIndex; index < description.length; index += 1) {
    const descriptionEntry = description[index]!;

    if (index > startIndex && descriptionEntry.startsWith("<strong>")) {
      break;
    }

    section.push(descriptionEntry);
  }

  return section;
}

function getSpeciesDescriptionText(entry: SpeciesEntry, heading: string, fallback: string): string {
  const section = getSpeciesDescriptionSection(entry, heading);
  return section.length > 0 ? section.join("\n") : fallback;
}

function createElfStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value" | "description"> &
    Partial<Pick<CharacterStatusEntry, "rangeFeet">> & {
      sourceId: string;
    }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: "Elf",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: options.rangeFeet ?? null,
    description: options.description
  };
}

export function isElfSpecies(species: string): boolean {
  return getElfEntry(species) !== null;
}

export function normalizeElfLineage(value: unknown): CharacterElfLineage | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return elfLineageAliases.get(value.trim().toLowerCase());
}

export function normalizeElfSkillProficiency(
  value: unknown
): CharacterElfSkillProficiency | undefined {
  return typeof value === "string" && elfSkillProficiencySet.has(value)
    ? (value as CharacterElfSkillProficiency)
    : undefined;
}

export function normalizeElfSpellcastingAbility(
  value: unknown
): CharacterElfSpellcastingAbility | undefined {
  return typeof value === "string" && elfSpellcastingAbilitySet.has(value)
    ? (value as CharacterElfSpellcastingAbility)
    : undefined;
}

export function getDefaultElfLineageForSpecies(species: string): CharacterElfLineage | undefined {
  return isElfSpecies(species) ? elfDefaultLineage : undefined;
}

export function getDefaultElfSkillProficiencyForSpecies(
  species: string
): CharacterElfSkillProficiency | undefined {
  return isElfSpecies(species) ? elfDefaultSkillProficiency : undefined;
}

export function getDefaultElfSpellcastingAbilityForSpecies(
  species: string
): CharacterElfSpellcastingAbility | undefined {
  return isElfSpecies(species) ? elfDefaultSpellcastingAbility : undefined;
}

export function getElfLineageOptionsForSpecies(species: string): ElfLineageOption[] {
  return isElfSpecies(species) ? [...elfLineageOptions] : [];
}

export function getElfSkillProficiencyOptionsForSpecies(
  species: string
): CharacterElfSkillProficiency[] {
  return isElfSpecies(species) ? [...elfSkillProficiencyOptions] : [];
}

export function getElfSpellcastingAbilityOptionsForSpecies(
  species: string
): CharacterElfSpellcastingAbility[] {
  return isElfSpecies(species) ? [...elfSpellcastingAbilityOptions] : [];
}

export function formatElfLineageOptionLabel(option: ElfLineageOption): string {
  return option.name;
}

export function getElfSkillProficiencyForCharacter(
  character: ElfRuntimeCharacter
): SkillName | null {
  if (!isElfSpecies(character.species)) {
    return null;
  }

  return normalizeElfSkillProficiency(character.speciesChoices?.elvenSkillProficiency) ?? null;
}

export function getElfGrantedCantripEntriesForCharacter(
  character: ElfRuntimeCharacter
): SpellEntry[] {
  const lineage = normalizeElfLineage(character.speciesChoices?.elvenLineage);

  if (!isElfSpecies(character.species) || !lineage) {
    return [];
  }

  const spell = getSpellEntryById(elfLineageCantripIds[lineage]);

  return spell ? [spell] : [];
}

export function getElfAlwaysPreparedSpellIdsForCharacter(character: ElfRuntimeCharacter): string[] {
  const lineage = normalizeElfLineage(character.speciesChoices?.elvenLineage);

  if (!isElfSpecies(character.species) || !lineage) {
    return [];
  }

  const level = Math.max(1, character.level ?? 1);

  return elfLineageSpellIdsByLevel[lineage]
    .filter((spell) => level >= spell.level)
    .map((spell) => spell.id);
}

export function getElfAlwaysPreparedSpellSourceMapForCharacter(
  character: ElfRuntimeCharacter
): SpellSourceMap {
  const lineage = normalizeElfLineage(character.speciesChoices?.elvenLineage);
  const sourceMap: SpellSourceMap = {};

  if (!isElfSpecies(character.species) || !lineage) {
    return sourceMap;
  }

  const source = elfLineageNameByKey[lineage];
  addSpellSource(sourceMap, elfLineageCantripIds[lineage], source);

  getElfAlwaysPreparedSpellIdsForCharacter(character).forEach((spellId) => {
    addSpellSource(sourceMap, spellId, source);
  });

  return sourceMap;
}

export function getElfSpellcastingAbilityForCharacter(
  character: ElfRuntimeCharacter,
  spellId: string
): AbilityKey | null {
  const lineage = normalizeElfLineage(character.speciesChoices?.elvenLineage);

  if (!isElfSpecies(character.species) || !lineage) {
    return null;
  }

  const lineageSpellIds = new Set([
    elfLineageCantripIds[lineage],
    ...elfLineageSpellIdsByLevel[lineage].map((spell) => spell.id)
  ]);

  if (!lineageSpellIds.has(spellId)) {
    return null;
  }

  return (
    normalizeElfSpellcastingAbility(character.speciesChoices?.elvenSpellcastingAbility) ?? null
  );
}

export function getElfSpeedBonusesForCharacter(
  character: ElfRuntimeCharacter
): FeatureSpeedBonus[] {
  if (
    !isElfSpecies(character.species) ||
    normalizeElfLineage(character.speciesChoices?.elvenLineage) !== "wood-elf"
  ) {
    return [];
  }

  return [
    {
      label: "Wood Elf",
      value: 5
    }
  ];
}

export function getElfDerivedStatusEntriesForCharacter(
  character: ElfRuntimeCharacter
): CharacterStatusEntry[] {
  const entry = getElfEntry(character.species);

  if (!entry) {
    return [];
  }

  const lineage = normalizeElfLineage(character.speciesChoices?.elvenLineage);
  const darkvisionDescription = getSpeciesDescriptionText(
    entry,
    "Darkvision",
    "You have Darkvision with a range of 60 feet."
  );
  const drowDarkvisionDescription =
    lineage === "drow"
      ? `${darkvisionDescription}\nDrow: The range of your Darkvision increases to 120 feet.`
      : darkvisionDescription;
  const feyAncestryDescription = getSpeciesDescriptionText(
    entry,
    "Fey Ancestry",
    "You have Advantage on saving throws you make to avoid or end the Charmed condition."
  );
  const tranceDescription = getSpeciesDescriptionText(
    entry,
    "Trance",
    "You don't need to sleep, and magic can't put you to sleep. You can finish a Long Rest in 4 hours if you spend those hours in a trancelike meditation, during which you retain consciousness."
  );

  return [
    createElfStatusEntry({
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      sourceId: "species-elf-darkvision",
      rangeFeet: lineage === "drow" ? 120 : 60,
      description: drowDarkvisionDescription
    }),
    createElfStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: "Elf Traits",
      sourceId: "species-elf-traits",
      description: `${feyAncestryDescription}\n${tranceDescription}`
    })
  ];
}
