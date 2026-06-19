import {
  ACTION_TYPE,
  getSpellEntryById,
  type ReactionEntry,
  type SpellEntry
} from "../../../codex/entries";
import type { Character, CharacterStatusDuration, CharacterStatusEntry } from "../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../types";
import {
  getDerivedFeatureStatusEntriesForCharacter,
  getFeatureReactionEntriesForCharacter,
  getSpellEntryForCharacter
} from "../classFeatures";
import {
  getFeatAlwaysPreparedSpellEntriesForCharacter,
  getFeatDerivedStatusEntriesForCharacter,
  getFeatGrantedCantripEntriesForCharacter,
  getFeatReactionEntriesForCharacter
} from "../feats/runtime";
import {
  getSpeciesAlwaysPreparedSpellIdsForCharacter,
  getSpeciesDerivedStatusEntriesForCharacter,
  getSpeciesGrantedCantripEntriesForCharacter
} from "../species";
import { getDarkvisionSpellDerivedStatusEntriesForCharacter } from "./spellImplementations/darkvision";
import {
  getAlwaysPreparedSpellIds,
  getCantripLimitForCharacter,
  getCantripSelectionOptionsForCharacter,
  getPreparedSpellLimitForCharacter,
  getPreparedSpellSelectionOptionsForCharacter,
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  isSpellcastingClass,
  normalizePreparedSpellIds,
  normalizeSpellSlotsExpended,
  normalizeTrackedSpellIds,
  usesPreparedSpellsForCharacter
} from "../spellcasting";
import { resolveCharacterStatusEntries } from "../statusEntries";
import { statusGroupOrder, statusGroupTitles } from "../traits";
import { measureCharacterRuntime } from "./performance";

export type StatusRuntimeSection = {
  group: STATUS_ENTRY_GROUP;
  title: string;
  entries: CharacterStatusEntry[];
};

export type ReactionEntryStatusId = `reaction-entry-${string}`;

export type CharacterStatusRuntime = {
  spellEntriesById: Map<string, SpellEntry>;
  selectedReactionSpellEntries: SpellEntry[];
  featureReactionEntries: ReactionEntry[];
  featureReactionEntriesByStatusId: Map<ReactionEntryStatusId, ReactionEntry>;
  classDerivedStatusEntries: CharacterStatusEntry[];
  featDerivedStatusEntries: CharacterStatusEntry[];
  speciesDerivedStatusEntries: CharacterStatusEntry[];
  spellDerivedStatusEntries: CharacterStatusEntry[];
  reactionStatusEntries: CharacterStatusEntry[];
  derivedStatusEntries: CharacterStatusEntry[];
  statusEntries: CharacterStatusEntry[];
  statusSections: StatusRuntimeSection[];
  spellSlotTotals: number[];
  spellSlotsExpended: number[];
  spellSlotsRemaining: number[];
  getStatusEntryById: (entryId: string | null | undefined) => CharacterStatusEntry | null;
  getReactionEntryForStatus: (
    entry: CharacterStatusEntry | null | undefined
  ) => ReactionEntry | null;
};

const statusRuntimeByCharacter = new WeakMap<Character, CharacterStatusRuntime>();

function transformSpellEntries(character: Character, spellEntries: SpellEntry[]): SpellEntry[] {
  return spellEntries.map((spell) => getSpellEntryForCharacter(character, spell));
}

function createDerivedReactionStatusDuration(): CharacterStatusDuration {
  return { kind: STATUS_DURATION_KIND.INFINITE };
}

export function getDerivedReactionStatusEntries(
  spells: SpellEntry[],
  reactions: ReactionEntry[]
): CharacterStatusEntry[] {
  return [...new Map(spells.map((spell) => [spell.id, spell])).values()]
    .filter((spell) => spell.castingTime.includes(ACTION_TYPE.REACTION))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((spell) => ({
      id: `reaction-spell-${spell.id}`,
      group: STATUS_ENTRY_GROUP.REACTIONS,
      value: spell.name,
      source: "Spellcasting",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: createDerivedReactionStatusDuration(),
      sourceId: `reaction-spell-${spell.id}`,
      rangeFeet: null
    }))
    .concat(
      reactions
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((reaction) => ({
          id: `reaction-entry-${reaction.id}`,
          group: STATUS_ENTRY_GROUP.REACTIONS,
          value: reaction.name,
          source: reaction.sourceLabel,
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          duration: createDerivedReactionStatusDuration(),
          sourceId: `reaction-entry-${reaction.id}`,
          rangeFeet: null
        }))
    );
}

function getHighestSpellSlotLevel(spellSlotTotals: number[]): number {
  return spellSlotTotals.reduce((highest, total, index) => (total > 0 ? index + 1 : highest), 0);
}

function createFeatureReactionEntriesByStatusId(
  featureReactionEntries: ReactionEntry[]
): Map<ReactionEntryStatusId, ReactionEntry> {
  return new Map(
    featureReactionEntries.map((reaction) => [
      `reaction-entry-${reaction.id}` as ReactionEntryStatusId,
      reaction
    ])
  );
}

function createStatusSections(statusEntries: CharacterStatusEntry[]): StatusRuntimeSection[] {
  return statusGroupOrder
    .map((group) => ({
      group,
      title: statusGroupTitles[group],
      entries: statusEntries.filter((entry) => entry.group === group)
    }))
    .filter((section) => section.entries.length > 0);
}

function createStatusRuntime(character: Character): CharacterStatusRuntime {
  const shouldUseClassSpellPools = isSpellcastingClass(
    character.className,
    character.level,
    character.subclassId,
    character.customClass,
    character.classRules
  );
  const classSpellEntries = transformSpellEntries(
    character,
    shouldUseClassSpellPools
      ? getCantripSelectionOptionsForCharacter(
          character.className,
          character.level,
          character.subclassId,
          character.customClass,
          character.classRules
        )
      : []
  );
  const featGrantedCantripEntries = transformSpellEntries(
    character,
    getFeatGrantedCantripEntriesForCharacter(character)
  );
  const speciesGrantedCantripEntries = transformSpellEntries(
    character,
    getSpeciesGrantedCantripEntriesForCharacter(character)
  );
  const featAlwaysPreparedSpellEntries = transformSpellEntries(
    character,
    getFeatAlwaysPreparedSpellEntriesForCharacter(character)
  );
  const preparedSpellPoolEntries = transformSpellEntries(
    character,
    shouldUseClassSpellPools
      ? getPreparedSpellSelectionOptionsForCharacter(
          character.className,
          character.level,
          character.subclassId,
          character.customClass,
          character.classRules
        )
      : []
  );
  const cantripLimit = getCantripLimitForCharacter(
    character.className,
    character.level,
    character.classFeatureState,
    character.subclassId,
    character.customClass,
    character.classRules
  );
  const preparedSpellLimit = getPreparedSpellLimitForCharacter(
    character.className,
    character.level,
    character.subclassId,
    character.customClass,
    character.classRules
  );
  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    character.className,
    character.level,
    character.subclassId,
    character.customClass,
    character.classRules
  );
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const spellSlotsRemaining = spellSlotTotals.map((total, index) =>
    Math.max(0, total - (spellSlotsExpended[index] ?? 0))
  );
  const usesPreparedSpells = usesPreparedSpellsForCharacter(
    character.className,
    character.level,
    character.subclassId,
    character.customClass,
    character.classRules
  );
  const alwaysPreparedSpellIds = [
    ...new Set([
      ...getAlwaysPreparedSpellIds(
        character.className,
        character.level,
        character.classFeatureState,
        undefined,
        character.subclassId,
        character.statusEntries,
        character.customClass,
        character.classRules
      ),
      ...featAlwaysPreparedSpellEntries.map((spell) => spell.id),
      ...getSpeciesAlwaysPreparedSpellIdsForCharacter({
        species: character.species,
        level: character.level,
        speciesChoices: character.speciesChoices
      })
    ])
  ];
  const alwaysPreparedSpellEntries = alwaysPreparedSpellIds
    .map((spellId) => getSpellEntryById(spellId))
    .filter((spell): spell is SpellEntry => spell !== null)
    .map((spell) => getSpellEntryForCharacter(character, spell));
  const spellEntriesById = new Map(
    [
      ...classSpellEntries,
      ...featGrantedCantripEntries,
      ...speciesGrantedCantripEntries,
      ...preparedSpellPoolEntries,
      ...alwaysPreparedSpellEntries
    ].map((spell) => [spell.id, spell])
  );
  const selectedCantripsById = new Map<string, SpellEntry>();

  normalizeTrackedSpellIds(
    character.cantripIds,
    classSpellEntries.filter((spell) => getSpellLevel(spell) === 0),
    cantripLimit
  ).forEach((spellId) => {
    const spell = spellEntriesById.get(spellId);

    if (spell) {
      selectedCantripsById.set(spell.id, spell);
    }
  });

  featGrantedCantripEntries.forEach((spell) => {
    selectedCantripsById.set(spell.id, spell);
  });
  speciesGrantedCantripEntries.forEach((spell) => {
    selectedCantripsById.set(spell.id, spell);
  });

  const selectedCantrips = [...selectedCantripsById.values()].sort((left, right) =>
    left.name.localeCompare(right.name)
  );
  const highestSpellSlotLevel = getHighestSpellSlotLevel(spellSlotTotals);
  const spellPreparationOptions = preparedSpellPoolEntries.filter((spell) => {
    const spellLevel = getSpellLevel(spell);
    return spellLevel > 0 && spellLevel <= highestSpellSlotLevel;
  });
  const preparedSpells = [
    ...alwaysPreparedSpellIds,
    ...(usesPreparedSpells
      ? normalizePreparedSpellIds(
          character.preparedSpellIds,
          spellPreparationOptions,
          preparedSpellLimit,
          alwaysPreparedSpellIds
        )
      : [])
  ]
    .map((spellId) => spellEntriesById.get(spellId))
    .filter((spell): spell is SpellEntry => spell !== undefined);
  const selectedPreparedSpells =
    usesPreparedSpells || preparedSpells.length > 0 ? preparedSpells : spellPreparationOptions;
  const selectedReactionSpellEntries = [
    ...new Map(
      [...selectedCantrips, ...selectedPreparedSpells]
        .filter((spell) => spell.castingTime.includes(ACTION_TYPE.REACTION))
        .map((spell) => [spell.id, spell])
    ).values()
  ].sort((left, right) => left.name.localeCompare(right.name));
  const featureReactionEntries = [
    ...getFeatureReactionEntriesForCharacter(character),
    ...getFeatReactionEntriesForCharacter(character)
  ];
  const featureReactionEntriesByStatusId =
    createFeatureReactionEntriesByStatusId(featureReactionEntries);
  const reactionStatusEntries = getDerivedReactionStatusEntries(
    selectedReactionSpellEntries,
    featureReactionEntries
  );
  const classDerivedStatusEntries = getDerivedFeatureStatusEntriesForCharacter(character);
  const featDerivedStatusEntries = getFeatDerivedStatusEntriesForCharacter(character);
  const speciesDerivedStatusEntries = getSpeciesDerivedStatusEntriesForCharacter(character);
  const spellDerivedStatusEntries = getDarkvisionSpellDerivedStatusEntriesForCharacter(character);
  const derivedStatusEntries = [
    ...classDerivedStatusEntries,
    ...featDerivedStatusEntries,
    ...speciesDerivedStatusEntries,
    ...spellDerivedStatusEntries,
    ...reactionStatusEntries
  ];
  const statusEntries = resolveCharacterStatusEntries(character.statusEntries, derivedStatusEntries);
  const statusSections = createStatusSections(statusEntries);

  function getStatusEntryById(entryId: string | null | undefined): CharacterStatusEntry | null {
    return entryId ? (statusEntries.find((entry) => entry.id === entryId) ?? null) : null;
  }

  function getReactionEntryForStatus(
    entry: CharacterStatusEntry | null | undefined
  ): ReactionEntry | null {
    return entry?.group === STATUS_ENTRY_GROUP.REACTIONS &&
      entry.sourceId?.startsWith("reaction-entry-")
      ? (featureReactionEntriesByStatusId.get(entry.sourceId as ReactionEntryStatusId) ?? null)
      : null;
  }

  return {
    spellEntriesById,
    selectedReactionSpellEntries,
    featureReactionEntries,
    featureReactionEntriesByStatusId,
    classDerivedStatusEntries,
    featDerivedStatusEntries,
    speciesDerivedStatusEntries,
    spellDerivedStatusEntries,
    reactionStatusEntries,
    derivedStatusEntries,
    statusEntries,
    statusSections,
    spellSlotTotals,
    spellSlotsExpended,
    spellSlotsRemaining,
    getStatusEntryById,
    getReactionEntryForStatus
  };
}

export function getStatusRuntimeForCharacter(character: Character): CharacterStatusRuntime {
  const cachedRuntime = statusRuntimeByCharacter.get(character);

  if (cachedRuntime) {
    return cachedRuntime;
  }

  const runtime = measureCharacterRuntime("character-sheet:status-runtime", () =>
    createStatusRuntime(character)
  );

  statusRuntimeByCharacter.set(character, runtime);
  return runtime;
}
