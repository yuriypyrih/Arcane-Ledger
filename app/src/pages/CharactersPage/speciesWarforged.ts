import {
  DAMAGE_TYPE,
  getSpeciesEntryByName,
  type SpeciesEntry,
  type SpellDescriptionEntry
} from "../../codex/entries";
import {
  ALL_SKILLS,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  TOOL_PROFICIENCY,
  isSkillName,
  type Character,
  type CharacterStatusEntry,
  type SkillName
} from "../../types";
import { createSourcedDescriptionEntries } from "./actionModalDescriptions";
import type { FeatureArmorClassBonus } from "./classFeatures/types";
import { groupedToolProficiencyOptions, toolProficiencyOptions } from "./proficiencyOptions";
import type { RestDescriptionInjectionSection } from "./classFeatures/restDescriptionInjections";

type WarforgedRuntimeCharacter = Pick<Character, "species"> &
  Partial<Pick<Character, "speciesChoices">>;

const warforgedSpeciesId = "species-warforged-efa";
const warforgedName = "Warforged";
const constructResilienceName = "Construct Resilience";
const integratedProtectionName = "Integrated Protection";
const specializedDesignName = "Specialized Design";
const sentrysRestName = "Sentry's Rest";
const tirelessName = "Tireless";

const toolProficiencySet = new Set<string>(toolProficiencyOptions);

function getWarforgedEntry(): SpeciesEntry | null {
  const entry = getSpeciesEntryByName(warforgedName);

  return entry?.id === warforgedSpeciesId ? entry : null;
}

function getWarforgedDescriptionSection(heading: string): SpellDescriptionEntry[] {
  const description = getWarforgedEntry()?.description.filter(
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

function getWarforgedDescriptionText(heading: string, fallback: string): string {
  const section = getWarforgedDescriptionSection(heading);

  return section.length > 0 ? section.join("\n") : fallback;
}

function createWarforgedStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value" | "description"> & {
    sourceId: string;
    source?: string;
  }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: options.source ?? warforgedName,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: null,
    description: options.description
  };
}

export function isWarforgedSpecies(species: string): boolean {
  return getSpeciesEntryByName(species.trim())?.id === warforgedSpeciesId;
}

export function normalizeWarforgedSkillProficiency(value: unknown): SkillName | undefined {
  return typeof value === "string" && isSkillName(value) ? value : undefined;
}

export function normalizeWarforgedToolProficiency(
  value: unknown
): TOOL_PROFICIENCY | undefined {
  return typeof value === "string" && toolProficiencySet.has(value)
    ? (value as TOOL_PROFICIENCY)
    : undefined;
}

export function getWarforgedSkillProficiencyOptionsForSpecies(
  species: string
): SkillName[] {
  return isWarforgedSpecies(species) ? [...ALL_SKILLS] : [];
}

export function getWarforgedToolProficiencyOptionsForSpecies(
  species: string
): TOOL_PROFICIENCY[] {
  return isWarforgedSpecies(species) ? [...groupedToolProficiencyOptions] : [];
}

export function getWarforgedSkillProficiencyForCharacter(
  character: WarforgedRuntimeCharacter
): SkillName | null {
  if (!isWarforgedSpecies(character.species)) {
    return null;
  }

  return normalizeWarforgedSkillProficiency(
    character.speciesChoices?.warforgedSkillProficiency
  ) ?? null;
}

export function getWarforgedToolProficiencyForCharacter(
  character: WarforgedRuntimeCharacter
): TOOL_PROFICIENCY | null {
  if (!isWarforgedSpecies(character.species)) {
    return null;
  }

  return normalizeWarforgedToolProficiency(
    character.speciesChoices?.warforgedToolProficiency
  ) ?? null;
}

export function getWarforgedDerivedStatusEntriesForCharacter(
  character: WarforgedRuntimeCharacter
): CharacterStatusEntry[] {
  if (!isWarforgedSpecies(character.species)) {
    return [];
  }

  return [
    createWarforgedStatusEntry({
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.POISON,
      sourceId: "species-warforged-construct-resilience-poison",
      source: constructResilienceName,
      description: "You have Resistance to Poison damage."
    }),
    createWarforgedStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: tirelessName,
      sourceId: "species-warforged-tireless",
      source: warforgedName,
      description: getWarforgedDescriptionText(
        tirelessName,
        "You don't gain Exhaustion levels from dehydration, malnutrition, or suffocation."
      )
    })
  ];
}

export function getWarforgedArmorClassBonusesForCharacter(
  character: WarforgedRuntimeCharacter
): FeatureArmorClassBonus[] {
  return isWarforgedSpecies(character.species)
    ? [
        {
          label: integratedProtectionName,
          value: 1
        }
      ]
    : [];
}

export function getWarforgedLongRestDescriptionAdditionsForCharacter(
  character: WarforgedRuntimeCharacter
): RestDescriptionInjectionSection[] {
  if (!isWarforgedSpecies(character.species)) {
    return [];
  }

  return [
    createSourcedDescriptionEntries(
      sentrysRestName,
      getWarforgedDescriptionSection(sentrysRestName).length > 0
        ? getWarforgedDescriptionSection(sentrysRestName)
        : [
            "You don't need to sleep, and magic can't put you to sleep. You can finish a Long Rest in 6 hours if you spend those hours in an inactive, motionless state. During this time, you appear inert but remain conscious."
          ]
    )
  ];
}

export function getWarforgedSpecializedDesignSummaryLabel(): string {
  return specializedDesignName;
}
