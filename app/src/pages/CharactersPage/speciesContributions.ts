import { getSpellEntryById, type SpellEntry } from "../../codex/entries";
import type { AbilityKey, Character } from "../../types";
import type { FeatureContributionSpec, FeatureFreeCastEntry } from "./featureContributions";
import type { FeatureActionCard, SpellSourceMap } from "./classFeatures/types";
import {
  getDragonbornActionsForCharacter,
  getDragonbornDerivedStatusEntriesForCharacter,
  getDragonbornSpeedBonusesForCharacter
} from "./speciesDragonborn";
import {
  getDwarfActionsForCharacter,
  getDwarfDerivedStatusEntriesForCharacter
} from "./speciesDwarf";
import {
  getElfAlwaysPreparedSpellIdsForCharacter,
  getElfAlwaysPreparedSpellSourceMapForCharacter,
  getElfDerivedStatusEntriesForCharacter,
  getElfGrantedCantripEntriesForCharacter,
  getElfSpeedBonusesForCharacter,
  getElfSpellcastingAbilityForCharacter
} from "./speciesElf";
import {
  getGnomeAlwaysPreparedSpellIdsForCharacter,
  getGnomeAlwaysPreparedSpellSourceMapForCharacter,
  getGnomeDerivedStatusEntriesForCharacter,
  getGnomeGrantedCantripEntriesForCharacter,
  getGnomeSpeakWithAnimalsFreeCastStateForCharacter,
  getGnomeSpellEntryForCharacter,
  getGnomeSpellcastingAbilityForCharacter
} from "./speciesGnome";
import {
  getGoliathActionsForCharacter,
  getGoliathDerivedStatusEntriesForCharacter,
  getGoliathSpeedBonusesForCharacter
} from "./speciesGoliath";
import { getHalflingDerivedStatusEntriesForCharacter } from "./speciesHalfling";
import { getOrcCommonActionForCharacter, getOrcDerivedStatusEntriesForCharacter } from "./speciesOrc";
import {
  getTieflingAlwaysPreparedSpellIdsForCharacter,
  getTieflingAlwaysPreparedSpellSourceMapForCharacter,
  getTieflingDerivedStatusEntriesForCharacter,
  getTieflingFiendishLegacyFreeCastStateForCharacter,
  getTieflingGrantedCantripEntriesForCharacter,
  getTieflingSpellcastingAbilityForCharacter
} from "./speciesTiefling";

export type SpeciesContributionCharacter = Pick<Character, "species"> & Partial<Character>;

export const gnomeSpeakWithAnimalsFreeCastContributionId =
  "species-gnome-speak-with-animals-free-cast";
export const tieflingFiendishLegacyFreeCastContributionId =
  "species-tiefling-fiendish-legacy-free-cast";

function createSpeciesContribution(
  id: string,
  label: string
): FeatureContributionSpec["source"] {
  return {
    type: "species",
    id,
    label
  };
}

function getSpellEntriesForIds(spellIds: string[]): SpellEntry[] {
  return spellIds
    .map((spellId) => getSpellEntryById(spellId))
    .filter((spell): spell is SpellEntry => spell !== null);
}

function getFirstSpellSource(
  sourceMap: SpellSourceMap,
  spellId: string,
  fallbackSource: string
): string {
  return sourceMap[spellId]?.[0] ?? fallbackSource;
}

function createSpellGrants(
  spells: SpellEntry[],
  options: {
    kind: "granted-cantrip" | "always-prepared-cantrip" | "always-prepared-spell";
    sourceMap: SpellSourceMap;
    fallbackSource: string;
    getSpellcastingAbility: (spellId: string) => AbilityKey | null;
    getFreeCast?: (spellId: string) => (Omit<FeatureFreeCastEntry, "spellId"> & {
      spellId?: string;
    }) | undefined;
  }
): NonNullable<FeatureContributionSpec["spellGrants"]> {
  return spells.map((spell) => ({
    kind: options.kind,
    spell,
    sourceLabel: getFirstSpellSource(options.sourceMap, spell.id, options.fallbackSource),
    spellcastingAbility: options.getSpellcastingAbility(spell.id) ?? undefined,
    freeCast: options.getFreeCast?.(spell.id)
  }));
}

export function getSpeciesFeatureContributionsForCharacter(
  character: SpeciesContributionCharacter
): FeatureContributionSpec[] {
  const canCreateActions = typeof character.level === "number";
  const contributions: FeatureContributionSpec[] = [];
  const dragonbornActions = canCreateActions
    ? getDragonbornActionsForCharacter(character as Character)
    : [];
  const dwarfActions = canCreateActions ? getDwarfActionsForCharacter(character as Character) : [];
  const goliathActions = canCreateActions
    ? getGoliathActionsForCharacter(character as Character)
    : [];

  contributions.push(
    {
      source: createSpeciesContribution("species-dragonborn-2024", "Dragonborn"),
      actions: dragonbornActions,
      statuses: getDragonbornDerivedStatusEntriesForCharacter(character),
      speedBonuses: getDragonbornSpeedBonusesForCharacter(character)
    },
    {
      source: createSpeciesContribution("species-dwarf-2024", "Dwarf"),
      actions: dwarfActions,
      statuses: getDwarfDerivedStatusEntriesForCharacter(character)
    },
    {
      source: createSpeciesContribution("species-goliath-2024", "Goliath"),
      actions: goliathActions,
      statuses: getGoliathDerivedStatusEntriesForCharacter(character),
      speedBonuses: getGoliathSpeedBonusesForCharacter(character)
    },
    {
      source: createSpeciesContribution("species-halfling-2024", "Halfling"),
      statuses: getHalflingDerivedStatusEntriesForCharacter(character)
    },
    {
      source: createSpeciesContribution("species-orc-2024", "Orc"),
      statuses: getOrcDerivedStatusEntriesForCharacter(character),
      commonActionTransforms: [
        {
          id: "species-orc-adrenaline-rush-common-action",
          transform: (currentCharacter, action) =>
            getOrcCommonActionForCharacter(
              currentCharacter,
              action as unknown as FeatureActionCard
            ) as unknown as typeof action
        }
      ]
    }
  );

  const elfSourceMap = getElfAlwaysPreparedSpellSourceMapForCharacter(character);
  const elfGrantedCantrips = getElfGrantedCantripEntriesForCharacter(character);
  const elfAlwaysPreparedSpells = getSpellEntriesForIds(
    getElfAlwaysPreparedSpellIdsForCharacter(character)
  );

  contributions.push({
    source: createSpeciesContribution("species-elf-2024", "Elf"),
    statuses: getElfDerivedStatusEntriesForCharacter(character),
    speedBonuses: getElfSpeedBonusesForCharacter(character),
    spellGrants: [
      ...createSpellGrants(elfGrantedCantrips, {
        kind: "granted-cantrip",
        sourceMap: elfSourceMap,
        fallbackSource: "Elf",
        getSpellcastingAbility: (spellId) => getElfSpellcastingAbilityForCharacter(character, spellId)
      }),
      ...createSpellGrants(elfGrantedCantrips, {
        kind: "always-prepared-cantrip",
        sourceMap: elfSourceMap,
        fallbackSource: "Elf",
        getSpellcastingAbility: (spellId) => getElfSpellcastingAbilityForCharacter(character, spellId)
      }),
      ...createSpellGrants(elfAlwaysPreparedSpells, {
        kind: "always-prepared-spell",
        sourceMap: elfSourceMap,
        fallbackSource: "Elf",
        getSpellcastingAbility: (spellId) => getElfSpellcastingAbilityForCharacter(character, spellId)
      })
    ]
  });

  const gnomeSourceMap = getGnomeAlwaysPreparedSpellSourceMapForCharacter(character);
  const gnomeGrantedCantrips = getGnomeGrantedCantripEntriesForCharacter(character);
  const gnomeAlwaysPreparedSpells = getSpellEntriesForIds(
    getGnomeAlwaysPreparedSpellIdsForCharacter(character)
  );

  contributions.push({
    source: createSpeciesContribution("species-gnome-2024", "Gnome"),
    statuses: getGnomeDerivedStatusEntriesForCharacter(character),
    spellGrants: [
      ...createSpellGrants(gnomeGrantedCantrips, {
        kind: "granted-cantrip",
        sourceMap: gnomeSourceMap,
        fallbackSource: "Gnome",
        getSpellcastingAbility: (spellId) =>
          getGnomeSpellcastingAbilityForCharacter(character, spellId)
      }),
      ...createSpellGrants(gnomeGrantedCantrips, {
        kind: "always-prepared-cantrip",
        sourceMap: gnomeSourceMap,
        fallbackSource: "Gnome",
        getSpellcastingAbility: (spellId) =>
          getGnomeSpellcastingAbilityForCharacter(character, spellId)
      }),
      ...createSpellGrants(gnomeAlwaysPreparedSpells, {
        kind: "always-prepared-spell",
        sourceMap: gnomeSourceMap,
        fallbackSource: "Gnome",
        getSpellcastingAbility: (spellId) =>
          getGnomeSpellcastingAbilityForCharacter(character, spellId),
        getFreeCast: (spellId) => {
          const freeCastState = getGnomeSpeakWithAnimalsFreeCastStateForCharacter(
            character,
            spellId
          );

          return freeCastState
            ? {
                id: gnomeSpeakWithAnimalsFreeCastContributionId,
                spellId,
                usesRemaining: freeCastState.usesRemaining,
                usesTotal: freeCastState.usesTotal,
                expended: freeCastState.usesRemaining <= 0,
                recovery: "longRest"
              }
            : undefined;
        }
      })
    ],
    spellTransforms: [
      {
        id: "species-gnome-spell-transforms",
        transform: (spell) => getGnomeSpellEntryForCharacter(character, spell)
      }
    ]
  });

  const tieflingSourceMap = getTieflingAlwaysPreparedSpellSourceMapForCharacter(character);
  const tieflingGrantedCantrips = getTieflingGrantedCantripEntriesForCharacter(character);
  const tieflingAlwaysPreparedSpells = getSpellEntriesForIds(
    getTieflingAlwaysPreparedSpellIdsForCharacter(character)
  );

  contributions.push({
    source: createSpeciesContribution("species-tiefling-2024", "Tiefling"),
    statuses: getTieflingDerivedStatusEntriesForCharacter(character),
    spellGrants: [
      ...createSpellGrants(tieflingGrantedCantrips, {
        kind: "granted-cantrip",
        sourceMap: tieflingSourceMap,
        fallbackSource: "Tiefling",
        getSpellcastingAbility: (spellId) =>
          getTieflingSpellcastingAbilityForCharacter(character, spellId)
      }),
      ...createSpellGrants(tieflingGrantedCantrips, {
        kind: "always-prepared-cantrip",
        sourceMap: tieflingSourceMap,
        fallbackSource: "Tiefling",
        getSpellcastingAbility: (spellId) =>
          getTieflingSpellcastingAbilityForCharacter(character, spellId)
      }),
      ...createSpellGrants(tieflingAlwaysPreparedSpells, {
        kind: "always-prepared-spell",
        sourceMap: tieflingSourceMap,
        fallbackSource: "Tiefling",
        getSpellcastingAbility: (spellId) =>
          getTieflingSpellcastingAbilityForCharacter(character, spellId),
        getFreeCast: (spellId) => {
          const freeCastState = getTieflingFiendishLegacyFreeCastStateForCharacter(
            character,
            spellId
          );

          return freeCastState
            ? {
                id: tieflingFiendishLegacyFreeCastContributionId,
                spellId,
                usesRemaining: freeCastState.usesRemaining,
                usesTotal: freeCastState.usesTotal,
                expended: freeCastState.usesRemaining <= 0,
                recovery: "longRest"
              }
            : undefined;
        }
      })
    ]
  });

  return contributions;
}
