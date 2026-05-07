import {
  DAMAGE_TYPE,
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
  type CharacterStatusEntry,
  type CharacterTieflingFeatureState,
  type CharacterTieflingFiendishLegacy,
  type CharacterTieflingSpellcastingAbility
} from "../../types";
import { addSpellSource } from "./classFeatures/spellSources";
import type { SpellSourceMap } from "./classFeatures/types";

export type TieflingFiendishLegacyOption = {
  key: CharacterTieflingFiendishLegacy;
  name: string;
  resistance: DAMAGE_TYPE;
  cantripId: string;
  spellsByLevel: Array<{
    level: number;
    spellId: string;
  }>;
};

export type TieflingFreeCastState = {
  usesRemaining: number;
  usesTotal: number;
};

const tieflingSpeciesId = "species-tiefling-2024";
const tieflingDefaultLegacy: CharacterTieflingFiendishLegacy = "infernal";
const tieflingDefaultSpellcastingAbility: CharacterTieflingSpellcastingAbility = "CHA";
const thaumaturgySpellId = "spell-thaumaturgy";
const tieflingSpellcastingAbilityOptions = [
  "INT",
  "WIS",
  "CHA"
] as const satisfies readonly CharacterTieflingSpellcastingAbility[];
const tieflingFiendishLegacyOptions = [
  {
    key: "abyssal",
    name: "Abyssal",
    resistance: DAMAGE_TYPE.POISON,
    cantripId: "spell-poison-spray",
    spellsByLevel: [
      {
        level: 3,
        spellId: "spell-ray-of-sickness"
      },
      {
        level: 5,
        spellId: "spell-hold-person"
      }
    ]
  },
  {
    key: "chthonic",
    name: "Chthonic",
    resistance: DAMAGE_TYPE.NECROTIC,
    cantripId: "spell-chill-touch",
    spellsByLevel: [
      {
        level: 3,
        spellId: "spell-false-life"
      },
      {
        level: 5,
        spellId: "spell-ray-of-enfeeblement"
      }
    ]
  },
  {
    key: "infernal",
    name: "Infernal",
    resistance: DAMAGE_TYPE.FIRE,
    cantripId: "spell-fire-bolt",
    spellsByLevel: [
      {
        level: 3,
        spellId: "spell-hellish-rebuke"
      },
      {
        level: 5,
        spellId: "spell-darkness"
      }
    ]
  }
] as const satisfies readonly TieflingFiendishLegacyOption[];

const tieflingFiendishLegacyNameByKey = tieflingFiendishLegacyOptions.reduce<
  Record<CharacterTieflingFiendishLegacy, string>
>(
  (names, option) => {
    names[option.key] = option.name;
    return names;
  },
  {} as Record<CharacterTieflingFiendishLegacy, string>
);
const tieflingFiendishLegacyAliases = new Map<string, CharacterTieflingFiendishLegacy>();
const tieflingSpellcastingAbilitySet = new Set<string>(tieflingSpellcastingAbilityOptions);

tieflingFiendishLegacyOptions.forEach((option) => {
  tieflingFiendishLegacyAliases.set(option.key, option.key);
  tieflingFiendishLegacyAliases.set(option.name.toLowerCase(), option.key);
});
tieflingFiendishLegacyAliases.set("chtonic", "chthonic");
tieflingFiendishLegacyAliases.set("cthonic", "chthonic");

type TieflingRuntimeCharacter = Pick<Character, "species"> &
  Partial<Pick<Character, "level" | "speciesChoices" | "speciesFeatureState">>;

function getTieflingEntry(species = "Tiefling"): SpeciesEntry | null {
  const entry = getSpeciesEntryByName(species.trim());

  return entry?.id === tieflingSpeciesId ? entry : null;
}

function getTieflingDescriptionSection(heading: string): SpellDescriptionEntry[] {
  const description = getTieflingEntry()?.description.filter(
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

function getTieflingDescriptionText(heading: string, fallback: string): string {
  const section = getTieflingDescriptionSection(heading);

  return section.length > 0 ? section.join("\n") : fallback;
}

function clampExpendedSpellIds(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((spellId): spellId is string => typeof spellId === "string")
    : [];
}

function getTieflingFeatureState(
  character: Partial<Pick<Character, "speciesFeatureState">>
): CharacterTieflingFeatureState {
  return character.speciesFeatureState?.tiefling ?? {};
}

function setTieflingFeatureState(
  character: Character,
  state: CharacterTieflingFeatureState
): Character {
  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      tiefling: {
        ...getTieflingFeatureState(character),
        ...state
      }
    }
  };
}

function getTieflingLegacyOption(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>
): TieflingFiendishLegacyOption | null {
  const legacy = getTieflingFiendishLegacyForCharacter(character);

  return legacy
    ? (tieflingFiendishLegacyOptions.find((option) => option.key === legacy) ?? null)
    : null;
}

function getTieflingUnlockedLeveledSpellIds(character: TieflingRuntimeCharacter): string[] {
  const legacyOption = getTieflingLegacyOption(character);

  if (!legacyOption) {
    return [];
  }

  const level = Math.max(1, character.level ?? 1);

  return legacyOption.spellsByLevel
    .filter((spell) => level >= spell.level)
    .map((spell) => spell.spellId);
}

function createTieflingStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value" | "description"> &
    Partial<Pick<CharacterStatusEntry, "rangeFeet">> & {
      sourceId: string;
    }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: "Tiefling",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: options.rangeFeet ?? null,
    description: options.description
  };
}

export function isTieflingSpecies(species: string): boolean {
  return getTieflingEntry(species) !== null;
}

export function normalizeTieflingFiendishLegacy(
  value: unknown
): CharacterTieflingFiendishLegacy | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return tieflingFiendishLegacyAliases.get(value.trim().toLowerCase());
}

export function normalizeTieflingSpellcastingAbility(
  value: unknown
): CharacterTieflingSpellcastingAbility | undefined {
  return typeof value === "string" && tieflingSpellcastingAbilitySet.has(value)
    ? (value as CharacterTieflingSpellcastingAbility)
    : undefined;
}

export function normalizeTieflingFeatureState(value: unknown): CharacterTieflingFeatureState {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    fiendishLegacyFreeCastExpendedSpellIds: clampExpendedSpellIds(
      record.fiendishLegacyFreeCastExpendedSpellIds
    )
  };
}

export function getDefaultTieflingFiendishLegacyForSpecies(
  species: string
): CharacterTieflingFiendishLegacy | undefined {
  return isTieflingSpecies(species)
    ? (normalizeTieflingFiendishLegacy(getTieflingEntry()?.starterPack.recommendedTieflingLegacy) ??
        tieflingDefaultLegacy)
    : undefined;
}

export function getDefaultTieflingSpellcastingAbilityForSpecies(
  species: string
): CharacterTieflingSpellcastingAbility | undefined {
  return isTieflingSpecies(species)
    ? (normalizeTieflingSpellcastingAbility(
        getTieflingEntry()?.starterPack.recommendedTieflingSpellcastingAbility
      ) ?? tieflingDefaultSpellcastingAbility)
    : undefined;
}

export function getTieflingFiendishLegacyOptionsForSpecies(
  species: string
): TieflingFiendishLegacyOption[] {
  return isTieflingSpecies(species) ? [...tieflingFiendishLegacyOptions] : [];
}

export function getTieflingSpellcastingAbilityOptionsForSpecies(
  species: string
): CharacterTieflingSpellcastingAbility[] {
  return isTieflingSpecies(species) ? [...tieflingSpellcastingAbilityOptions] : [];
}

export function formatTieflingFiendishLegacyOptionLabel(
  option: Pick<TieflingFiendishLegacyOption, "name">
): string {
  return option.name;
}

export function getTieflingFiendishLegacyForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>
): CharacterTieflingFiendishLegacy | null {
  if (!isTieflingSpecies(character.species)) {
    return null;
  }

  return normalizeTieflingFiendishLegacy(character.speciesChoices?.tieflingLegacy) ?? null;
}

export function getTieflingGrantedCantripEntriesForCharacter(
  character: TieflingRuntimeCharacter
): SpellEntry[] {
  const legacyOption = getTieflingLegacyOption(character);

  if (!legacyOption) {
    return [];
  }

  return [legacyOption.cantripId, thaumaturgySpellId]
    .map((spellId) => getSpellEntryById(spellId))
    .filter((spell): spell is SpellEntry => spell !== null);
}

export function getTieflingAlwaysPreparedSpellIdsForCharacter(
  character: TieflingRuntimeCharacter
): string[] {
  return getTieflingUnlockedLeveledSpellIds(character);
}

export function getTieflingAlwaysPreparedSpellSourceMapForCharacter(
  character: TieflingRuntimeCharacter
): SpellSourceMap {
  const sourceMap: SpellSourceMap = {};
  const legacyOption = getTieflingLegacyOption(character);

  if (!legacyOption) {
    return sourceMap;
  }

  const legacySource = `${tieflingFiendishLegacyNameByKey[legacyOption.key]} Legacy`;
  addSpellSource(sourceMap, legacyOption.cantripId, legacySource);
  addSpellSource(sourceMap, thaumaturgySpellId, "Otherworldly Presence");

  getTieflingAlwaysPreparedSpellIdsForCharacter(character).forEach((spellId) => {
    addSpellSource(sourceMap, spellId, legacySource);
  });

  return sourceMap;
}

export function getTieflingSpellcastingAbilityForCharacter(
  character: TieflingRuntimeCharacter,
  spellId: string
): AbilityKey | null {
  const legacyOption = getTieflingLegacyOption(character);

  if (!legacyOption) {
    return null;
  }

  const tieflingSpellIds = new Set([
    legacyOption.cantripId,
    thaumaturgySpellId,
    ...legacyOption.spellsByLevel.map((spell) => spell.spellId)
  ]);

  if (!tieflingSpellIds.has(spellId)) {
    return null;
  }

  return (
    normalizeTieflingSpellcastingAbility(character.speciesChoices?.tieflingSpellcastingAbility) ??
    null
  );
}

export function getTieflingFiendishLegacyFreeCastStateForCharacter(
  character: TieflingRuntimeCharacter,
  spellId: string
): TieflingFreeCastState | null {
  const unlockedSpellIds = getTieflingUnlockedLeveledSpellIds(character);

  if (!unlockedSpellIds.includes(spellId)) {
    return null;
  }

  const expendedSpellIds = new Set(
    clampExpendedSpellIds(getTieflingFeatureState(character).fiendishLegacyFreeCastExpendedSpellIds)
  );

  return {
    usesRemaining: expendedSpellIds.has(spellId) ? 0 : 1,
    usesTotal: 1
  };
}

export function consumeTieflingFiendishLegacyFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const freeCastState = getTieflingFiendishLegacyFreeCastStateForCharacter(character, spellId);

  if (!freeCastState || freeCastState.usesRemaining <= 0) {
    return character;
  }

  const expendedSpellIds = new Set(
    clampExpendedSpellIds(getTieflingFeatureState(character).fiendishLegacyFreeCastExpendedSpellIds)
  );
  expendedSpellIds.add(spellId);

  return setTieflingFeatureState(character, {
    fiendishLegacyFreeCastExpendedSpellIds: [...expendedSpellIds]
  });
}

export function getTieflingFiendishLegacyUsesTotal(character: TieflingRuntimeCharacter): number {
  return getTieflingUnlockedLeveledSpellIds(character).length;
}

export function restoreTieflingFiendishLegacyOnLongRest(character: Character): Character {
  if (getTieflingFiendishLegacyUsesTotal(character) <= 0) {
    return character;
  }

  const expendedSpellIds = clampExpendedSpellIds(
    getTieflingFeatureState(character).fiendishLegacyFreeCastExpendedSpellIds
  );

  if (expendedSpellIds.length === 0) {
    return character;
  }

  return setTieflingFeatureState(character, {
    fiendishLegacyFreeCastExpendedSpellIds: []
  });
}

export function getTieflingDerivedStatusEntriesForCharacter(
  character: TieflingRuntimeCharacter
): CharacterStatusEntry[] {
  const entry = getTieflingEntry(character.species);

  if (!entry) {
    return [];
  }

  const legacyOption = getTieflingLegacyOption(character);
  const darkvisionDescription = getTieflingDescriptionText(
    "Darkvision",
    "You have Darkvision with a range of 60 feet."
  );
  const entries = [
    createTieflingStatusEntry({
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      sourceId: "species-tiefling-darkvision",
      rangeFeet: 60,
      description: darkvisionDescription
    })
  ];

  if (!legacyOption) {
    return entries;
  }

  entries.push(
    createTieflingStatusEntry({
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: legacyOption.resistance,
      sourceId: `species-tiefling-${legacyOption.key}-resistance`,
      description: `${legacyOption.name}: You have Resistance to ${legacyOption.resistance.toLowerCase()} damage.`
    })
  );

  return entries;
}
