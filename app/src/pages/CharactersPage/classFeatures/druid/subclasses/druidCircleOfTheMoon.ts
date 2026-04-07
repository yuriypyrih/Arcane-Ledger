import { CLASS_FEATURE } from "../../../../../codex/entries";
import type {
  Character,
  CharacterDruidFeatureState
} from "../../../../../types";
import { getSelectedSubclassForCharacter, getSubclassFeatureDetails } from "../../../subclasses";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellcasting";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";
import type {
  FeatureSavingThrowBonus,
  FeatureSpellcastingState
} from "../../types";
import {
  druidMoonlightStepActionKey,
  getDruidWildShapeActiveForm,
  normalizeDruidFeatureState
} from "../druid";

export const circleOfTheMoonSubclassId = "druid-circle-of-the-moon";

export const circleOfTheMoonSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Cure Wounds", "Moonbeam", "Starry Wisp"]),
  5: resolveSpellIdsByName(["Conjure Animals"]),
  7: resolveSpellIdsByName(["Fount of Moonlight"]),
  9: resolveSpellIdsByName(["Mass Cure Wounds"])
} as const;

export function hasDruidCircleOfTheMoonSpellsFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheMoonSubclassId &&
    Math.max(1, Math.min(20, Math.floor(character.level))) >= 3
  );
}

export function hasDruidCircleFormsFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheMoonSubclassId &&
    Math.max(1, Math.min(20, Math.floor(character.level))) >= 3
  );
}

export function hasDruidImprovedCircleFormsFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheMoonSubclassId &&
    Math.max(1, Math.min(20, Math.floor(character.level))) >= 6
  );
}

export function hasDruidMoonlightStepFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheMoonSubclassId &&
    Math.max(1, Math.min(20, Math.floor(character.level))) >= 10
  );
}

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
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId" | "abilities">>
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
  return hasDruidMoonlightStepFeature(character) ? Math.max(1, getDruidWisdomModifier(character)) : 0;
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
  hasDruidCircleOfTheMoonSpellsFeature({
    className: character.className,
    level: character.level ?? 0,
    subclassId: character.subclassId
  })
    ? {
        featureActions: getCircleOfTheMoonFeatureActions(character),
        alwaysPreparedSpellIds: getDruidCircleOfTheMoonSpellIdsForCharacter(character),
        getSavingThrowBonuses: (ability) =>
          getDruidCircleOfTheMoonSavingThrowBonuses(
            {
              className: character.className,
              level: character.level ?? 0,
              subclassId: character.subclassId,
              classFeatureState: character.classFeatureState
            },
            ability
          )
      }
    : {};

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
