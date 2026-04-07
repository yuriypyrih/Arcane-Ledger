import { CLASS_FEATURE, DAMAGE_TYPE } from "../../../../../codex/entries";
import {
  CONDITION_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { getSelectedSubclassForCharacter, getSubclassFeatureDetails } from "../../../subclasses";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";
import type { DerivedFeatureStatusEntry, FeatureActionCard } from "../../types";
import {
  druidLandsAidActionKey,
  druidNaturesSanctuaryActionKey,
  getDruidCircleOfTheLandChoice,
  getDruidWildShapeUsesRemaining,
  getDruidWildShapeUsesTotal
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

export function getDruidCircleOfTheLandSpellIdsForCharacter(
  character: Parameters<SubclassRuntimeResolver>[0],
  spellIdsByLand = circleOfTheLandSpellIdsByLand
): string[] {
  if (
    character.className !== "Druid" ||
    character.subclassId !== circleOfTheLandSubclassId ||
    (character.level ?? 0) < 3
  ) {
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

function getCircleOfTheLandFeatureActions(
  character: Parameters<SubclassRuntimeResolver>[0]
) {
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
      description,
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal,
      hideUsesTrackerOnCard: true,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "paw" as const,
      resources,
      drawer: {
        kind: "confirm" as const,
        eyebrow: "Circle of the Land",
        description,
        confirmLabel: "Use Lands Aid",
        resources
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
            description: naturesSanctuaryDescription,
            economyType: ECONOMY_TYPE.ACTION,
            actionCategory: ACTION_CATEGORY.MAGIC,
            usesRemaining,
            usesTotal,
            hideUsesTrackerOnCard: true,
            usesInlineLabel: "Use 1",
            usesInlineIcon: "paw" as const,
            resources,
            drawer: {
              kind: "confirm" as const,
              eyebrow: "Circle of the Land",
              description: naturesSanctuaryDescription,
              confirmLabel: "Cast",
              resources
            },
            execute: {
              kind: "activate" as const,
              label: "Cast"
            },
            disabled: usesRemaining <= 0,
            disabledReason: usesRemaining <= 0 ? "No Wild Shape uses remaining." : undefined
          }
        ]
      : [])
  ];

  return featureActions;
}

function getCircleOfTheLandNaturesWardEntries(
  character: Parameters<SubclassRuntimeResolver>[0]
) {
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

export const getDruidCircleOfTheLandDerivedFeatureState: SubclassRuntimeResolver = (character) => ({
  featureActions: getCircleOfTheLandFeatureActions(character),
  alwaysPreparedSpellIds: getDruidCircleOfTheLandSpellIdsForCharacter(character),
  derivedStatusEntries: getCircleOfTheLandNaturesWardEntries(character)
});
