import { useMemo } from "react";
import { useClassSpellEntries, usePreparedSpellEntries } from "../../../../../../codex/classes";
import {
  getSpellEntryById,
  type ReactionEntry,
  type SpellEntry
} from "../../../../../../codex/entries";
import {
  getDerivedFeatureStatusEntriesForCharacter,
  getFeatureReactionEntriesForCharacter,
  getSpellEntryForCharacter
} from "../../../../../../pages/CharactersPage/classFeatures";
import {
  getFeatDerivedStatusEntriesForCharacter,
  getFeatGrantedCantripEntriesForCharacter,
  getFeatReactionEntriesForCharacter
} from "../../../../../../pages/CharactersPage/feats/runtime";
import { getCompanionStatusEntriesForCharacter } from "../../../../../../pages/CharactersPage/companions";
import {
  getSpeciesAlwaysPreparedSpellIdsForCharacter,
  getSpeciesDerivedStatusEntriesForCharacter,
  getSpeciesGrantedCantripEntriesForCharacter
} from "../../../../../../pages/CharactersPage/species";
import {
  getAlwaysPreparedSpellIds,
  getCantripLimitForCharacter,
  getPreparedSpellLimitForCharacter,
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  normalizePreparedSpellIds,
  normalizeSpellSlotsExpended,
  normalizeTrackedSpellIds,
  usesPreparedSpellsForCharacter
} from "../../../../../../pages/CharactersPage/spellcasting";
import { resolveCharacterStatusEntries } from "../../../../../../pages/CharactersPage/statusEntries";
import { statusGroupOrder, statusGroupTitles } from "../../../../../../pages/CharactersPage/traits";
import type { Character, CharacterStatusEntry } from "../../../../../../types";
import { STATUS_ENTRY_GROUP } from "../../../../../../types";
import { getDerivedReactionStatusEntries } from "./traitsWidgetUtils";

export type StatusSection = {
  group: string;
  title: string;
  entries: CharacterStatusEntry[];
};

type UseTraitsConditionsSectionsOptions = {
  character: Character;
  selectedStatusEntryId: string | null;
};

export type TraitsConditionsSectionsState = {
  classSpellEntriesById: Map<string, SpellEntry>;
  featureReactionEntries: ReactionEntry[];
  selectedReactionEntry: ReactionEntry | null;
  selectedStatusEntry: CharacterStatusEntry | null;
  spellSlotTotals: number[];
  spellSlotsExpended: number[];
  spellSlotsRemaining: number[];
  statusEntries: CharacterStatusEntry[];
  statusSections: StatusSection[];
};

export function useTraitsConditionsSections({
  character,
  selectedStatusEntryId
}: UseTraitsConditionsSectionsOptions): TraitsConditionsSectionsState {
  const baseClassSpellEntries = useClassSpellEntries(character.className, character.subclassId);
  const classSpellEntries = useMemo(
    () => baseClassSpellEntries.map((spell) => getSpellEntryForCharacter(character, spell)),
    [baseClassSpellEntries, character]
  );
  const featGrantedCantripEntries = useMemo(
    () =>
      getFeatGrantedCantripEntriesForCharacter(character).map((spell) =>
        getSpellEntryForCharacter(character, spell)
      ),
    [character]
  );
  const speciesGrantedCantripEntries = useMemo(
    () =>
      getSpeciesGrantedCantripEntriesForCharacter(character).map((spell) =>
        getSpellEntryForCharacter(character, spell)
      ),
    [character]
  );
  const basePreparedSpellPoolEntries = usePreparedSpellEntries(
    character.className,
    character.level,
    character.subclassId
  );
  const preparedSpellPoolEntries = useMemo(
    () => basePreparedSpellPoolEntries.map((spell) => getSpellEntryForCharacter(character, spell)),
    [basePreparedSpellPoolEntries, character]
  );
  const cantripLimit = useMemo(
    () =>
      getCantripLimitForCharacter(
        character.className,
        character.level,
        character.classFeatureState,
        character.subclassId
      ),
    [character.classFeatureState, character.className, character.level, character.subclassId]
  );
  const preparedSpellLimit = useMemo(
    () =>
      getPreparedSpellLimitForCharacter(character.className, character.level, character.subclassId),
    [character.className, character.level, character.subclassId]
  );
  const spellSlotTotals = useMemo(
    () =>
      getSpellSlotTotalsForCharacter(character.className, character.level, character.subclassId),
    [character.className, character.level, character.subclassId]
  );
  const spellSlotsExpended = useMemo(
    () => normalizeSpellSlotsExpended(character.spellSlotsExpended, spellSlotTotals),
    [character.spellSlotsExpended, spellSlotTotals]
  );
  const spellSlotsRemaining = useMemo(
    () =>
      spellSlotTotals.map((total, index) => Math.max(0, total - (spellSlotsExpended[index] ?? 0))),
    [spellSlotTotals, spellSlotsExpended]
  );
  const usesPreparedSpells = useMemo(
    () =>
      usesPreparedSpellsForCharacter(character.className, character.level, character.subclassId),
    [character.className, character.level, character.subclassId]
  );
  const alwaysPreparedSpellIds = useMemo(
    () => [
      ...new Set([
        ...getAlwaysPreparedSpellIds(
          character.className,
          character.level,
          character.classFeatureState,
          undefined,
          character.subclassId,
          character.statusEntries
        ),
        ...getSpeciesAlwaysPreparedSpellIdsForCharacter({
          species: character.species,
          level: character.level,
          speciesChoices: character.speciesChoices
        })
      ])
    ],
    [
      character.classFeatureState,
      character.className,
      character.level,
      character.species,
      character.speciesChoices,
      character.statusEntries,
      character.subclassId
    ]
  );
  const alwaysPreparedSpellEntries = useMemo(
    () =>
      alwaysPreparedSpellIds
        .map((spellId) => getSpellEntryById(spellId))
        .filter((spell): spell is SpellEntry => spell !== null)
        .map((spell) => getSpellEntryForCharacter(character, spell)),
    [alwaysPreparedSpellIds, character]
  );
  const classSpellEntriesById = useMemo(
    () =>
      new Map(
        [
          ...classSpellEntries,
          ...featGrantedCantripEntries,
          ...speciesGrantedCantripEntries,
          ...preparedSpellPoolEntries,
          ...alwaysPreparedSpellEntries
        ].map((spell) => [spell.id, spell])
      ),
    [
      alwaysPreparedSpellEntries,
      classSpellEntries,
      featGrantedCantripEntries,
      speciesGrantedCantripEntries,
      preparedSpellPoolEntries
    ]
  );
  const selectedCantrips = useMemo(() => {
    const selectedCantripEntries = new Map<string, SpellEntry>();

    normalizeTrackedSpellIds(
      character.cantripIds,
      classSpellEntries.filter((spell) => getSpellLevel(spell) === 0),
      cantripLimit
    ).forEach((spellId) => {
      const spell = classSpellEntriesById.get(spellId);

      if (spell) {
        selectedCantripEntries.set(spell.id, spell);
      }
    });

    featGrantedCantripEntries.forEach((spell) => {
      selectedCantripEntries.set(spell.id, spell);
    });

    speciesGrantedCantripEntries.forEach((spell) => {
      selectedCantripEntries.set(spell.id, spell);
    });

    return [...selectedCantripEntries.values()].sort((left, right) =>
      left.name.localeCompare(right.name)
    );
  }, [
    cantripLimit,
    character.cantripIds,
    classSpellEntries,
    classSpellEntriesById,
    featGrantedCantripEntries,
    speciesGrantedCantripEntries
  ]);
  const selectedPreparedSpells = useMemo(() => {
    const highestSpellSlotLevel = spellSlotTotals.reduce(
      (highest, total, index) => (total > 0 ? index + 1 : highest),
      0
    );
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
      .map((spellId) => classSpellEntriesById.get(spellId))
      .filter((spell): spell is SpellEntry => spell !== undefined);

    return usesPreparedSpells || preparedSpells.length > 0
      ? preparedSpells
      : spellPreparationOptions;
  }, [
    alwaysPreparedSpellIds,
    character.preparedSpellIds,
    classSpellEntriesById,
    preparedSpellLimit,
    preparedSpellPoolEntries,
    spellSlotTotals,
    usesPreparedSpells
  ]);
  const featureReactionEntries = useMemo(
    () => [
      ...getFeatureReactionEntriesForCharacter(character),
      ...getFeatReactionEntriesForCharacter(character)
    ],
    [character]
  );
  const featureReactionEntriesById = useMemo(
    () =>
      new Map(
        featureReactionEntries.map(
          (reaction) => [`reaction-entry-${reaction.id}`, reaction] as const
        )
      ),
    [featureReactionEntries]
  );
  const reactionStatusEntries = useMemo(
    () =>
      getDerivedReactionStatusEntries(
        [...selectedCantrips, ...selectedPreparedSpells],
        featureReactionEntries
      ),
    [featureReactionEntries, selectedCantrips, selectedPreparedSpells]
  );
  const statusEntries = useMemo(
    () =>
      resolveCharacterStatusEntries(character.statusEntries, [
        ...getDerivedFeatureStatusEntriesForCharacter(character),
        ...getCompanionStatusEntriesForCharacter(character),
        ...getFeatDerivedStatusEntriesForCharacter(character),
        ...getSpeciesDerivedStatusEntriesForCharacter(character),
        ...reactionStatusEntries
      ]),
    [character, reactionStatusEntries]
  );
  const statusSections = useMemo(
    () =>
      statusGroupOrder
        .map((group) => ({
          group,
          title: statusGroupTitles[group],
          entries: statusEntries.filter((entry) => entry.group === group)
        }))
        .filter((section) => section.entries.length > 0),
    [statusEntries]
  );
  const selectedStatusEntry = selectedStatusEntryId
    ? (statusEntries.find((entry) => entry.id === selectedStatusEntryId) ?? null)
    : null;
  const selectedReactionEntry =
    selectedStatusEntry?.group === STATUS_ENTRY_GROUP.REACTIONS &&
    selectedStatusEntry.sourceId?.startsWith("reaction-entry-")
      ? (featureReactionEntriesById.get(
          selectedStatusEntry.sourceId as `reaction-entry-${string}`
        ) ?? null)
      : null;

  return {
    classSpellEntriesById,
    featureReactionEntries,
    selectedReactionEntry,
    selectedStatusEntry,
    spellSlotTotals,
    spellSlotsExpended,
    spellSlotsRemaining,
    statusEntries,
    statusSections
  };
}
