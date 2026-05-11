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
  type CharacterGnomeFeatureState,
  type CharacterGnomeLineage,
  type CharacterGnomeSpellcastingAbility,
  type CharacterStatusEntry
} from "../../types";
import { appendSourcedDescriptionAddition } from "./actionModalDescriptions";
import { addSpellSource } from "./classFeatures/spellSources";
import type {
  FeatureIndicator,
  SavingThrowIndicatorMap,
  SpellSourceMap
} from "./classFeatures/types";

export type GnomeLineageOption = {
  key: CharacterGnomeLineage;
  name: string;
};

export type GnomeFreeCastState = {
  usesRemaining: number;
  usesTotal: number;
};

const gnomeSpeciesId = "species-gnome-2024";
const gnomeDefaultLineage: CharacterGnomeLineage = "forest-gnome";
const gnomeDefaultSpellcastingAbility: CharacterGnomeSpellcastingAbility = "WIS";
const speakWithAnimalsSpellId = "spell-speak-with-animals";
const minorIllusionSpellId = "spell-minor-illusion";
const mendingSpellId = "spell-mending";
const prestidigitationSpellId = "spell-prestidigitation";
const gnomeSpellcastingAbilityOptions = [
  "INT",
  "WIS",
  "CHA"
] as const satisfies readonly CharacterGnomeSpellcastingAbility[];
const gnomeLineageOptions = [
  {
    key: "forest-gnome",
    name: "Forest Gnome"
  },
  {
    key: "rock-gnome",
    name: "Rock Gnome"
  }
] as const satisfies readonly GnomeLineageOption[];

const gnomeLineageNameByKey = gnomeLineageOptions.reduce<Record<CharacterGnomeLineage, string>>(
  (names, option) => {
    names[option.key] = option.name;
    return names;
  },
  {} as Record<CharacterGnomeLineage, string>
);
const gnomeLineageKeys = new Set<CharacterGnomeLineage>(
  gnomeLineageOptions.map((option) => option.key)
);
const gnomeSpellcastingAbilitySet = new Set<string>(gnomeSpellcastingAbilityOptions);

type GnomeRuntimeCharacter = Pick<Character, "species"> &
  Partial<Pick<Character, "level" | "speciesChoices" | "speciesFeatureState">>;

function getGnomeEntry(species = "Gnome"): SpeciesEntry | null {
  const entry = getSpeciesEntryByName(species.trim());

  return entry?.id === gnomeSpeciesId ? entry : null;
}

function getGnomeDescriptionSection(heading: string): SpellDescriptionEntry[] {
  const description = getGnomeEntry()?.description.filter(
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

function getGnomeDescriptionText(heading: string, fallback: string): string {
  const section = getGnomeDescriptionSection(heading);

  return section.length > 0 ? section.join("\n") : fallback;
}

function getSpeciesProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function clampExpendedUses(value: unknown): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? Math.max(0, Math.floor(parsedValue)) : 0;
}

function createGnomeStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value" | "description"> &
    Partial<Pick<CharacterStatusEntry, "rangeFeet">> & {
      sourceId: string;
    }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: "Gnome",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: options.rangeFeet ?? null,
    description: options.description
  };
}

function getGnomeFeatureState(
  character: Partial<Pick<Character, "speciesFeatureState">>
): CharacterGnomeFeatureState {
  return character.speciesFeatureState?.gnome ?? {};
}

function setGnomeFeatureState(character: Character, state: CharacterGnomeFeatureState): Character {
  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      gnome: {
        ...getGnomeFeatureState(character),
        ...state
      }
    }
  };
}

function getForestGnomeDescriptionAddition(): SpellDescriptionEntry[] {
  const description = getGnomeDescriptionSection("Forest Gnome");

  return description.length > 0
    ? description
    : [
        "You know the Minor Illusion cantrip. You also always have the Speak with Animals spell prepared. You can cast it without a spell slot a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest."
      ];
}

function getRockGnomeDescriptionAddition(): SpellDescriptionEntry[] {
  const description = getGnomeDescriptionSection("Rock Gnome");

  return description.length > 0
    ? description
    : [
        "You know the Mending and Prestidigitation cantrips. With Prestidigitation, you can create a Tiny clockwork device that lasts until the end of your next Long Rest."
      ];
}

function isForestGnome(character: GnomeRuntimeCharacter): boolean {
  return (
    isGnomeSpecies(character.species) &&
    normalizeGnomeLineage(character.speciesChoices?.gnomeLineage) === "forest-gnome"
  );
}

function isRockGnome(character: GnomeRuntimeCharacter): boolean {
  return (
    isGnomeSpecies(character.species) &&
    normalizeGnomeLineage(character.speciesChoices?.gnomeLineage) === "rock-gnome"
  );
}

export function isGnomeSpecies(species: string): boolean {
  return getGnomeEntry(species) !== null;
}

export function normalizeGnomeLineage(value: unknown): CharacterGnomeLineage | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const key = value.trim();
  return gnomeLineageKeys.has(key as CharacterGnomeLineage)
    ? (key as CharacterGnomeLineage)
    : undefined;
}

export function normalizeGnomeSpellcastingAbility(
  value: unknown
): CharacterGnomeSpellcastingAbility | undefined {
  return typeof value === "string" && gnomeSpellcastingAbilitySet.has(value)
    ? (value as CharacterGnomeSpellcastingAbility)
    : undefined;
}

export function normalizeGnomeFeatureState(value: unknown): CharacterGnomeFeatureState {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    speakWithAnimalsUsesExpended: clampExpendedUses(record.speakWithAnimalsUsesExpended)
  };
}

export function getDefaultGnomeLineageForSpecies(
  species: string
): CharacterGnomeLineage | undefined {
  return isGnomeSpecies(species) ? gnomeDefaultLineage : undefined;
}

export function getDefaultGnomeSpellcastingAbilityForSpecies(
  species: string
): CharacterGnomeSpellcastingAbility | undefined {
  return isGnomeSpecies(species) ? gnomeDefaultSpellcastingAbility : undefined;
}

export function getGnomeLineageOptionsForSpecies(species: string): GnomeLineageOption[] {
  return isGnomeSpecies(species) ? [...gnomeLineageOptions] : [];
}

export function getGnomeSpellcastingAbilityOptionsForSpecies(
  species: string
): CharacterGnomeSpellcastingAbility[] {
  return isGnomeSpecies(species) ? [...gnomeSpellcastingAbilityOptions] : [];
}

export function formatGnomeLineageOptionLabel(option: GnomeLineageOption): string {
  return option.name;
}

export function getGnomeGrantedCantripEntriesForCharacter(
  character: GnomeRuntimeCharacter
): SpellEntry[] {
  const spellIds = isForestGnome(character)
    ? [minorIllusionSpellId]
    : isRockGnome(character)
      ? [mendingSpellId, prestidigitationSpellId]
      : [];

  return spellIds
    .map((spellId) => getSpellEntryById(spellId))
    .filter((spell): spell is SpellEntry => spell !== null);
}

export function getGnomeAlwaysPreparedSpellIdsForCharacter(
  character: GnomeRuntimeCharacter
): string[] {
  return isForestGnome(character) ? [speakWithAnimalsSpellId] : [];
}

export function getGnomeAlwaysPreparedSpellSourceMapForCharacter(
  character: GnomeRuntimeCharacter
): SpellSourceMap {
  const sourceMap: SpellSourceMap = {};
  const lineage = normalizeGnomeLineage(character.speciesChoices?.gnomeLineage);

  if (!isGnomeSpecies(character.species) || !lineage) {
    return sourceMap;
  }

  const source = gnomeLineageNameByKey[lineage];

  getGnomeGrantedCantripEntriesForCharacter(character).forEach((spell) => {
    addSpellSource(sourceMap, spell.id, source);
  });

  getGnomeAlwaysPreparedSpellIdsForCharacter(character).forEach((spellId) => {
    addSpellSource(sourceMap, spellId, source);
  });

  return sourceMap;
}

export function getGnomeSpellcastingAbilityForCharacter(
  character: GnomeRuntimeCharacter,
  spellId: string
): AbilityKey | null {
  const lineage = normalizeGnomeLineage(character.speciesChoices?.gnomeLineage);

  if (!isGnomeSpecies(character.species) || !lineage) {
    return null;
  }

  const lineageSpellIds =
    lineage === "forest-gnome"
      ? [minorIllusionSpellId, speakWithAnimalsSpellId]
      : [mendingSpellId, prestidigitationSpellId];

  if (!lineageSpellIds.includes(spellId)) {
    return null;
  }

  return (
    normalizeGnomeSpellcastingAbility(character.speciesChoices?.gnomeSpellcastingAbility) ?? null
  );
}

export function getGnomeSpeakWithAnimalsUsesTotal(character: GnomeRuntimeCharacter): number {
  return isForestGnome(character) ? getSpeciesProficiencyBonus(character.level ?? 1) : 0;
}

export function getGnomeSpeakWithAnimalsUsesRemaining(character: GnomeRuntimeCharacter): number {
  const total = getGnomeSpeakWithAnimalsUsesTotal(character);

  if (total <= 0) {
    return 0;
  }

  return Math.max(
    0,
    total - clampExpendedUses(getGnomeFeatureState(character).speakWithAnimalsUsesExpended)
  );
}

export function getGnomeSpeakWithAnimalsFreeCastStateForCharacter(
  character: GnomeRuntimeCharacter,
  spellId: string
): GnomeFreeCastState | null {
  const usesTotal = getGnomeSpeakWithAnimalsUsesTotal(character);

  if (spellId !== speakWithAnimalsSpellId || usesTotal <= 0) {
    return null;
  }

  return {
    usesRemaining: getGnomeSpeakWithAnimalsUsesRemaining(character),
    usesTotal
  };
}

export function consumeGnomeSpeakWithAnimalsFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const freeCastState = getGnomeSpeakWithAnimalsFreeCastStateForCharacter(character, spellId);

  if (!freeCastState || freeCastState.usesRemaining <= 0) {
    return character;
  }

  return setGnomeFeatureState(character, {
    speakWithAnimalsUsesExpended:
      clampExpendedUses(getGnomeFeatureState(character).speakWithAnimalsUsesExpended) + 1
  });
}

export function restoreGnomeSpeakWithAnimalsOnLongRest(character: Character): Character {
  if (getGnomeSpeakWithAnimalsUsesTotal(character) <= 0) {
    return character;
  }

  return setGnomeFeatureState(character, {
    speakWithAnimalsUsesExpended: 0
  });
}

export function getGnomeDerivedStatusEntriesForCharacter(
  character: GnomeRuntimeCharacter
): CharacterStatusEntry[] {
  const entry = getGnomeEntry(character.species);

  if (!entry) {
    return [];
  }

  const darkvisionDescription = getGnomeDescriptionText(
    "Darkvision",
    "You have Darkvision with a range of 60 feet."
  );
  const gnomishCunningDescription = getGnomeDescriptionText(
    "Gnomish Cunning",
    "You have Advantage on Intelligence, Wisdom, and Charisma saving throws."
  );

  return [
    createGnomeStatusEntry({
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      sourceId: "species-gnome-darkvision",
      rangeFeet: 60,
      description: darkvisionDescription
    }),
    createGnomeStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: "Gnomish Cunning",
      sourceId: "species-gnome-gnomish-cunning",
      description: gnomishCunningDescription
    })
  ];
}

export function getGnomeSavingThrowIndicatorsForCharacter(
  character: GnomeRuntimeCharacter
): SavingThrowIndicatorMap {
  if (!isGnomeSpecies(character.species)) {
    return {};
  }

  const indicator: FeatureIndicator = {
    label: "Advantage",
    tone: "advantage",
    source: "Gnomish Cunning"
  };

  return {
    INT: [indicator],
    WIS: [indicator],
    CHA: [indicator]
  };
}

export function getGnomeSpellEntryForCharacter(
  character: GnomeRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  if (isForestGnome(character) && spell.id === speakWithAnimalsSpellId) {
    return appendSourcedDescriptionAddition(
      spell,
      "Forest Gnome",
      getForestGnomeDescriptionAddition()
    );
  }

  if (isRockGnome(character) && spell.id === prestidigitationSpellId) {
    return appendSourcedDescriptionAddition(spell, "Rock Gnome", getRockGnomeDescriptionAddition());
  }

  return spell;
}
