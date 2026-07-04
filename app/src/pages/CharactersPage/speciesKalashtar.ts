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
  isSkillName,
  type Character,
  type CharacterStatusEntry,
  type SkillName
} from "../../types";
import { createSourcedDescriptionEntries } from "./actionModalDescriptions";
import type { FeatureIndicator, SavingThrowIndicatorMap } from "./classFeatures/types";
import type { FeatureDescriptionContribution } from "./featureContributions";

type KalashtarRuntimeCharacter = Pick<Character, "species"> &
  Partial<Pick<Character, "speciesChoices">>;

const kalashtarSpeciesId = "species-kalashtar-efa";
const kalashtarName = "Kalashtar";
const dualMindName = "Dual Mind";
const mentalDisciplineName = "Mental Discipline";

function getKalashtarEntry(): SpeciesEntry | null {
  const entry = getSpeciesEntryByName(kalashtarName);

  return entry?.id === kalashtarSpeciesId ? entry : null;
}

function getKalashtarDescriptionSection(heading: string): SpellDescriptionEntry[] {
  const description = getKalashtarEntry()?.rulesDescription.filter(
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

function getKalashtarDescriptionText(heading: string, fallback: string): string {
  const section = getKalashtarDescriptionSection(heading);

  return section.length > 0 ? section.join("\n") : fallback;
}

function getDualMindDescriptionAddition(): SpellDescriptionEntry[] {
  const description = getKalashtarDescriptionSection(dualMindName);

  return createSourcedDescriptionEntries(
    dualMindName,
    description.length > 0
      ? description
      : ["You have Advantage on Wisdom and Charisma saving throws."]
  );
}

function createKalashtarStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value" | "description"> & {
    sourceId: string;
  }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: kalashtarName,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: null,
    description: options.description
  };
}

export function isKalashtarSpecies(species: string): boolean {
  return getSpeciesEntryByName(species.trim())?.id === kalashtarSpeciesId;
}

export function normalizeKalashtarSkillProficiency(value: unknown): SkillName | undefined {
  return typeof value === "string" && isSkillName(value) ? value : undefined;
}

export function getKalashtarSkillProficiencyOptionsForSpecies(species: string): SkillName[] {
  return isKalashtarSpecies(species) ? [...ALL_SKILLS] : [];
}

export function getKalashtarSkillProficiencyForCharacter(
  character: KalashtarRuntimeCharacter
): SkillName | null {
  if (!isKalashtarSpecies(character.species)) {
    return null;
  }

  return (
    normalizeKalashtarSkillProficiency(character.speciesChoices?.kalashtarSkillProficiency) ?? null
  );
}

export function getKalashtarDerivedStatusEntriesForCharacter(
  character: KalashtarRuntimeCharacter
): CharacterStatusEntry[] {
  if (!isKalashtarSpecies(character.species)) {
    return [];
  }

  const mentalDisciplineDescription = getKalashtarDescriptionText(
    mentalDisciplineName,
    "You have Resistance to Psychic damage."
  );

  return [
    createKalashtarStatusEntry({
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.PSYCHIC,
      sourceId: "species-kalashtar-mental-discipline-psychic",
      description: mentalDisciplineDescription
    })
  ];
}

export function getKalashtarDescriptionContributionsForCharacter(
  character: KalashtarRuntimeCharacter
): FeatureDescriptionContribution[] {
  if (!isKalashtarSpecies(character.species)) {
    return [];
  }

  return [
    {
      id: "species-kalashtar-dual-mind-wis-saving-throw",
      target: "stat",
      targetKey: "savingThrow:WIS",
      getDescriptionAdditions: () => [getDualMindDescriptionAddition()]
    },
    {
      id: "species-kalashtar-dual-mind-cha-saving-throw",
      target: "stat",
      targetKey: "savingThrow:CHA",
      getDescriptionAdditions: () => [getDualMindDescriptionAddition()]
    }
  ];
}

export function getKalashtarSavingThrowIndicatorsForCharacter(
  character: KalashtarRuntimeCharacter
): SavingThrowIndicatorMap {
  if (!isKalashtarSpecies(character.species)) {
    return {};
  }

  const indicator: FeatureIndicator = {
    label: "Advantage",
    tone: "advantage",
    source: dualMindName
  };

  return {
    WIS: [indicator],
    CHA: [indicator]
  };
}
