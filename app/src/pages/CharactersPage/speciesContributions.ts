import { getSpellEntryById, type SpellEntry } from "../../codex/entries";
import type { AbilityKey, Character } from "../../types";
import type { FeatureContributionSpec, FeatureFreeCastEntry } from "./featureContributions";
import { ACTION_CARD_THEME } from "./actionCardTheme";
import type {
  FeatureActionCard,
  FeatureActionOptionCard,
  SpellSourceMap
} from "./classFeatures/types";
import type { WeaponAction } from "./gameplay";
import {
  getChangelingAbilityCheckIndicatorsForCharacter,
  getChangelingActionsForCharacter,
  getChangelingSkillIndicatorsForCharacter
} from "./speciesChangeling";
import {
  getDragonbornActionsForCharacter,
  getDragonbornDerivedStatusEntriesForCharacter,
  getDragonbornSpeedBonusesForCharacter
} from "./speciesDragonborn";
import {
  getDhampirDerivedStatusEntriesForCharacter,
  getDhampirDescriptionContributionsForCharacter,
  getDhampirSpeedBonusesForCharacter,
  getDhampirWeaponActionForCharacter
} from "./speciesDhampir";
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
  getGnomeSavingThrowIndicatorsForCharacter,
  getGnomeSpeakWithAnimalsFreeCastStateForCharacter,
  getGnomeSpellEntryForCharacter,
  getGnomeSpellcastingAbilityForCharacter
} from "./speciesGnome";
import {
  genasiLineageFreeCastContributionId,
  getGenasiAlwaysPreparedSpellIdsForCharacter,
  getGenasiAlwaysPreparedSpellSourceMapForCharacter,
  getGenasiDerivedStatusEntriesForCharacter,
  getGenasiGrantedCantripEntriesForCharacter,
  getGenasiLineageFreeCastStateForCharacter,
  getGenasiSpeedBonusesForCharacter,
  getGenasiSpellActionPathContributionsForCharacter,
  getGenasiSpellCastEffectsForCharacter,
  getGenasiSpellEntryForCharacter,
  getGenasiSpellcastingAbilityForCharacter
} from "./speciesGenasi";
import {
  getGoliathActionsForCharacter,
  getGoliathAbilityCheckIndicatorsForCharacter,
  getGoliathDerivedStatusEntriesForCharacter,
  getGoliathSavingThrowIndicatorsForCharacter,
  getGoliathSkillIndicatorsForCharacter,
  getGoliathSpeedBonusesForCharacter
} from "./speciesGoliath";
import {
  getHexbloodActionsForCharacter,
  getHexbloodAlwaysPreparedSpellIdsForCharacter,
  getHexbloodAlwaysPreparedSpellSourceMapForCharacter,
  getHexbloodDerivedStatusEntriesForCharacter,
  getHexbloodHexMagicFreeCastStateForCharacter,
  getHexbloodSpellcastingAbilityForCharacter
} from "./speciesHexblood";
import { getHalflingDerivedStatusEntriesForCharacter } from "./speciesHalfling";
import {
  getKalashtarDescriptionContributionsForCharacter,
  getKalashtarDerivedStatusEntriesForCharacter,
  getKalashtarSavingThrowIndicatorsForCharacter
} from "./speciesKalashtar";
import {
  getKhoravarAlwaysPreparedSpellSourceMapForCharacter,
  getKhoravarDerivedStatusEntriesForCharacter,
  getKhoravarGrantedCantripEntriesForCharacter,
  getKhoravarSpellcastingAbilityForCharacter
} from "./speciesKhoravar";
import {
  getLupinActionsForCharacter,
  getLupinDerivedStatusEntriesForCharacter,
  getLupinWeaponActionForCharacter
} from "./speciesLupin";
import { getOrcCommonActionForCharacter, getOrcDerivedStatusEntriesForCharacter } from "./speciesOrc";
import {
  getRebornActionsForCharacter,
  getRebornDerivedStatusEntriesForCharacter
} from "./speciesReborn";
import {
  getShifterActionsForCharacter,
  getShifterActionOptionsForCharacter,
  getShifterAbilityCheckIndicatorsForCharacter,
  getShifterArmorClassBonusesForCharacter,
  getShifterDerivedStatusEntriesForCharacter,
  getShifterReactionEntriesForCharacter,
  getShifterSkillIndicatorsForCharacter,
  getShifterSpeedBonusesForCharacter,
  getShifterWeaponActionForCharacter
} from "./speciesShifter";
import {
  getWarforgedArmorClassBonusesForCharacter,
  getWarforgedDerivedStatusEntriesForCharacter
} from "./speciesWarforged";
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
export { genasiLineageFreeCastContributionId };
export const hexbloodHexMagicFreeCastContributionId =
  "species-hexblood-hex-magic-free-cast";
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

function withSpeciesFeatureActionTheme(action: FeatureActionCard): FeatureActionCard {
  return action.cardTheme === ACTION_CARD_THEME.FEATURE
    ? action
    : { ...action, cardTheme: ACTION_CARD_THEME.FEATURE };
}

function withSpeciesFeatureActionThemes(actions: FeatureActionCard[]): FeatureActionCard[] {
  return actions.map(withSpeciesFeatureActionTheme);
}

function withSpeciesFeatureActionOptionTheme(
  option: FeatureActionOptionCard
): FeatureActionOptionCard {
  return option.cardTheme === ACTION_CARD_THEME.FEATURE
    ? option
    : { ...option, cardTheme: ACTION_CARD_THEME.FEATURE };
}

function withSpeciesFeatureActionOptionThemes(
  actionOptions: NonNullable<FeatureContributionSpec["actionOptions"]>
): NonNullable<FeatureContributionSpec["actionOptions"]> {
  return Object.fromEntries(
    Object.entries(actionOptions).map(([actionKey, options]) => [
      actionKey,
      options?.map(withSpeciesFeatureActionOptionTheme)
    ])
  );
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
    ? withSpeciesFeatureActionThemes(getDragonbornActionsForCharacter(character as Character))
    : [];
  const changelingActions = canCreateActions
    ? withSpeciesFeatureActionThemes(getChangelingActionsForCharacter(character as Character))
    : [];
  const dwarfActions = canCreateActions
    ? withSpeciesFeatureActionThemes(getDwarfActionsForCharacter(character as Character))
    : [];
  const goliathActions = canCreateActions
    ? withSpeciesFeatureActionThemes(getGoliathActionsForCharacter(character as Character))
    : [];
  const hexbloodActions = canCreateActions
    ? withSpeciesFeatureActionThemes(getHexbloodActionsForCharacter(character as Character))
    : [];
  const lupinActions = canCreateActions
    ? withSpeciesFeatureActionThemes(getLupinActionsForCharacter(character as Character))
    : [];
  const rebornActions = canCreateActions
    ? withSpeciesFeatureActionThemes(getRebornActionsForCharacter(character as Character))
    : [];
  const shifterActions = canCreateActions
    ? withSpeciesFeatureActionThemes(getShifterActionsForCharacter(character as Character))
    : [];
  const shifterActionOptions = canCreateActions
    ? withSpeciesFeatureActionOptionThemes(getShifterActionOptionsForCharacter(character))
    : {};

  contributions.push(
    {
      source: createSpeciesContribution("species-changeling-efa", "Changeling"),
      actions: changelingActions,
      abilityCheckIndicators: getChangelingAbilityCheckIndicatorsForCharacter(character),
      skillIndicators: getChangelingSkillIndicatorsForCharacter(character)
    },
    {
      source: createSpeciesContribution("species-dragonborn-2024", "Dragonborn"),
      actions: dragonbornActions,
      statuses: getDragonbornDerivedStatusEntriesForCharacter(character),
      speedBonuses: getDragonbornSpeedBonusesForCharacter(character)
    },
    {
      source: createSpeciesContribution("species-dhampir-rhw", "Dhampir"),
      statuses: getDhampirDerivedStatusEntriesForCharacter(character),
      speedBonuses: getDhampirSpeedBonusesForCharacter(character),
      descriptionAdditions: getDhampirDescriptionContributionsForCharacter(character),
      weaponActionTransforms: [
        {
          id: "species-dhampir-vampiric-bite-unarmed-description",
          transform: (_currentCharacter, action) =>
            getDhampirWeaponActionForCharacter(
              character,
              action as WeaponAction
            ) as unknown as typeof action
        }
      ]
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
      abilityCheckIndicators: getGoliathAbilityCheckIndicatorsForCharacter(character),
      savingThrowIndicators: getGoliathSavingThrowIndicatorsForCharacter(character),
      skillIndicators: getGoliathSkillIndicatorsForCharacter(character),
      speedBonuses: getGoliathSpeedBonusesForCharacter(character)
    },
    {
      source: createSpeciesContribution("species-hexblood-rhw", "Hexblood"),
      actions: hexbloodActions,
      statuses: getHexbloodDerivedStatusEntriesForCharacter(character)
    },
    {
      source: createSpeciesContribution("species-halfling-2024", "Halfling"),
      statuses: getHalflingDerivedStatusEntriesForCharacter(character)
    },
    {
      source: createSpeciesContribution("species-kalashtar-efa", "Kalashtar"),
      statuses: getKalashtarDerivedStatusEntriesForCharacter(character),
      descriptionAdditions: getKalashtarDescriptionContributionsForCharacter(character),
      savingThrowIndicators: getKalashtarSavingThrowIndicatorsForCharacter(character)
    },
    {
      source: createSpeciesContribution("species-khoravar-efa", "Khoravar"),
      statuses: getKhoravarDerivedStatusEntriesForCharacter(character)
    },
    {
      source: createSpeciesContribution("species-lupin-rhw", "Lupin"),
      actions: lupinActions,
      statuses: getLupinDerivedStatusEntriesForCharacter(character),
      weaponActionTransforms: [
        {
          id: "species-lupin-feral-pounce-unarmed-description",
          transform: (_currentCharacter, action) =>
            getLupinWeaponActionForCharacter(
              character,
              action as WeaponAction
            ) as unknown as typeof action
        }
      ]
    },
    {
      source: createSpeciesContribution("species-reborn-rhw", "Reborn"),
      actions: rebornActions,
      statuses: getRebornDerivedStatusEntriesForCharacter(character)
    },
    {
      source: createSpeciesContribution("species-shifter-efa", "Shifter"),
      actions: shifterActions,
      actionOptions: shifterActionOptions,
      reactions: getShifterReactionEntriesForCharacter(character),
      statuses: getShifterDerivedStatusEntriesForCharacter(character),
      abilityCheckIndicators: getShifterAbilityCheckIndicatorsForCharacter(character),
      skillIndicators: getShifterSkillIndicatorsForCharacter(character),
      speedBonuses: getShifterSpeedBonusesForCharacter(character),
      armorClassBonuses: [
        {
          id: "species-shifter-beasthide-ac",
          getBonuses: () => getShifterArmorClassBonusesForCharacter(character)
        }
      ],
      weaponActionTransforms: [
        {
          id: "species-shifter-longtooth-unarmed-description",
          transform: (_currentCharacter, action) =>
            getShifterWeaponActionForCharacter(
              character,
              action as WeaponAction
            ) as unknown as typeof action
        }
      ]
    },
    {
      source: createSpeciesContribution("species-warforged-efa", "Warforged"),
      statuses: getWarforgedDerivedStatusEntriesForCharacter(character),
      armorClassBonuses: [
        {
          id: "species-warforged-integrated-protection-ac",
          getBonuses: () => getWarforgedArmorClassBonusesForCharacter(character)
        }
      ]
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

  const genasiSourceMap = getGenasiAlwaysPreparedSpellSourceMapForCharacter(character);
  const genasiGrantedCantrips = getGenasiGrantedCantripEntriesForCharacter(character);
  const genasiAlwaysPreparedSpells = getSpellEntriesForIds(
    getGenasiAlwaysPreparedSpellIdsForCharacter(character)
  );

  contributions.push({
    source: createSpeciesContribution("species-genasi-mpmm", "Genasi"),
    statuses: getGenasiDerivedStatusEntriesForCharacter(character),
    speedBonuses: getGenasiSpeedBonusesForCharacter(character),
    spellGrants: [
      ...createSpellGrants(genasiGrantedCantrips, {
        kind: "granted-cantrip",
        sourceMap: genasiSourceMap,
        fallbackSource: "Genasi",
        getSpellcastingAbility: (spellId) =>
          getGenasiSpellcastingAbilityForCharacter(character, spellId)
      }),
      ...createSpellGrants(genasiGrantedCantrips, {
        kind: "always-prepared-cantrip",
        sourceMap: genasiSourceMap,
        fallbackSource: "Genasi",
        getSpellcastingAbility: (spellId) =>
          getGenasiSpellcastingAbilityForCharacter(character, spellId)
      }),
      ...createSpellGrants(genasiAlwaysPreparedSpells, {
        kind: "always-prepared-spell",
        sourceMap: genasiSourceMap,
        fallbackSource: "Genasi",
        getSpellcastingAbility: (spellId) =>
          getGenasiSpellcastingAbilityForCharacter(character, spellId),
        getFreeCast: (spellId) => {
          const freeCastState = getGenasiLineageFreeCastStateForCharacter(character, spellId);

          return freeCastState
            ? {
                id: genasiLineageFreeCastContributionId,
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
        id: "species-genasi-spell-transforms",
        transform: (spell) => getGenasiSpellEntryForCharacter(character, spell)
      }
    ],
    spellActionPaths: getGenasiSpellActionPathContributionsForCharacter(character),
    spellCastEffects: getGenasiSpellCastEffectsForCharacter(character)
  });

  const gnomeSourceMap = getGnomeAlwaysPreparedSpellSourceMapForCharacter(character);
  const gnomeGrantedCantrips = getGnomeGrantedCantripEntriesForCharacter(character);
  const gnomeAlwaysPreparedSpells = getSpellEntriesForIds(
    getGnomeAlwaysPreparedSpellIdsForCharacter(character)
  );

  contributions.push({
    source: createSpeciesContribution("species-gnome-2024", "Gnome"),
    statuses: getGnomeDerivedStatusEntriesForCharacter(character),
    savingThrowIndicators: getGnomeSavingThrowIndicatorsForCharacter(character),
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

  const hexbloodSourceMap = getHexbloodAlwaysPreparedSpellSourceMapForCharacter(character);
  const hexbloodAlwaysPreparedSpells = getSpellEntriesForIds(
    getHexbloodAlwaysPreparedSpellIdsForCharacter(character)
  );

  contributions.push({
    source: createSpeciesContribution("species-hexblood-rhw", "Hexblood"),
    spellGrants: [
      ...createSpellGrants(hexbloodAlwaysPreparedSpells, {
        kind: "always-prepared-spell",
        sourceMap: hexbloodSourceMap,
        fallbackSource: "Hexblood",
        getSpellcastingAbility: (spellId) =>
          getHexbloodSpellcastingAbilityForCharacter(character, spellId),
        getFreeCast: (spellId) => {
          const freeCastState = getHexbloodHexMagicFreeCastStateForCharacter(character, spellId);

          return freeCastState
            ? {
                id: hexbloodHexMagicFreeCastContributionId,
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

  const khoravarSourceMap = getKhoravarAlwaysPreparedSpellSourceMapForCharacter(character);
  const khoravarGrantedCantrips = getKhoravarGrantedCantripEntriesForCharacter(character);

  contributions.push({
    source: createSpeciesContribution("species-khoravar-efa", "Khoravar"),
    spellGrants: [
      ...createSpellGrants(khoravarGrantedCantrips, {
        kind: "granted-cantrip",
        sourceMap: khoravarSourceMap,
        fallbackSource: "Khoravar",
        getSpellcastingAbility: (spellId) =>
          getKhoravarSpellcastingAbilityForCharacter(character, spellId)
      }),
      ...createSpellGrants(khoravarGrantedCantrips, {
        kind: "always-prepared-cantrip",
        sourceMap: khoravarSourceMap,
        fallbackSource: "Khoravar",
        getSpellcastingAbility: (spellId) =>
          getKhoravarSpellcastingAbilityForCharacter(character, spellId)
      })
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
