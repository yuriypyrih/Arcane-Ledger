import { getSpeciesEntryByName, type SpeciesEntry } from "../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterChangelingSkillProficiency,
  type CharacterStatusEntry
} from "../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "./actionEconomy";
import type {
  AbilityCheckIndicatorMap,
  FeatureActionCard,
  FeatureIndicator,
  SkillIndicatorMap
} from "./classFeatures/types";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "./statusEntries";

const changelingSpeciesId = "species-changeling-efa";
const changelingShapeShifterStatusSourceId = "species-changeling-shape-shifter";
const changelingShapeShifterName = "Shape-Shifter";
const changelingShapeShifterFallbackDescription =
  "As an action, you can shape-shift to change your appearance and your voice. You determine the specifics of the changes, including your coloration, hair length, and sex. You can also adjust your height and weight and can change your size between Medium and Small. You can make yourself appear as a member of another playable species, though none of your game statistics change. You can't duplicate the appearance of an individual you've never seen, and you must adopt a form that has the same basic arrangement of limbs that you have. This trait doesn't change your clothing and equipment.\n\nWhile shape-shifted with this trait, you have Advantage on Charisma checks.\n\nYou stay in the new form until you take an action to revert to your true form.";

export const changelingShapeShifterActionKey = "species-changeling-shape-shifter";

const changelingSkillProficiencyOptions: CharacterChangelingSkillProficiency[] = [
  "Deception",
  "Insight",
  "Intimidation",
  "Performance",
  "Persuasion"
];

const changelingSkillProficiencySet = new Set<string>(changelingSkillProficiencyOptions);
const changelingShapeShifterCharismaSkills = [
  "Deception",
  "Intimidation",
  "Performance",
  "Persuasion"
] as const;

const shapeShifterAdvantageIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: changelingShapeShifterName
};

function getChangelingEntry(): SpeciesEntry | null {
  const entry = getSpeciesEntryByName("Changeling");

  return entry?.id === changelingSpeciesId ? entry : null;
}

export function isChangelingSpecies(species: string): boolean {
  return getSpeciesEntryByName(species.trim())?.id === changelingSpeciesId;
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

function stripDescriptionHeading(value: string, heading: string): string {
  return value.replace(new RegExp(`^<strong>${heading}\\.<\\/strong>\\s*`, "i"), "").trim();
}

function getShapeShifterDescription(): string[] {
  const entry = getChangelingEntry();
  const section = entry ? getSpeciesDescriptionSection(entry, changelingShapeShifterName) : [];

  return section.length > 0 ? section : [changelingShapeShifterFallbackDescription];
}

function getShapeShifterStatusDescription(): string {
  return getShapeShifterDescription()
    .map((line, index) =>
      index === 0 ? stripDescriptionHeading(line, changelingShapeShifterName) : line
    )
    .join("\n");
}

function isChangelingSkillProficiency(
  value: unknown
): value is CharacterChangelingSkillProficiency {
  return typeof value === "string" && changelingSkillProficiencySet.has(value);
}

export function getChangelingSkillProficiencyOptionsForSpecies(
  species: string
): CharacterChangelingSkillProficiency[] {
  return isChangelingSpecies(species) ? changelingSkillProficiencyOptions : [];
}

export function normalizeChangelingSkillProficiencies(
  value: unknown
): CharacterChangelingSkillProficiency[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized: CharacterChangelingSkillProficiency[] = [];

  value.forEach((skill) => {
    if (isChangelingSkillProficiency(skill)) {
      normalized.push(skill);
    }
  });

  return normalized.slice(0, 2);
}

export function getChangelingSkillProficienciesForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>
): CharacterChangelingSkillProficiency[] {
  if (!isChangelingSpecies(character.species)) {
    return [];
  }

  return normalizeChangelingSkillProficiencies(
    character.speciesChoices?.changelingSkillProficiencies
  );
}

export function isChangelingShapeShifterStatusEntry(
  entry: Pick<CharacterStatusEntry, "sourceId">
): boolean {
  return entry.sourceId === changelingShapeShifterStatusSourceId;
}

export function normalizeChangelingShapeShifterStatusEntry(
  entry: CharacterStatusEntry
): CharacterStatusEntry {
  return {
    ...entry,
    group: STATUS_ENTRY_GROUP.EFFECTS,
    value: changelingShapeShifterName,
    source: changelingShapeShifterName,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: entry.duration,
    sourceId: changelingShapeShifterStatusSourceId,
    description: getShapeShifterStatusDescription()
  };
}

export function hasActiveChangelingShapeShifter(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) => isChangelingShapeShifterStatusEntry(entry) && !entry.disabled
  );
}

export function activateChangelingShapeShifterForCharacter(character: Character): Character {
  if (!isChangelingSpecies(character.species)) {
    return character;
  }

  const statusEntries = normalizeCharacterStatusEntries(character.statusEntries);

  return {
    ...character,
    statusEntries: [
      ...statusEntries.filter((entry) => !isChangelingShapeShifterStatusEntry(entry)),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: changelingShapeShifterName,
        source: changelingShapeShifterName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: changelingShapeShifterStatusSourceId,
        description: getShapeShifterStatusDescription()
      })
    ]
  };
}

export function activateChangelingFeatureActionForCharacter(
  character: Character,
  actionKey: string
): Character {
  return actionKey === changelingShapeShifterActionKey
    ? activateChangelingShapeShifterForCharacter(character)
    : character;
}

function getChangelingShapeShifterAction(
  character: Pick<Character, "statusEntries">
): FeatureActionCard {
  const isActive = hasActiveChangelingShapeShifter(character);
  const description = getShapeShifterDescription();
  const disabledReason = isActive ? "Shape-Shifter is already active." : undefined;

  return {
    key: changelingShapeShifterActionKey,
    name: changelingShapeShifterName,
    summary: "Change your appearance and voice.",
    detail: "Create a visible trait until you revert.",
    breakdown: isActive ? "Shape-shifted" : "Change appearance",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.UTILITY,
    isActive,
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    drawer: {
      kind: "confirm",
      eyebrow: "Changeling Trait",
      description
    },
    execute: {
      kind: "activate"
    }
  };
}

export function getChangelingActionsForCharacter(character: Character): FeatureActionCard[] {
  if (!isChangelingSpecies(character.species)) {
    return [];
  }

  return [getChangelingShapeShifterAction(character)];
}

export function getChangelingAbilityCheckIndicatorsForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "statusEntries">>
): AbilityCheckIndicatorMap {
  if (!isChangelingSpecies(character.species) || !hasActiveChangelingShapeShifter(character)) {
    return {};
  }

  return {
    CHA: [shapeShifterAdvantageIndicator]
  };
}

export function getChangelingSkillIndicatorsForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "statusEntries">>
): SkillIndicatorMap {
  if (!isChangelingSpecies(character.species) || !hasActiveChangelingShapeShifter(character)) {
    return {};
  }

  return changelingShapeShifterCharismaSkills.reduce<SkillIndicatorMap>((indicators, skill) => {
    indicators[skill] = [shapeShifterAdvantageIndicator];
    return indicators;
  }, {});
}
