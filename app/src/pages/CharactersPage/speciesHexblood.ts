import {
  getSpeciesEntryByName,
  getSpellEntryById,
  type SpeciesEntry,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../codex/entries";
import {
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type AbilityKey,
  type Character,
  type CharacterHexbloodFeatureState,
  type CharacterHexbloodSpellcastingAbility,
  type CharacterStatusEntry
} from "../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "./actionEconomy";
import { createChargesCardUsage } from "./classFeatures/cardUsage";
import { addSpellSource } from "./classFeatures/spellSources";
import type { FeatureActionCard, SpellSourceMap } from "./classFeatures/types";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "./statusEntries";

export type HexbloodFreeCastState = {
  usesRemaining: number;
  usesTotal: number;
};

const hexbloodSpeciesId = "species-hexblood-rhw";
const hexbloodName = "Hexblood";
const hexbloodEerieTokenName = "Eerie Token";
const hexbloodEerieTokenStatusSourceId = "species-hexblood-eerie-token";
const hexbloodDefaultSpellcastingAbility: CharacterHexbloodSpellcastingAbility = "CHA";
const disguiseSelfSpellId = "spell-disguise-self";
const hexSpellId = "spell-hex";
const hexbloodSpellIds = [disguiseSelfSpellId, hexSpellId] as const;
const hexbloodSpellcastingAbilityOptions = [
  "INT",
  "WIS",
  "CHA"
] as const satisfies readonly CharacterHexbloodSpellcastingAbility[];
const hexbloodSpellcastingAbilitySet = new Set<string>(hexbloodSpellcastingAbilityOptions);

export const hexbloodEerieTokenActionKey = "species-hexblood-eerie-token";

type HexbloodRuntimeCharacter = Pick<Character, "species"> &
  Partial<Pick<Character, "speciesChoices" | "speciesFeatureState">>;

function getHexbloodEntry(species = hexbloodName): SpeciesEntry | null {
  const entry = getSpeciesEntryByName(species.trim());

  return entry?.id === hexbloodSpeciesId ? entry : null;
}

function getHexbloodDescriptionSection(
  heading: string,
  options: {
    stopBeforeHeading?: string;
  } = {}
): SpellDescriptionEntry[] {
  const description = getHexbloodEntry()?.rulesDescription.filter(
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

    if (
      index > startIndex &&
      (options.stopBeforeHeading
        ? descriptionEntry.includes(`<strong>${options.stopBeforeHeading}.`)
        : descriptionEntry.startsWith("<strong>"))
    ) {
      break;
    }

    section.push(descriptionEntry);
  }

  return section;
}

function getHexbloodDescriptionText(heading: string, fallback: string): string {
  const section = getHexbloodDescriptionSection(heading);

  return section.length > 0 ? section.join("\n") : fallback;
}

function stripDescriptionHeading(value: string, heading: string): string {
  return value.replace(new RegExp(`^<strong>${heading}\\.<\\/strong>\\s*`, "i"), "").trim();
}

function isHexbloodSpellId(spellId: string): spellId is (typeof hexbloodSpellIds)[number] {
  return hexbloodSpellIds.some((hexbloodSpellId) => hexbloodSpellId === spellId);
}

function clampExpendedSpellIds(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((spellId): spellId is string => typeof spellId === "string")
        .map((spellId) => spellId.trim())
        .filter(isHexbloodSpellId)
    : [];
}

function getHexbloodFeatureState(
  character: Partial<Pick<Character, "speciesFeatureState">>
): CharacterHexbloodFeatureState {
  return character.speciesFeatureState?.hexblood ?? {};
}

function setHexbloodFeatureState(
  character: Character,
  state: CharacterHexbloodFeatureState
): Character {
  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      hexblood: {
        ...getHexbloodFeatureState(character),
        ...state
      }
    }
  };
}

function createHexbloodStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value"> &
    Partial<Pick<CharacterStatusEntry, "rangeFeet" | "description">> & {
      sourceId: string;
      source?: string;
    }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: options.source ?? hexbloodName,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: options.rangeFeet ?? null,
    description: options.description
  };
}

function getEerieTokenDescription(): SpellDescriptionEntry[] {
  const section = getHexbloodDescriptionSection(hexbloodEerieTokenName, {
    stopBeforeHeading: "Hex Magic"
  });

  return section.length > 0
    ? section
    : [
        "<strong>Eerie Token.</strong> As a Bonus Action, you can create a magical token by harmlessly removing a lock of hair, detaching a nail, or using some other method. While the token exists, you gain the following benefits:",
        "<strong>Distant Message.</strong> As a Magic action, you can send a telepathic message of 25 words or fewer to a creature holding or carrying the token, as long as you are within 10 miles of it.",
        "<strong>Remote Viewing.</strong> If you are within 10 miles of the token, you can take a Magic action to extend your senses through the token for 1 minute, until you have the Incapacitated condition, or until you end this state (no action required). During this state, you can see and hear from the token as if you were located where it is. When this state ends, the token is harmlessly destroyed.",
        "Unless the token is destroyed early, it lasts until you finish a Long Rest. Once you create a token using this feature, you can't do so again until you finish a Long Rest."
      ];
}

function getEerieTokenStatusDescription(): string {
  return getEerieTokenDescription()
    .filter((line): line is string => typeof line === "string")
    .map((line, index) =>
      index === 0 ? stripDescriptionHeading(line, hexbloodEerieTokenName) : line
    )
    .join("\n");
}

function getHexbloodSpellEntries(): SpellEntry[] {
  return hexbloodSpellIds
    .map((spellId) => getSpellEntryById(spellId))
    .filter((spell): spell is SpellEntry => spell !== null);
}

export function isHexbloodSpecies(species: string): boolean {
  return getHexbloodEntry(species) !== null;
}

export function normalizeHexbloodSpellcastingAbility(
  value: unknown
): CharacterHexbloodSpellcastingAbility | undefined {
  return typeof value === "string" && hexbloodSpellcastingAbilitySet.has(value)
    ? (value as CharacterHexbloodSpellcastingAbility)
    : undefined;
}

export function normalizeHexbloodFeatureState(value: unknown): CharacterHexbloodFeatureState {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    eerieTokenExpended: record.eerieTokenExpended === true,
    hexMagicExpendedSpellIds: clampExpendedSpellIds(record.hexMagicExpendedSpellIds)
  };
}

export function getDefaultHexbloodSpellcastingAbilityForSpecies(
  species: string
): CharacterHexbloodSpellcastingAbility | undefined {
  return isHexbloodSpecies(species) ? hexbloodDefaultSpellcastingAbility : undefined;
}

export function getHexbloodSpellcastingAbilityOptionsForSpecies(
  species: string
): CharacterHexbloodSpellcastingAbility[] {
  return isHexbloodSpecies(species) ? [...hexbloodSpellcastingAbilityOptions] : [];
}

export function getHexbloodSpellcastingAbilityForCharacter(
  character: HexbloodRuntimeCharacter,
  spellId: string
): AbilityKey | null {
  if (!isHexbloodSpecies(character.species) || !isHexbloodSpellId(spellId)) {
    return null;
  }

  return (
    normalizeHexbloodSpellcastingAbility(character.speciesChoices?.hexbloodSpellcastingAbility) ??
    null
  );
}

export function getHexbloodAlwaysPreparedSpellIdsForCharacter(
  character: HexbloodRuntimeCharacter
): string[] {
  return isHexbloodSpecies(character.species) ? [...hexbloodSpellIds] : [];
}

export function getHexbloodAlwaysPreparedSpellEntriesForCharacter(
  character: HexbloodRuntimeCharacter
): SpellEntry[] {
  return isHexbloodSpecies(character.species) ? getHexbloodSpellEntries() : [];
}

export function getHexbloodAlwaysPreparedSpellSourceMapForCharacter(
  character: HexbloodRuntimeCharacter
): SpellSourceMap {
  const sourceMap: SpellSourceMap = {};

  if (!isHexbloodSpecies(character.species)) {
    return sourceMap;
  }

  hexbloodSpellIds.forEach((spellId) => {
    addSpellSource(sourceMap, spellId, "Hex Magic");
  });

  return sourceMap;
}

export function getHexbloodHexMagicFreeCastStateForCharacter(
  character: HexbloodRuntimeCharacter,
  spellId: string
): HexbloodFreeCastState | null {
  if (!isHexbloodSpecies(character.species) || !isHexbloodSpellId(spellId)) {
    return null;
  }

  const expendedSpellIds = new Set(
    clampExpendedSpellIds(getHexbloodFeatureState(character).hexMagicExpendedSpellIds)
  );

  return {
    usesRemaining: expendedSpellIds.has(spellId) ? 0 : 1,
    usesTotal: 1
  };
}

export function consumeHexbloodHexMagicFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const freeCastState = getHexbloodHexMagicFreeCastStateForCharacter(character, spellId);

  if (!freeCastState || freeCastState.usesRemaining <= 0) {
    return character;
  }

  const expendedSpellIds = new Set(
    clampExpendedSpellIds(getHexbloodFeatureState(character).hexMagicExpendedSpellIds)
  );
  expendedSpellIds.add(spellId);

  return setHexbloodFeatureState(character, {
    hexMagicExpendedSpellIds: [...expendedSpellIds]
  });
}

export function getHexbloodHexMagicUsesTotal(character: HexbloodRuntimeCharacter): number {
  return isHexbloodSpecies(character.species) ? hexbloodSpellIds.length : 0;
}

export function restoreHexbloodHexMagicOnLongRest(character: Character): Character {
  if (getHexbloodHexMagicUsesTotal(character) <= 0) {
    return character;
  }

  const expendedSpellIds = clampExpendedSpellIds(
    getHexbloodFeatureState(character).hexMagicExpendedSpellIds
  );

  if (expendedSpellIds.length === 0) {
    return character;
  }

  return setHexbloodFeatureState(character, {
    hexMagicExpendedSpellIds: []
  });
}

export function getHexbloodEerieTokenUsesTotal(character: Pick<Character, "species">): number {
  return isHexbloodSpecies(character.species) ? 1 : 0;
}

export function getHexbloodEerieTokenUsesRemaining(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesFeatureState">>
): number {
  const total = getHexbloodEerieTokenUsesTotal(character);

  if (total <= 0) {
    return 0;
  }

  return getHexbloodFeatureState(character).eerieTokenExpended === true ? 0 : total;
}

export function restoreHexbloodEerieTokenOnLongRest(character: Character): Character {
  if (getHexbloodEerieTokenUsesTotal(character) <= 0) {
    return character;
  }

  const hexbloodState = getHexbloodFeatureState(character);

  if (hexbloodState.eerieTokenExpended !== true) {
    return character;
  }

  return setHexbloodFeatureState(character, {
    eerieTokenExpended: false
  });
}

export function isHexbloodEerieTokenStatusEntry(
  entry: Pick<CharacterStatusEntry, "sourceId">
): boolean {
  return entry.sourceId === hexbloodEerieTokenStatusSourceId;
}

export function normalizeHexbloodEerieTokenStatusEntry(
  entry: CharacterStatusEntry
): CharacterStatusEntry {
  return {
    ...entry,
    group: STATUS_ENTRY_GROUP.EFFECTS,
    value: hexbloodEerieTokenName,
    source: hexbloodEerieTokenName,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: entry.duration,
    sourceId: hexbloodEerieTokenStatusSourceId,
    description: getEerieTokenStatusDescription()
  };
}

export function activateHexbloodEerieTokenForCharacter(character: Character): Character {
  if (!isHexbloodSpecies(character.species) || getHexbloodEerieTokenUsesRemaining(character) <= 0) {
    return character;
  }

  const statusEntries = normalizeCharacterStatusEntries(character.statusEntries);
  const nextCharacter = setHexbloodFeatureState(character, {
    eerieTokenExpended: true
  });

  return {
    ...nextCharacter,
    statusEntries: [
      ...statusEntries.filter((entry) => !isHexbloodEerieTokenStatusEntry(entry)),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: hexbloodEerieTokenName,
        source: hexbloodEerieTokenName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: hexbloodEerieTokenStatusSourceId,
        description: getEerieTokenStatusDescription()
      })
    ]
  };
}

export function activateHexbloodFeatureActionForCharacter(
  character: Character,
  actionKey: string
): Character {
  return actionKey === hexbloodEerieTokenActionKey
    ? activateHexbloodEerieTokenForCharacter(character)
    : character;
}

function getHexbloodEerieTokenAction(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesFeatureState">>
): FeatureActionCard {
  const total = getHexbloodEerieTokenUsesTotal(character);
  const remaining = getHexbloodEerieTokenUsesRemaining(character);
  const description = getEerieTokenDescription();
  const disabledReason =
    remaining <= 0 ? "Eerie Token recharges when you finish a Long Rest." : undefined;

  return {
    key: hexbloodEerieTokenActionKey,
    name: hexbloodEerieTokenName,
    summary: "Create a magical token.",
    detail: "Gain Distant Message and Remote Viewing through the token.",
    breakdown: "Create magical token",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining: remaining,
    usesTotal: total,
    cardUsage: createChargesCardUsage(remaining, total),
    disabled: remaining <= 0,
    disabledReason,
    description,
    drawer: {
      kind: "confirm",
      eyebrow: "Hexblood Trait",
      description
    },
    execute: {
      kind: "activate"
    }
  };
}

export function getHexbloodActionsForCharacter(character: Character): FeatureActionCard[] {
  if (!isHexbloodSpecies(character.species)) {
    return [];
  }

  return [getHexbloodEerieTokenAction(character)];
}

export function getHexbloodDerivedStatusEntriesForCharacter(
  character: Pick<Character, "species">
): CharacterStatusEntry[] {
  if (!isHexbloodSpecies(character.species)) {
    return [];
  }

  return [
    createHexbloodStatusEntry({
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      sourceId: "species-hexblood-darkvision",
      rangeFeet: 60,
      description: getHexbloodDescriptionText(
        "Darkvision",
        "You have Darkvision with a range of 60 feet."
      )
    })
  ];
}
