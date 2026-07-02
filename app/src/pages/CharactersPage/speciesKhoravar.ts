import {
  SPELL_LIST_CLASS,
  getSpeciesEntryByName,
  getSpellEntries,
  getSpellEntryById,
  type SpeciesEntry,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../codex/entries";
import {
  ALL_SKILLS,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  TOOL_PROFICIENCY,
  isSkillName,
  type AbilityKey,
  type Character,
  type CharacterKhoravarSpellcastingAbility,
  type CharacterSpeciesChoices,
  type CharacterStatusEntry,
  type SkillName
} from "../../types";
import { addSpellSource } from "./classFeatures/spellSources";
import type { SpellSourceMap } from "./classFeatures/types";
import { groupedToolProficiencyOptions, toolProficiencyOptions } from "./proficiencyOptions";

type KhoravarRuntimeCharacter = Pick<Character, "species"> &
  Partial<Pick<Character, "speciesChoices">>;

const khoravarSpeciesId = "species-khoravar-efa";
const khoravarName = "Khoravar";
const darkvisionName = "Darkvision";
const feyGiftName = "Fey Gift";
const skillVersatilityName = "Skill Versatility";
const friendsSpellId = "spell-friends";
const khoravarSkillChoicePrefix = "skill:";
const khoravarToolChoicePrefix = "tool:";
const khoravarSpellcastingAbilityOptions = [
  "INT",
  "WIS",
  "CHA"
] as const satisfies readonly CharacterKhoravarSpellcastingAbility[];
const khoravarSpellcastingAbilitySet = new Set<string>(khoravarSpellcastingAbilityOptions);
const toolProficiencySet = new Set<string>(toolProficiencyOptions);
const khoravarCantripSpellLists = [
  SPELL_LIST_CLASS.CLERIC,
  SPELL_LIST_CLASS.DRUID,
  SPELL_LIST_CLASS.WIZARD
];

function getKhoravarEntry(): SpeciesEntry | null {
  const entry = getSpeciesEntryByName(khoravarName);

  return entry?.id === khoravarSpeciesId ? entry : null;
}

function getKhoravarDescriptionSection(heading: string): SpellDescriptionEntry[] {
  const description = getKhoravarEntry()?.description.filter(
    (descriptionEntry): descriptionEntry is string => typeof descriptionEntry === "string"
  );

  if (!description) {
    return [];
  }

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

function getKhoravarDescriptionText(heading: string, fallback: string): string {
  const section = getKhoravarDescriptionSection(heading);

  return section.length > 0 ? section.join("\n") : fallback;
}

function createKhoravarStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value"> &
    Partial<Pick<CharacterStatusEntry, "rangeFeet" | "description">> & {
      sourceId: string;
    }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: khoravarName,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: options.rangeFeet ?? null,
    description: options.description
  };
}

function getKhoravarCantripEntries(): SpellEntry[] {
  return getSpellEntries()
    .filter(
      (spell) =>
        spell.spellLevel === 0 &&
        khoravarCantripSpellLists.some((spellList) => spell.spellLists.includes(spellList))
    )
    .sort((left, right) => left.name.localeCompare(right.name));
}

function isKhoravarCantripId(value: string): boolean {
  return getKhoravarCantripEntries().some((spell) => spell.id === value);
}

export function isKhoravarSpecies(species: string): boolean {
  return getSpeciesEntryByName(species.trim())?.id === khoravarSpeciesId;
}

export function normalizeKhoravarSkillProficiency(value: unknown): SkillName | undefined {
  return typeof value === "string" && isSkillName(value) ? value : undefined;
}

export function normalizeKhoravarToolProficiency(
  value: unknown
): TOOL_PROFICIENCY | undefined {
  return typeof value === "string" && toolProficiencySet.has(value)
    ? (value as TOOL_PROFICIENCY)
    : undefined;
}

export function normalizeKhoravarCantripId(value: unknown): string | undefined {
  return typeof value === "string" && isKhoravarCantripId(value) ? value : undefined;
}

export function normalizeKhoravarSpellcastingAbility(
  value: unknown
): CharacterKhoravarSpellcastingAbility | undefined {
  return typeof value === "string" && khoravarSpellcastingAbilitySet.has(value)
    ? (value as CharacterKhoravarSpellcastingAbility)
    : undefined;
}

export function getDefaultKhoravarCantripIdForSpecies(species: string): string | undefined {
  return isKhoravarSpecies(species) ? friendsSpellId : undefined;
}

export function getKhoravarSkillProficiencyOptionsForSpecies(species: string): SkillName[] {
  return isKhoravarSpecies(species) ? [...ALL_SKILLS] : [];
}

export function getKhoravarToolProficiencyOptionsForSpecies(
  species: string
): TOOL_PROFICIENCY[] {
  return isKhoravarSpecies(species) ? [...groupedToolProficiencyOptions] : [];
}

export function getKhoravarCantripOptionsForSpecies(species: string): SpellEntry[] {
  return isKhoravarSpecies(species) ? getKhoravarCantripEntries() : [];
}

export function getKhoravarSpellcastingAbilityOptionsForSpecies(
  species: string
): CharacterKhoravarSpellcastingAbility[] {
  return isKhoravarSpecies(species) ? [...khoravarSpellcastingAbilityOptions] : [];
}

export function createKhoravarSkillProficiencyChoiceValue(skill: SkillName): string {
  return `${khoravarSkillChoicePrefix}${skill}`;
}

export function createKhoravarToolProficiencyChoiceValue(tool: TOOL_PROFICIENCY): string {
  return `${khoravarToolChoicePrefix}${tool}`;
}

export function parseKhoravarProficiencyChoiceValue(
  value: string
): Pick<CharacterSpeciesChoices, "khoravarSkillProficiency" | "khoravarToolProficiency"> {
  if (value.startsWith(khoravarSkillChoicePrefix)) {
    return {
      khoravarSkillProficiency: normalizeKhoravarSkillProficiency(
        value.slice(khoravarSkillChoicePrefix.length)
      )
    };
  }

  if (value.startsWith(khoravarToolChoicePrefix)) {
    return {
      khoravarToolProficiency: normalizeKhoravarToolProficiency(
        value.slice(khoravarToolChoicePrefix.length)
      )
    };
  }

  return {};
}

export function getKhoravarSkillProficiencyForCharacter(
  character: KhoravarRuntimeCharacter
): SkillName | null {
  if (!isKhoravarSpecies(character.species)) {
    return null;
  }

  return normalizeKhoravarSkillProficiency(
    character.speciesChoices?.khoravarSkillProficiency
  ) ?? null;
}

export function getKhoravarToolProficiencyForCharacter(
  character: KhoravarRuntimeCharacter
): TOOL_PROFICIENCY | null {
  if (!isKhoravarSpecies(character.species)) {
    return null;
  }

  return normalizeKhoravarToolProficiency(
    character.speciesChoices?.khoravarToolProficiency
  ) ?? null;
}

export function getKhoravarProficiencyChoiceValueForCharacter(
  character: KhoravarRuntimeCharacter
): string {
  const skill = getKhoravarSkillProficiencyForCharacter(character);

  if (skill) {
    return createKhoravarSkillProficiencyChoiceValue(skill);
  }

  const tool = getKhoravarToolProficiencyForCharacter(character);

  return tool ? createKhoravarToolProficiencyChoiceValue(tool) : "";
}

export function getKhoravarSelectedCantripIdForCharacter(
  character: KhoravarRuntimeCharacter
): string | null {
  if (!isKhoravarSpecies(character.species)) {
    return null;
  }

  return (
    normalizeKhoravarCantripId(character.speciesChoices?.khoravarCantripId) ??
    getDefaultKhoravarCantripIdForSpecies(character.species) ??
    null
  );
}

export function getKhoravarCantripForCharacter(
  character: KhoravarRuntimeCharacter
): SpellEntry | null {
  const cantripId = getKhoravarSelectedCantripIdForCharacter(character);

  return cantripId ? getSpellEntryById(cantripId) : null;
}

export function getKhoravarGrantedCantripEntriesForCharacter(
  character: KhoravarRuntimeCharacter
): SpellEntry[] {
  const spell = getKhoravarCantripForCharacter(character);

  return spell ? [spell] : [];
}

export function getKhoravarAlwaysPreparedSpellSourceMapForCharacter(
  character: KhoravarRuntimeCharacter
): SpellSourceMap {
  const sourceMap: SpellSourceMap = {};
  const cantripId = getKhoravarSelectedCantripIdForCharacter(character);

  if (cantripId) {
    addSpellSource(sourceMap, cantripId, feyGiftName);
  }

  return sourceMap;
}

export function getKhoravarSpellcastingAbilityForCharacter(
  character: KhoravarRuntimeCharacter,
  spellId: string
): AbilityKey | null {
  const cantripId = getKhoravarSelectedCantripIdForCharacter(character);

  if (!cantripId || spellId !== cantripId) {
    return null;
  }

  return (
    normalizeKhoravarSpellcastingAbility(character.speciesChoices?.khoravarSpellcastingAbility) ??
    null
  );
}

export function getKhoravarDerivedStatusEntriesForCharacter(
  character: Pick<Character, "species">
): CharacterStatusEntry[] {
  if (!isKhoravarSpecies(character.species)) {
    return [];
  }

  return [
    createKhoravarStatusEntry({
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      sourceId: "species-khoravar-darkvision",
      rangeFeet: 60,
      description: getKhoravarDescriptionText(
        darkvisionName,
        "You have Darkvision with a range of 60 feet."
      )
    })
  ];
}

export function getKhoravarSkillVersatilitySummaryLabel(): string {
  return skillVersatilityName;
}

export function getKhoravarFeyGiftSummaryLabel(): string {
  return feyGiftName;
}
