import { CLASS_FEATURE, DAMAGE_TYPE } from "../../../../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character
} from "../../../../../types";
import {
  aquaticAffinityWrathOfTheSeaDescription,
  stormbornWrathOfTheSeaDescription,
  wrathOfTheSeaDescription
} from "../../../../../codex/subclasses/druid";
import { getSelectedSubclassForCharacter, getSubclassFeatureDetails } from "../../../subclasses";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../traits";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";
import type { DerivedFeatureStatusEntry, FeatureActionCard } from "../../types";
import {
  druidWrathOfTheSeaActionKey,
  druidWrathOfTheSeaStatusSourceId,
  expendOneDruidWildShapeUse,
  getDruidWildShapeUsesRemaining,
  getDruidWildShapeUsesTotal
} from "../druid";

export const circleOfTheSeaSubclassId = "druid-circle-of-the-sea";

export const circleOfTheSeaSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Fog Cloud", "Gust of Wind", "Ray of Frost", "Shatter", "Thunderwave"]),
  5: resolveSpellIdsByName(["Lightning Bolt", "Water Breathing"]),
  7: resolveSpellIdsByName(["Control Water", "Ice Storm"]),
  9: resolveSpellIdsByName(["Conjure Elemental", "Hold Monster"])
} as const;

export function hasDruidCircleOfTheSeaSpellsFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheSeaSubclassId &&
    Math.max(1, Math.min(20, Math.floor(character.level))) >= 3
  );
}

export function hasDruidWrathOfTheSeaFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return hasDruidCircleOfTheSeaSpellsFeature(character);
}

export function hasDruidAquaticAffinityFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheSeaSubclassId &&
    Math.max(1, Math.min(20, Math.floor(character.level))) >= 6
  );
}

export function getDruidWrathOfTheSeaAuraRangeFeet(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  if (!hasDruidWrathOfTheSeaFeature(character)) {
    return 0;
  }

  return hasDruidAquaticAffinityFeature(character) ? 10 : 5;
}

export function getDruidWrathOfTheSeaTraitValue(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string {
  return `Wrath of the Sea (${getDruidWrathOfTheSeaAuraRangeFeet(character)} FT.)`;
}

function getActiveWrathOfTheSeaStatusValue(
  statusEntries: Character["statusEntries"] | undefined
): string | null {
  const activeEntry = statusEntries?.find(
    (entry) =>
      entry.sourceId === druidWrathOfTheSeaStatusSourceId && typeof entry.value === "string"
  );

  return typeof activeEntry?.value === "string" ? activeEntry.value : null;
}

export function activateDruidWrathOfTheSea(character: Character): Character {
  if (!hasDruidWrathOfTheSeaFeature(character) || getDruidWildShapeUsesRemaining(character) <= 0) {
    return character;
  }

  const nextCharacter = expendOneDruidWildShapeUse(character);
  const nextStatusEntries = normalizeCharacterStatusEntries(nextCharacter.statusEntries).filter(
    (entry) => entry.sourceId !== druidWrathOfTheSeaStatusSourceId
  );

  return {
    ...nextCharacter,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.AURAS,
        value: getDruidWrathOfTheSeaTraitValue(nextCharacter),
        source: "Circle of the Sea",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: 10
        },
        sourceId: druidWrathOfTheSeaStatusSourceId
      })
    ]
  };
}

function getCircleOfTheSeaFeatureActions(character: Parameters<SubclassRuntimeResolver>[0]) {
  if (
    character.className !== "Druid" ||
    character.subclassId !== circleOfTheSeaSubclassId ||
    (character.level ?? 0) < 3
  ) {
    return [];
  }

  const usesRemaining = getDruidWildShapeUsesRemaining({
    className: character.className,
    level: character.level ?? 0,
    classFeatureState: character.classFeatureState
  });
  const usesTotal = getDruidWildShapeUsesTotal({
    className: character.className,
    level: character.level ?? 0
  });
  const wrathActive = getActiveWrathOfTheSeaStatusValue(character.statusEntries) !== null;
  const description =
    getSubclassFeatureDetails(
      getSelectedSubclassForCharacter(character),
      character.level ?? 0,
      CLASS_FEATURE.WRATH_OF_THE_SEA
    )?.description ??
    ((character.level ?? 0) >= 10
      ? [...stormbornWrathOfTheSeaDescription]
      : (character.level ?? 0) >= 6
        ? [...aquaticAffinityWrathOfTheSeaDescription]
        : [...wrathOfTheSeaDescription]);
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
      key: druidWrathOfTheSeaActionKey,
      name: "Wrath of the Sea",
      summary: "Manifest an ocean-spray aura that damages and pushes nearby creatures.",
      detail: "Expend a Wild Shape use to manifest your sea wrath for 10 minutes.",
      description,
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal,
      hideUsesTrackerOnCard: true,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "paw" as const,
      isActive: wrathActive,
      resources,
      drawer: {
        kind: "confirm" as const,
        eyebrow: "Circle of the Sea",
        description,
        confirmLabel: "Manifest",
        resources
      },
      execute: {
        kind: "activate" as const
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "No Wild Shape uses remaining." : undefined
    }
  ];

  return featureActions;
}

function getCircleOfTheSeaSpeedBonuses(character: Parameters<SubclassRuntimeResolver>[0]) {
  if (
    character.className !== "Druid" ||
    character.subclassId !== circleOfTheSeaSubclassId ||
    (character.level ?? 0) < 6
  ) {
    return [];
  }

  return [
    {
      label: "Aquatic Affinity",
      movementType: "swim" as const,
      value: 0,
      setBaseFromWalkMultiplier: 1
    },
    ...((character.level ?? 0) >= 10 &&
    getActiveWrathOfTheSeaStatusValue(character.statusEntries) !== null
      ? [
          {
            label: "Stormborn",
            movementType: "fly" as const,
            value: 0,
            setBaseFromWalkMultiplier: 1
          }
        ]
      : [])
  ];
}

function getCircleOfTheSeaStormbornEntries(character: Parameters<SubclassRuntimeResolver>[0]) {
  if (
    character.className !== "Druid" ||
    character.subclassId !== circleOfTheSeaSubclassId ||
    (character.level ?? 0) < 10
  ) {
    return [];
  }

  const wrathValue = getActiveWrathOfTheSeaStatusValue(character.statusEntries);

  if (!wrathValue) {
    return [];
  }

  return [DAMAGE_TYPE.COLD, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.THUNDER].map(
    (damageType): DerivedFeatureStatusEntry => ({
      id: `feature-druid-stormborn-resistance-${damageType.toLowerCase()}`,
      sourceId: `feature-druid-stormborn-resistance-${damageType.toLowerCase()}`,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: damageType,
      source: "Stormborn",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED as const,
        linkedGroup: STATUS_ENTRY_GROUP.AURAS,
        linkedValue: wrathValue
      }
    })
  );
}

export const getDruidCircleOfTheSeaDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  character.className === "Druid" &&
  character.subclassId === circleOfTheSeaSubclassId &&
  (character.level ?? 0) >= 3
    ? {
        featureActions: getCircleOfTheSeaFeatureActions(character),
        alwaysPreparedSpellIds: getDruidCircleOfTheSeaSpellIdsForCharacter(character),
        speedBonuses: getCircleOfTheSeaSpeedBonuses(character),
        derivedStatusEntries: getCircleOfTheSeaStormbornEntries(character)
      }
    : {};

export function getDruidCircleOfTheSeaSpellIdsForCharacter(
  character: Parameters<SubclassRuntimeResolver>[0],
  spellIdsByLevel = circleOfTheSeaSpellIdsByLevel
): string[] {
  return character.className === "Druid" &&
    character.subclassId === circleOfTheSeaSubclassId &&
    (character.level ?? 0) >= 3
    ? getPreparedSpellIdsByLevel(character.level ?? 0, spellIdsByLevel)
    : [];
}
