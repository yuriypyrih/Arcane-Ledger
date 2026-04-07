import { CLASS_FEATURE } from "../../../../../codex/entries";
import { getSelectedSubclassForCharacter, getSubclassFeatureDetails } from "../../../subclasses";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";
import {
  druidMoonlightStepActionKey,
  getDruidMoonlightStepFallbackSlotLevel,
  getDruidMoonlightStepFallbackSlotSummary,
  getDruidMoonlightStepUsesRemaining,
  getDruidMoonlightStepUsesTotal
} from "../druid";

export const circleOfTheMoonSubclassId = "druid-circle-of-the-moon";

export const circleOfTheMoonSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Cure Wounds", "Moonbeam", "Starry Wisp"]),
  5: resolveSpellIdsByName(["Conjure Animals"]),
  7: resolveSpellIdsByName(["Fount of Moonlight"]),
  9: resolveSpellIdsByName(["Mass Cure Wounds"])
} as const;

function getCircleOfTheMoonFeatureActions(
  character: Parameters<SubclassRuntimeResolver>[0]
) {
  if (
    character.className !== "Druid" ||
    character.subclassId !== circleOfTheMoonSubclassId ||
    (character.level ?? 0) < 10
  ) {
    return [];
  }

  const usesRemaining = getDruidMoonlightStepUsesRemaining({
    className: character.className,
    level: character.level ?? 0,
    subclassId: character.subclassId,
    classFeatureState: character.classFeatureState,
    abilities: character.abilities
  });
  const usesTotal = getDruidMoonlightStepUsesTotal({
    className: character.className,
    level: character.level ?? 0,
    subclassId: character.subclassId,
    abilities: character.abilities
  });
  const fallbackSlotLevel = getDruidMoonlightStepFallbackSlotLevel({
    className: character.className,
    level: character.level ?? 0,
    spellSlotsExpended: character.spellSlotsExpended ?? []
  });
  const fallbackSlotSummary = getDruidMoonlightStepFallbackSlotSummary({
    className: character.className,
    level: character.level ?? 0,
    spellSlotsExpended: character.spellSlotsExpended ?? []
  });
  const description =
    getSubclassFeatureDetails(
      getSelectedSubclassForCharacter(character),
      10,
      CLASS_FEATURE.MOONLIGHT_STEP
    )?.description ?? [];
  const resources = [
    {
      kind: "tracker" as const,
      label: "Uses",
      current: usesRemaining,
      total: usesTotal,
      cost: 1
    },
    ...(fallbackSlotSummary.total > 0
      ? [
          {
            kind: "text" as const,
            label: "2+ Spell Slots",
            value: `${fallbackSlotSummary.remaining}/${fallbackSlotSummary.total}`
          }
        ]
      : [])
  ];
  const disabled = usesRemaining <= 0 && fallbackSlotLevel === null;

  return [
    {
      key: druidMoonlightStepActionKey,
      name: "Moonlight Step",
      summary: "Teleport up to 30 feet and empower your next attack.",
      detail: "Teleport up to 30 feet and gain Advantage on your next attack roll this turn.",
      description,
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal,
      usesInlineLabel:
        usesRemaining <= 0 && fallbackSlotLevel !== null ? "| Use 2+ Spell Slot" : undefined,
      resources,
      drawer: {
        kind: "confirm" as const,
        eyebrow: "Circle of the Moon",
        description,
        confirmLabel: "Step",
        helperText:
          fallbackSlotSummary.total > 0
            ? "When your uses are gone, Moonlight Step spends your lowest available 2+ spell slot."
            : undefined,
        resources
      },
      execute: {
        kind: "activate" as const,
        label: "Step"
      },
      disabled,
      disabledReason: disabled ? "No Moonlight Step uses or 2+ spell slots available." : undefined
    }
  ];
}

export const getDruidCircleOfTheMoonDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  character.className === "Druid" &&
  character.subclassId === circleOfTheMoonSubclassId &&
  (character.level ?? 0) >= 3
    ? {
        featureActions: getCircleOfTheMoonFeatureActions(character),
        alwaysPreparedSpellIds: getDruidCircleOfTheMoonSpellIdsForCharacter(character)
      }
    : {};

export function getDruidCircleOfTheMoonSpellIdsForCharacter(
  character: Parameters<SubclassRuntimeResolver>[0],
  spellIdsByLevel = circleOfTheMoonSpellIdsByLevel
): string[] {
  return character.className === "Druid" &&
    character.subclassId === circleOfTheMoonSubclassId &&
    (character.level ?? 0) >= 3
    ? getPreparedSpellIdsByLevel(character.level ?? 0, spellIdsByLevel)
    : [];
}
