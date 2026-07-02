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
  type CharacterRebornFeatureState,
  type CharacterRebornResistance,
  type CharacterStatusEntry,
  type SkillName
} from "../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "./actionEconomy";
import { createSourcedDescriptionEntries } from "./actionModalDescriptions";
import { createChargesCardUsage } from "./classFeatures/cardUsage";
import type { FeatureActionCard } from "./classFeatures/types";

type RebornRuntimeCharacter = Pick<Character, "species"> &
  Partial<Pick<Character, "speciesChoices" | "speciesFeatureState">>;
type RebornActionCharacter = Pick<Character, "species" | "level"> &
  Partial<Pick<Character, "speciesChoices" | "speciesFeatureState">>;

const rebornSpeciesId = "species-reborn-rhw";
const rebornName = "Reborn";
const escapedDeathName = "Escaped Death";
const everlastingName = "Everlasting";
const knowledgeFromPastLifeName = "Knowledge from a Past Life";
const strangeEnduranceName = "Strange Endurance";
export const rebornKnowledgeFromPastLifeActionKey = "species-reborn-knowledge-from-past-life";
export const rebornKnowledgeFromPastLifeRollFormula = "1d6";

const rebornResistanceOptions = [
  DAMAGE_TYPE.COLD,
  DAMAGE_TYPE.NECROTIC,
  DAMAGE_TYPE.POISON
] as const satisfies readonly CharacterRebornResistance[];
const rebornResistanceOptionSet = new Set<string>(rebornResistanceOptions);

function getRebornEntry(): SpeciesEntry | null {
  const entry = getSpeciesEntryByName(rebornName);

  return entry?.id === rebornSpeciesId ? entry : null;
}

function getRebornDescriptionSection(heading: string): SpellDescriptionEntry[] {
  const description = getRebornEntry()?.description.filter(
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

function getRebornDescriptionText(heading: string, fallback: string): string {
  const section = getRebornDescriptionSection(heading);

  return section.length > 0 ? section.join("\n") : fallback;
}

function getEscapedDeathDescriptionAddition(): SpellDescriptionEntry[] {
  const description = getRebornDescriptionSection(escapedDeathName);

  return createSourcedDescriptionEntries(
    escapedDeathName,
    description.length > 0
      ? description
      : ["You have Advantage on Death Saving Throws."]
  );
}

function getEverlastingDescriptionAddition(): SpellDescriptionEntry[] {
  const description = getRebornDescriptionSection(everlastingName);

  return createSourcedDescriptionEntries(
    everlastingName,
    description.length > 0
      ? description
      : [
          "You don't gain Exhaustion levels from dehydration, malnutrition, or suffocation. You don't need to sleep, and magic can't put you to sleep. You can finish a Long Rest in 4 hours if you spend those hours in an inactive, motionless state, during which you retain consciousness."
        ]
  );
}

function getKnowledgeFromPastLifeDescription(): SpellDescriptionEntry[] {
  const description = getRebornDescriptionSection(knowledgeFromPastLifeName);

  return description.length > 0
    ? description
    : [
        "You gain proficiency in one skill of your choice.",
        "In addition, you can temporarily peer into the past to aid you in the present. When you fail an ability check, you can roll 1d6 and add the number rolled to the d20, potentially turning the failure into a success. You can do this a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest."
      ];
}

function getSpeciesProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function clampExpendedUses(value: unknown): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? Math.max(0, Math.floor(parsedValue)) : 0;
}

function getRebornFeatureState(
  character: Partial<Pick<Character, "speciesFeatureState">>
): CharacterRebornFeatureState {
  return character.speciesFeatureState?.reborn ?? {};
}

function setRebornFeatureState(
  character: Character,
  state: CharacterRebornFeatureState
): Character {
  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      reborn: {
        ...getRebornFeatureState(character),
        ...state
      }
    }
  };
}

function createRebornStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value" | "description"> & {
    sourceId: string;
    source: string;
  }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: options.source,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: null,
    description: options.description
  };
}

function getRebornKnowledgeFromPastLifeAction(
  character: RebornActionCharacter
): FeatureActionCard {
  const total = getRebornKnowledgeFromPastLifeUsesTotal(character);
  const remaining = getRebornKnowledgeFromPastLifeUsesRemaining(character);
  const description = getKnowledgeFromPastLifeDescription();
  const disabledReason =
    remaining <= 0
      ? "Knowledge from a Past Life recharges when you finish a Long Rest."
      : undefined;

  return {
    key: rebornKnowledgeFromPastLifeActionKey,
    name: knowledgeFromPastLifeName,
    summary: "Peer into a past life.",
    detail: "Add 1d6 to a failed ability check.",
    breakdown: "Boost a failed check",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining: remaining,
    usesTotal: total,
    cardUsage: createChargesCardUsage(remaining, total),
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    drawer: {
      kind: "confirm",
      eyebrow: "Reborn Trait",
      description
    },
    execute: {
      kind: "activate"
    }
  };
}

export function isRebornSpecies(species: string): boolean {
  return getSpeciesEntryByName(species.trim())?.id === rebornSpeciesId;
}

export function normalizeRebornSkillProficiency(value: unknown): SkillName | undefined {
  return typeof value === "string" && isSkillName(value) ? value : undefined;
}

export function normalizeRebornResistance(
  value: unknown
): CharacterRebornResistance | undefined {
  return typeof value === "string" && rebornResistanceOptionSet.has(value)
    ? (value as CharacterRebornResistance)
    : undefined;
}

export function normalizeRebornFeatureState(value: unknown): CharacterRebornFeatureState {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    knowledgeFromPastLifeUsesExpended: clampExpendedUses(
      record.knowledgeFromPastLifeUsesExpended
    )
  };
}

export function getRebornSkillProficiencyOptionsForSpecies(species: string): SkillName[] {
  return isRebornSpecies(species) ? [...ALL_SKILLS] : [];
}

export function getRebornResistanceOptionsForSpecies(
  species: string
): CharacterRebornResistance[] {
  return isRebornSpecies(species) ? [...rebornResistanceOptions] : [];
}

export function getRebornSkillProficiencyForCharacter(
  character: RebornRuntimeCharacter
): SkillName | null {
  if (!isRebornSpecies(character.species)) {
    return null;
  }

  return normalizeRebornSkillProficiency(character.speciesChoices?.rebornSkillProficiency) ?? null;
}

export function getRebornResistanceForCharacter(
  character: RebornRuntimeCharacter
): CharacterRebornResistance | null {
  if (!isRebornSpecies(character.species)) {
    return null;
  }

  return normalizeRebornResistance(character.speciesChoices?.rebornResistance) ?? null;
}

export function getRebornKnowledgeFromPastLifeUsesTotal(
  character: Partial<Pick<Character, "species" | "level">>
): number {
  return character.species && isRebornSpecies(character.species)
    ? getSpeciesProficiencyBonus(character.level ?? 1)
    : 0;
}

export function getRebornKnowledgeFromPastLifeUsesRemaining(
  character: Partial<Pick<Character, "species" | "level" | "speciesFeatureState">>
): number {
  const total = getRebornKnowledgeFromPastLifeUsesTotal(character);
  const expended = clampExpendedUses(
    getRebornFeatureState(character).knowledgeFromPastLifeUsesExpended
  );

  return Math.max(0, total - expended);
}

export function spendRebornKnowledgeFromPastLifeForCharacter(character: Character): Character {
  if (getRebornKnowledgeFromPastLifeUsesRemaining(character) <= 0) {
    return character;
  }

  const rebornState = getRebornFeatureState(character);

  return setRebornFeatureState(character, {
    knowledgeFromPastLifeUsesExpended:
      clampExpendedUses(rebornState.knowledgeFromPastLifeUsesExpended) + 1
  });
}

export function restoreRebornKnowledgeFromPastLifeOnLongRest(
  character: Character
): Character {
  if (getRebornKnowledgeFromPastLifeUsesTotal(character) <= 0) {
    return character;
  }

  const rebornState = getRebornFeatureState(character);

  if (clampExpendedUses(rebornState.knowledgeFromPastLifeUsesExpended) <= 0) {
    return character;
  }

  return setRebornFeatureState(character, {
    knowledgeFromPastLifeUsesExpended: 0
  });
}

export function activateRebornFeatureActionForCharacter(
  character: Character,
  actionKey: string
): Character {
  return actionKey === rebornKnowledgeFromPastLifeActionKey
    ? spendRebornKnowledgeFromPastLifeForCharacter(character)
    : character;
}

export function getRebornActionsForCharacter(character: Character): FeatureActionCard[] {
  if (!isRebornSpecies(character.species)) {
    return [];
  }

  return [getRebornKnowledgeFromPastLifeAction(character)];
}

export function getRebornDerivedStatusEntriesForCharacter(
  character: RebornRuntimeCharacter
): CharacterStatusEntry[] {
  const resistance = getRebornResistanceForCharacter(character);

  if (!resistance) {
    return [];
  }

  const strangeEnduranceDescription = getRebornDescriptionText(
    strangeEnduranceName,
    "You have Resistance to one of the following damage types of your choice: Cold, Necrotic, or Poison."
  );

  return [
    createRebornStatusEntry({
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: resistance,
      source: rebornName,
      sourceId: `species-reborn-strange-endurance-${resistance.toLowerCase()}`,
      description: strangeEnduranceDescription
    })
  ];
}

export function hasRebornDeathSaveAdvantageForCharacter(
  character: Pick<Character, "species">
): boolean {
  return isRebornSpecies(character.species);
}

export function getRebornDeathSaveDescriptionAdditionsForCharacter(
  character: Pick<Character, "species">
): SpellDescriptionEntry[][] {
  return hasRebornDeathSaveAdvantageForCharacter(character)
    ? [getEscapedDeathDescriptionAddition()]
    : [];
}

export function getRebornLifeAndDeathDescriptionAdditionsForCharacter(
  character: Pick<Character, "species">
): SpellDescriptionEntry[][] {
  return isRebornSpecies(character.species)
    ? [getEscapedDeathDescriptionAddition(), getEverlastingDescriptionAddition()]
    : [];
}
