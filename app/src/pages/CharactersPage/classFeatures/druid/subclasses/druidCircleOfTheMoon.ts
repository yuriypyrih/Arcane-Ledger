import { CLASS_FEATURE } from "../../../../../codex/entries";
import type { Character, CharacterDruidFeatureState } from "../../../../../types";
import { getSelectedSubclassForCharacter, getSubclassFeatureDetails } from "../../../subclasses";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellcasting";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import {
  createChargesAndUsageHeaderTags,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../cardUsage";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";
import type {
  ArmorClassFeatureContext,
  FeatureArmorClassMode,
  FeatureSavingThrowBonus,
  FeatureSpellcastingState
} from "../../types";
import { getDruidCircleOfTheMoonMoonlightStepDescriptionAdditions } from "./druidCircleOfTheMoonDescriptions";
import {
  circleOfTheMoonSubclassId,
  hasDruidCircleFormsFeature,
  hasDruidCircleOfTheMoonSpellsFeature,
  hasDruidImprovedCircleFormsFeature,
  hasDruidLunarFormFeature,
  hasDruidMoonlightStepFeature
} from "./druidCircleOfTheMoonFeatures";
import {
  druidMoonlightStepActionKey,
  getDruidWildShapeActiveForm,
  normalizeDruidFeatureState
} from "../druid";

export const circleOfTheMoonSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Cure Wounds", "Moonbeam", "Starry Wisp"]),
  5: resolveSpellIdsByName(["Conjure Animals"]),
  7: resolveSpellIdsByName(["Fount of Moonlight"]),
  9: resolveSpellIdsByName(["Mass Cure Wounds"])
} as const;

export function getDruidCircleOfTheMoonWildShapeRules(
  baseRules: {
    knownForms: number;
    maxCr: number;
    maxCrLabel: string;
    allowFlySpeed: boolean;
  },
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
) {
  if (!hasDruidCircleFormsFeature(character)) {
    return baseRules;
  }

  const maxCr = Math.max(1, Math.floor(character.level / 3));

  return {
    ...baseRules,
    maxCr,
    maxCrLabel: String(maxCr)
  };
}

export function getDruidCircleOfTheMoonWildShapeTemporaryHitPoints(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  normalizedLevel: number
): number {
  return hasDruidCircleFormsFeature(character) ? normalizedLevel * 3 : normalizedLevel;
}

export function normalizeDruidCircleOfTheMoonFeatureState(
  value: Partial<CharacterDruidFeatureState>,
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): Pick<CharacterDruidFeatureState, "moonlightStepUsesExpended"> {
  const moonlightStepUsesTotal = hasDruidMoonlightStepFeature(character)
    ? Math.max(1, Math.floor((Math.max(1, Math.floor(character.abilities?.WIS ?? 10)) - 10) / 2))
    : 0;

  return {
    moonlightStepUsesExpended: hasDruidMoonlightStepFeature(character)
      ? Math.max(
          0,
          Math.min(
            moonlightStepUsesTotal,
            Number.isFinite(Number(value.moonlightStepUsesExpended))
              ? Math.floor(Number(value.moonlightStepUsesExpended))
              : 0
          )
        )
      : undefined
  };
}

function getDruidWisdomModifier(character: Partial<Pick<Character, "abilities">>): number {
  return Math.floor((Math.max(1, Math.floor(character.abilities?.WIS ?? 10)) - 10) / 2);
}

export function getDruidMoonlightStepUsesTotal(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  return hasDruidMoonlightStepFeature(character)
    ? Math.max(1, getDruidWisdomModifier(character))
    : 0;
}

export function getDruidMoonlightStepUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  const totalUses = getDruidMoonlightStepUsesTotal(character);

  if (totalUses <= 0) {
    return 0;
  }

  const druidState = normalizeDruidCircleOfTheMoonFeatureState(
    character.classFeatureState?.druid ?? {},
    character
  );

  return Math.max(0, totalUses - (druidState.moonlightStepUsesExpended ?? 0));
}

function getDruidSpellSlotsRemaining(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): number[] {
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );

  return spellSlotTotals.map((total: number, index: number) =>
    Math.max(0, total - (spellSlotsExpended[index] ?? 0))
  );
}

export function getDruidMoonlightStepFallbackSlotLevel(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): number | null {
  const spellSlotsRemaining = getDruidSpellSlotsRemaining(character);

  for (let slotLevel = 2; slotLevel <= 9; slotLevel += 1) {
    if ((spellSlotsRemaining[slotLevel - 1] ?? 0) > 0) {
      return slotLevel;
    }
  }

  return null;
}

export function getDruidMoonlightStepFallbackSlotSummary(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): { remaining: number; total: number } {
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsRemaining = getDruidSpellSlotsRemaining(character);

  return spellSlotTotals.reduce(
    (summary: { remaining: number; total: number }, total: number, index: number) => {
      const slotLevel = index + 1;

      if (slotLevel < 2) {
        return summary;
      }

      return {
        remaining: summary.remaining + (spellSlotsRemaining[index] ?? 0),
        total: summary.total + total
      };
    },
    { remaining: 0, total: 0 }
  );
}

export function restoreDruidMoonlightStepOnLongRest(
  character: Character,
  druidState = normalizeDruidFeatureState(character.classFeatureState?.druid, character)
): Character {
  if (
    getDruidMoonlightStepUsesTotal(character) <= 0 ||
    (druidState.moonlightStepUsesExpended ?? 0) <= 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        moonlightStepUsesExpended: 0
      }
    }
  };
}

export function activateDruidMoonlightStep(
  character: Character,
  druidState = normalizeDruidFeatureState(character.classFeatureState?.druid, character)
): Character {
  if (!hasDruidMoonlightStepFeature(character)) {
    return character;
  }

  const usesRemaining = getDruidMoonlightStepUsesRemaining(character);

  if (usesRemaining > 0) {
    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        druid: {
          ...druidState,
          moonlightStepUsesExpended: Math.min(
            getDruidMoonlightStepUsesTotal(character),
            (druidState.moonlightStepUsesExpended ?? 0) + 1
          )
        }
      }
    };
  }

  const fallbackSlotLevel = getDruidMoonlightStepFallbackSlotLevel(character);

  if (fallbackSlotLevel === null) {
    return character;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const nextSpellSlotsExpended = [...spellSlotsExpended];
  nextSpellSlotsExpended[fallbackSlotLevel - 1] =
    (nextSpellSlotsExpended[fallbackSlotLevel - 1] ?? 0) + 1;

  return {
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

export function getDruidCircleOfTheMoonSavingThrowBonuses(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>,
  ability: "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA"
): FeatureSavingThrowBonus[] {
  if (
    ability !== "CON" ||
    !hasDruidImprovedCircleFormsFeature(character) ||
    !getDruidWildShapeActiveForm(character)
  ) {
    return [];
  }

  return [
    {
      label: "WIS Modifier (Improved Circle Forms)",
      abilityModifierSource: "WIS"
    }
  ];
}

export function getDruidCircleFormsArmorClassModes(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>,
  _context: ArmorClassFeatureContext
): FeatureArmorClassMode[] {
  if (!hasDruidCircleFormsFeature(character)) {
    return [];
  }

  const hasActiveWildShapeForm = getDruidWildShapeActiveForm(character) !== null;

  return [
    {
      key: "druid-circle-forms-wild-shape-ac",
      label: "Circle Forms",
      unlockedAtLevel: 3,
      baseValue: 13,
      abilityModifiers: ["WIS"],
      shieldAllowed: false,
      isApplicable: hasActiveWildShapeForm,
      unavailableReason: hasActiveWildShapeForm ? undefined : "Requires an active Wild Shape form.",
      detail: "Circle of the Moon feature"
    }
  ];
}

export function getDruidCircleOfTheMoonSpellcastingState(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  hasActiveWildShapeForm: boolean,
  hasBeastSpells: boolean
): FeatureSpellcastingState | null {
  if (!hasActiveWildShapeForm) {
    return null;
  }

  if (hasBeastSpells) {
    return {
      blocked: false,
      reason: null
    };
  }

  if (hasDruidCircleOfTheMoonSpellsFeature(character)) {
    return {
      blocked: true,
      reason: "Only Circle of the Moon spells can be cast while in Wild Shape."
    };
  }

  return null;
}

function getCircleOfTheMoonFeatureActions(character: Parameters<SubclassRuntimeResolver>[0]) {
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
  const disabled = usesRemaining <= 0 && fallbackSlotLevel === null;

  return [
    {
      key: druidMoonlightStepActionKey,
      name: "Moonlight Step",
      summary: "Teleport up to 30 feet and empower your next attack.",
      detail: "Teleport up to 30 feet and gain Advantage on your next attack roll this turn.",
      breakdown: "Teleport, boost attack",
      description,
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      cardUsage: createChargesOrResourceCardUsage(
        usesRemaining,
        usesTotal,
        createFeatureActionCardCost({
          amountText: "2+",
          resourceLabel: "Spell Slot"
        })
      ),
      usesRemaining,
      usesTotal,
      usesInlineLabel:
        usesRemaining <= 0 && fallbackSlotLevel !== null ? "| Use 2+ Spell Slot" : undefined,
      headerTags: createChargesAndUsageHeaderTags(
        usesRemaining,
        usesTotal,
        createFeatureActionCardCost({
          amountText: "2+",
          resourceLabel: "Spell Slot"
        }),
        fallbackSlotSummary.remaining,
        fallbackSlotSummary.total,
        {
          label: "Spell Slots"
        }
      ),
      drawer: {
        kind: "confirm" as const,
        eyebrow: "Circle of the Moon",
        description,
        descriptionAdditions: getDruidCircleOfTheMoonMoonlightStepDescriptionAdditions(character)
      },
      execute: {
        kind: "activate" as const
      },
      disabled,
      disabledReason: disabled ? "No Moonlight Step uses or 2+ spell slots available." : undefined
    }
  ];
}

export function collectDruidCircleOfTheMoonContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  const runtimeCharacter = {
    className: character.className,
    level: character.level ?? 0,
    subclassId: character.subclassId,
    classFeatureState: character.classFeatureState
  };

  return [
    {
      source: createSubclassContributionSource({
        id: `${circleOfTheMoonSubclassId}-circle-spells`,
        label: "Circle of the Moon Spells",
        entryId: CLASS_FEATURE.CIRCLE_OF_THE_MOON_SPELLS
      }),
      alwaysPreparedSpellIds: getDruidCircleOfTheMoonSpellIdsForCharacter(character)
    },
    {
      source: createSubclassContributionSource({
        id: `${circleOfTheMoonSubclassId}-circle-forms`,
        label: "Circle Forms",
        entryId: CLASS_FEATURE.CIRCLE_FORMS
      }),
      armorClassModes: [
        {
          id: `${circleOfTheMoonSubclassId}-circle-forms-ac`,
          getModes: (context) => getDruidCircleFormsArmorClassModes(runtimeCharacter, context)
        }
      ]
    },
    {
      source: createSubclassContributionSource({
        id: `${circleOfTheMoonSubclassId}-improved-circle-forms`,
        label: "Improved Circle Forms",
        entryId: CLASS_FEATURE.IMPROVED_CIRCLE_FORMS
      }),
      savingThrowBonuses: [
        {
          id: `${circleOfTheMoonSubclassId}-improved-circle-forms-saving-throw`,
          getBonuses: (ability) =>
            getDruidCircleOfTheMoonSavingThrowBonuses(runtimeCharacter, ability)
        }
      ]
    },
    {
      source: createSubclassContributionSource({
        id: `${circleOfTheMoonSubclassId}-moonlight-step`,
        label: "Moonlight Step",
        entryId: CLASS_FEATURE.MOONLIGHT_STEP
      }),
      actions: getCircleOfTheMoonFeatureActions(character)
    },
    ...(hasDruidLunarFormFeature({
      className: character.className,
      level: character.level ?? 0,
      subclassId: character.subclassId
    })
      ? [
          {
            source: createSubclassContributionSource({
              id: `${circleOfTheMoonSubclassId}-lunar-form`,
              label: "Lunar Form",
              entryId: CLASS_FEATURE.LUNAR_FORM
            })
          }
        ]
      : [])
  ];
}

export const getDruidCircleOfTheMoonDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectDruidCircleOfTheMoonContributions(character)),
    {
      character: character as Character
    }
  );

export function getDruidCircleOfTheMoonSpellIdsForCharacter(
  character: Parameters<SubclassRuntimeResolver>[0],
  spellIdsByLevel = circleOfTheMoonSpellIdsByLevel
): string[] {
  return hasDruidCircleOfTheMoonSpellsFeature({
    className: character.className,
    level: character.level ?? 0,
    subclassId: character.subclassId
  })
    ? getPreparedSpellIdsByLevel(character.level ?? 0, spellIdsByLevel)
    : [];
}
