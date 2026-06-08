import { CLASS_FEATURE, DAMAGE_TYPE } from "../../../../../codex/entries";
import type {
  Character,
  CharacterDruidFeatureState,
  DruidCircleOfTheLandChoice
} from "../../../../../types";
import {
  CONDITION_NAME,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { getSelectedSubclassForCharacter, getSubclassFeatureDetails } from "../../../subclasses";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../statusEntries";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";
import type { DerivedFeatureStatusEntry, FeatureActionCard } from "../../types";
import { createHeaderTagsFromResources } from "../../cardUsage";
import {
  druidLandsAidActionKey,
  druidNaturesSanctuaryActionKey,
  druidNaturesSanctuaryStatusSourceId,
  expendOneDruidWildShapeUse,
  getDruidWildShapeUsesRemaining,
  getDruidWildShapeUsesTotal,
  normalizeDruidFeatureState
} from "../druid";

export const circleOfTheLandSubclassId = "druid-circle-of-the-land";

const naturesWardPoisonedImmunitySourceId = "feature-druid-natures-ward-immunity-poisoned";
const naturesWardResistanceSourceIdPrefix = "feature-druid-natures-ward-resistance-";

export const circleOfTheLandSpellIdsByLand = {
  arid: {
    3: resolveSpellIdsByName(["Blur", "Burning Hands", "Fire Bolt"]),
    5: resolveSpellIdsByName(["Fireball"]),
    7: resolveSpellIdsByName(["Blight"]),
    9: resolveSpellIdsByName(["Wall of Stone"])
  },
  polar: {
    3: resolveSpellIdsByName(["Fog Cloud", "Hold Person", "Ray of Frost"]),
    5: resolveSpellIdsByName(["Sleet Storm"]),
    7: resolveSpellIdsByName(["Ice Storm"]),
    9: resolveSpellIdsByName(["Cone of Cold"])
  },
  temperate: {
    3: resolveSpellIdsByName(["Misty Step", "Shocking Grasp", "Sleep"]),
    5: resolveSpellIdsByName(["Lightning Bolt"]),
    7: resolveSpellIdsByName(["Freedom of Movement"]),
    9: resolveSpellIdsByName(["Tree Stride"])
  },
  tropical: {
    3: resolveSpellIdsByName(["Acid Splash", "Ray of Sickness", "Web"]),
    5: resolveSpellIdsByName(["Stinking Cloud"]),
    7: resolveSpellIdsByName(["Polymorph"]),
    9: resolveSpellIdsByName(["Insect Plague"])
  }
} as const;

export function hasDruidCircleOfTheLandSpellsFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheLandSubclassId &&
    Math.max(1, Math.min(20, Math.floor(character.level))) >= 3
  );
}

export function hasDruidNaturalRecoveryFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheLandSubclassId &&
    Math.max(1, Math.min(20, Math.floor(character.level))) >= 6
  );
}

export function hasDruidNaturesSanctuaryFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheLandSubclassId &&
    Math.max(1, Math.min(20, Math.floor(character.level))) >= 14
  );
}

function normalizeDruidCircleOfTheLandChoice(
  value: unknown
): DruidCircleOfTheLandChoice | undefined {
  return value === "arid" || value === "polar" || value === "temperate" || value === "tropical"
    ? value
    : undefined;
}

export function normalizeDruidCircleOfTheLandFeatureState(
  value: Partial<CharacterDruidFeatureState>,
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): Pick<CharacterDruidFeatureState, "circleOfTheLandChoice" | "naturalRecoveryUsesExpended"> {
  const hasCircleOfTheLandSpells = hasDruidCircleOfTheLandSpellsFeature(character);
  const hasNaturalRecovery = hasDruidNaturalRecoveryFeature(character);

  return {
    circleOfTheLandChoice: hasCircleOfTheLandSpells
      ? normalizeDruidCircleOfTheLandChoice(value.circleOfTheLandChoice)
      : undefined,
    naturalRecoveryUsesExpended: hasNaturalRecovery
      ? Math.max(0, Math.min(1, Number.isFinite(Number(value.naturalRecoveryUsesExpended))
          ? Math.floor(Number(value.naturalRecoveryUsesExpended))
          : 0))
      : undefined
  };
}

export function getDruidCircleOfTheLandChoice(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): DruidCircleOfTheLandChoice | null {
  if (!hasDruidCircleOfTheLandSpellsFeature(character)) {
    return null;
  }

  return normalizeDruidCircleOfTheLandFeatureState(
    character.classFeatureState?.druid ?? {},
    character
  ).circleOfTheLandChoice ?? null;
}

export function setDruidCircleOfTheLandChoice(
  character: Character,
  druidState: CharacterDruidFeatureState,
  circleOfTheLandChoice: DruidCircleOfTheLandChoice
): Character {
  if (!hasDruidCircleOfTheLandSpellsFeature(character)) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        circleOfTheLandChoice
      }
    }
  };
}

export function getDruidNaturalRecoveryUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return hasDruidNaturalRecoveryFeature(character) ? 1 : 0;
}

export function getDruidNaturalRecoveryUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  const totalUses = getDruidNaturalRecoveryUsesTotal(character);

  if (totalUses <= 0) {
    return 0;
  }

  const druidState = normalizeDruidCircleOfTheLandFeatureState(
    character.classFeatureState?.druid ?? {},
    character
  );

  return Math.max(0, totalUses - (druidState.naturalRecoveryUsesExpended ?? 0));
}

export function consumeDruidNaturalRecoveryUse(
  character: Character,
  druidState: CharacterDruidFeatureState
): Character {
  const usesRemaining = getDruidNaturalRecoveryUsesRemaining(character);

  if (usesRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        naturalRecoveryUsesExpended: Math.min(
          getDruidNaturalRecoveryUsesTotal(character),
          (druidState.naturalRecoveryUsesExpended ?? 0) + 1
        )
      }
    }
  };
}

export function restoreDruidNaturalRecoveryOnLongRest(
  character: Character,
  druidState = normalizeDruidFeatureState(character.classFeatureState?.druid, character)
): Character {
  if (
    getDruidNaturalRecoveryUsesTotal(character) <= 0 ||
    (druidState.naturalRecoveryUsesExpended ?? 0) <= 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        naturalRecoveryUsesExpended: 0
      }
    }
  };
}

export function activateDruidLandsAid(character: Character): Character {
  return hasDruidCircleOfTheLandSpellsFeature(character)
    ? expendOneDruidWildShapeUse(character)
    : character;
}

export function activateDruidNaturesSanctuary(character: Character): Character {
  if (
    !hasDruidNaturesSanctuaryFeature(character) ||
    getDruidWildShapeUsesRemaining(character) <= 0
  ) {
    return character;
  }

  const nextCharacter = expendOneDruidWildShapeUse(character);
  const nextStatusEntries = normalizeCharacterStatusEntries(nextCharacter.statusEntries).filter(
    (entry) => entry.sourceId !== druidNaturesSanctuaryStatusSourceId
  );

  return {
    ...nextCharacter,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Nature's Sanctuary",
        source: "Circle of the Land",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 10,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
        },
        sourceId: druidNaturesSanctuaryStatusSourceId
      })
    ]
  };
}

export function getDruidCircleOfTheLandSpellIdsForCharacter(
  character: Parameters<SubclassRuntimeResolver>[0],
  spellIdsByLand = circleOfTheLandSpellIdsByLand
): string[] {
  if (!hasDruidCircleOfTheLandSpellsFeature({
    className: character.className,
    level: character.level ?? 0,
    subclassId: character.subclassId
  })) {
    return [];
  }

  const landChoice = getDruidCircleOfTheLandChoice({
    className: character.className,
    level: character.level ?? 0,
    subclassId: character.subclassId,
    classFeatureState: character.classFeatureState
  });

  if (!landChoice) {
    return [];
  }

  return getPreparedSpellIdsByLevel(character.level ?? 0, spellIdsByLand[landChoice]);
}

function getCircleOfTheLandFeatureActions(character: Parameters<SubclassRuntimeResolver>[0]) {
  if (
    character.className !== "Druid" ||
    character.subclassId !== circleOfTheLandSubclassId ||
    (character.level ?? 0) < 3
  ) {
    return [];
  }

  const level = character.level ?? 0;
  const usesRemaining = getDruidWildShapeUsesRemaining({
    className: character.className,
    level,
    classFeatureState: character.classFeatureState
  });
  const usesTotal = getDruidWildShapeUsesTotal({
    className: character.className,
    level
  });
  const description =
    getSubclassFeatureDetails(
      getSelectedSubclassForCharacter(character),
      3,
      CLASS_FEATURE.LANDS_AID
    )?.description ?? [];
  const naturesSanctuaryDescription =
    getSubclassFeatureDetails(
      getSelectedSubclassForCharacter(character),
      14,
      CLASS_FEATURE.NATURES_SANCTUARY
    )?.description ?? [];
  const resources = [
    {
      kind: "tracker" as const,
      label: "Wild Shape",
      current: usesRemaining,
      total: usesTotal,
      icon: "paw" as const,
      cost: 1
    }
  ];

  const featureActions: FeatureActionCard[] = [
    {
      key: druidLandsAidActionKey,
      name: "Lands Aid",
      summary: "Call life-draining thorns and healing flowers.",
      detail: "Expend a Wild Shape use to damage foes and restore an ally.",
      breakdown: "Thorns heal allies",
      description,
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal,
      hideUsesTrackerOnCard: true,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "paw" as const,
      headerTags: createHeaderTagsFromResources(resources),
      drawer: {
        kind: "confirm" as const,
        eyebrow: "Circle of the Land",
        description
      },
      execute: {
        kind: "activate" as const
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "No Wild Shape uses remaining." : undefined
    },
    ...(level >= 14
      ? [
          {
            key: druidNaturesSanctuaryActionKey,
            name: "Nature's Sanctuary",
            summary: "Summon spectral trees and vines that shelter your allies.",
            detail: "Expend a Wild Shape use to create your sanctuary.",
            breakdown: "Spectral shelter grove",
            description: naturesSanctuaryDescription,
            economyType: ECONOMY_TYPE.ACTION,
            actionCategory: ACTION_CATEGORY.MAGIC,
            usesRemaining,
            usesTotal,
            hideUsesTrackerOnCard: true,
            usesInlineLabel: "Use 1",
            usesInlineIcon: "paw" as const,
            headerTags: createHeaderTagsFromResources(resources),
            drawer: {
              kind: "confirm" as const,
              eyebrow: "Circle of the Land",
              description: naturesSanctuaryDescription
            },
            execute: {
              kind: "activate" as const
            },
            disabled: usesRemaining <= 0,
            disabledReason: usesRemaining <= 0 ? "No Wild Shape uses remaining." : undefined
          }
        ]
      : [])
  ];

  return featureActions;
}

function getCircleOfTheLandNaturesWardEntries(character: Parameters<SubclassRuntimeResolver>[0]) {
  if (
    character.className !== "Druid" ||
    character.subclassId !== circleOfTheLandSubclassId ||
    (character.level ?? 0) < 10
  ) {
    return [];
  }

  const landChoice = getDruidCircleOfTheLandChoice({
    className: character.className,
    level: character.level ?? 0,
    subclassId: character.subclassId,
    classFeatureState: character.classFeatureState
  });
  const landResistanceByChoice: Partial<Record<NonNullable<typeof landChoice>, DAMAGE_TYPE>> = {
    arid: DAMAGE_TYPE.FIRE,
    polar: DAMAGE_TYPE.COLD,
    temperate: DAMAGE_TYPE.LIGHTNING,
    tropical: DAMAGE_TYPE.POISON
  };
  const resistance = landChoice ? landResistanceByChoice[landChoice] : null;
  const entries: DerivedFeatureStatusEntry[] = [
    {
      id: naturesWardPoisonedImmunitySourceId,
      sourceId: naturesWardPoisonedImmunitySourceId,
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: CONDITION_NAME.POISONED,
      source: "Nature's Ward",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE as const
      }
    }
  ];

  if (resistance) {
    entries.push({
      id: `${naturesWardResistanceSourceIdPrefix}${resistance.toLowerCase()}`,
      sourceId: `${naturesWardResistanceSourceIdPrefix}${resistance.toLowerCase()}`,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: resistance,
      source: "Nature's Ward",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE as const
      }
    });
  }

  return entries;
}

export function collectDruidCircleOfTheLandContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  const featureActions = getCircleOfTheLandFeatureActions(character);

  return [
    {
      source: createSubclassContributionSource({
        id: `${circleOfTheLandSubclassId}-circle-spells`,
        label: "Circle of the Land Spells",
        entryId: CLASS_FEATURE.CIRCLE_OF_THE_LAND_SPELLS
      }),
      alwaysPreparedSpellIds: getDruidCircleOfTheLandSpellIdsForCharacter(character)
    },
    {
      source: createSubclassContributionSource({
        id: `${circleOfTheLandSubclassId}-lands-aid`,
        label: "Lands Aid",
        entryId: CLASS_FEATURE.LANDS_AID
      }),
      actions: featureActions.filter((action) => action.key === druidLandsAidActionKey)
    },
    ...(hasDruidNaturalRecoveryFeature({
      className: character.className,
      level: character.level ?? 0,
      subclassId: character.subclassId
    })
      ? [
          {
            source: createSubclassContributionSource({
              id: `${circleOfTheLandSubclassId}-natural-recovery`,
              label: "Natural Recovery",
              entryId: CLASS_FEATURE.NATURAL_RECOVERY
            })
          }
        ]
      : []),
    {
      source: createSubclassContributionSource({
        id: `${circleOfTheLandSubclassId}-natures-ward`,
        label: "Nature's Ward",
        entryId: CLASS_FEATURE.NATURES_WARD
      }),
      statuses: getCircleOfTheLandNaturesWardEntries(character)
    },
    {
      source: createSubclassContributionSource({
        id: `${circleOfTheLandSubclassId}-natures-sanctuary`,
        label: "Nature's Sanctuary",
        entryId: CLASS_FEATURE.NATURES_SANCTUARY
      }),
      actions: featureActions.filter((action) => action.key === druidNaturesSanctuaryActionKey)
    }
  ];
}

export const getDruidCircleOfTheLandDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectDruidCircleOfTheLandContributions(character)),
    {
      character: character as Character
    }
  );
