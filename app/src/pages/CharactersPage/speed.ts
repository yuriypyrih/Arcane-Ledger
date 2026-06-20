import type { AbilityKey, Character } from "../../types";
import { getLongstriderSpeedBonusesForCharacter } from "./characterRuntime/spellImplementations/giftOfAlacrityLongstrider";
import { getSpeedBonusesForCharacter } from "./classFeatures";
import { hasRogueThiefSecondStoryWorkFeature } from "./classFeatures/rogue/subclasses/rogueThief";
import type { FeatureSpeedBonus, MovementSpeedType } from "./classFeatures/types";
import { getFeatSpeedBonusesForCharacter } from "./feats/runtime";
import { getAbilityModifierForCharacter, getAbilityScoreForCharacter } from "./abilities";
import { getWornBodyArmorTypeForCharacter } from "./armor";
import { formatCustomTraitBonusFormulaTerm } from "./customTraitEffects";
import { getSpeciesSpeedBonusesForCharacter, getSpeciesSpeedDetailsForCharacter } from "./species";
import { getExhaustionSpeedAdjustment } from "./traits";

export type SpeedBreakdownEntry = {
  label: string;
  value: number;
  abilityModifierSource?: AbilityKey;
  formulaSourceLabel?: string;
  formulaLabel?: string;
};

export type MovementSpeedBaseExpression =
  | {
      kind: "fixed";
      value: number;
      label: string;
    }
  | {
      kind: "walk";
      walkValue: number;
      multiplier: number;
      sourceLabel?: string;
    }
  | {
      kind: "none";
    };

export type MovementSpeedBreakdown = {
  type: MovementSpeedType;
  label: string;
  total: number | null;
  source: string;
  baseExpression: MovementSpeedBaseExpression;
  entries: SpeedBreakdownEntry[];
  isModified: boolean;
};

export type MovementSpeedBreakdownMap = Record<MovementSpeedType, MovementSpeedBreakdown>;

export type JumpDistanceType = "long" | "high";

export type JumpDistanceBreakdown = {
  type: JumpDistanceType;
  label: string;
  total: number;
  ability: AbilityKey;
  abilityValue: number;
  sourceLabel?: string;
};

export type JumpDistanceBreakdownMap = Record<`${JumpDistanceType}Jump`, JumpDistanceBreakdown>;

const movementSpeedTypes = [
  "walk",
  "climb",
  "swim",
  "fly",
  "burrow"
] as const satisfies readonly MovementSpeedType[];

const movementLabels: Record<MovementSpeedType, string> = {
  walk: "Walk",
  climb: "Climb",
  swim: "Swim",
  fly: "Fly",
  burrow: "Burrow"
};

const defaultMovementMultipliers: Record<Exclude<MovementSpeedType, "walk">, number | null> = {
  climb: 0.5,
  swim: 0.5,
  fly: null,
  burrow: null
};

const secondStoryWorkSource = "Second-Story Work";

function getMovementSpeedBonuses(
  character: Character,
  movementType: MovementSpeedType
): FeatureSpeedBonus[] {
  return [
    ...getSpeedBonusesForCharacter(character, {
      wornBodyArmorType: getWornBodyArmorTypeForCharacter(character)
    }),
    ...getLongstriderSpeedBonusesForCharacter(character),
    ...getSpeciesSpeedBonusesForCharacter(character),
    ...getFeatSpeedBonusesForCharacter(character)
  ]
    .filter((bonus) => (bonus.movementType ?? "walk") === movementType)
    .map((bonus) =>
      bonus.abilityModifierSource
        ? {
            ...bonus,
            value:
              getAbilityModifierForCharacter(character, bonus.abilityModifierSource) *
              (bonus.abilityModifierMultiplier ?? 1)
          }
        : bonus
    );
}

function getSetTotalOverride(bonuses: FeatureSpeedBonus[]): number | null {
  return bonuses.reduce<number | null>((currentOverride, bonus) => {
    if (typeof bonus.setTotal !== "number") {
      return currentOverride;
    }

    return currentOverride === null ? bonus.setTotal : Math.min(currentOverride, bonus.setTotal);
  }, null);
}

function resolveTotalFromBaseAndBonuses(
  baseTotal: number,
  bonuses: FeatureSpeedBonus[]
): {
  total: number;
  entries: SpeedBreakdownEntry[];
} {
  const entries: SpeedBreakdownEntry[] = bonuses
    .filter((bonus) => bonus.value !== 0)
    .map((bonus) => ({
      label: bonus.label,
      value: bonus.value,
      abilityModifierSource: bonus.abilityModifierSource,
      formulaSourceLabel: bonus.formulaSourceLabel,
      formulaLabel: formatCustomTraitBonusFormulaTerm(bonus) ?? undefined
    }));
  const adjustedTotal = baseTotal + entries.reduce((total, entry) => total + entry.value, 0);
  const totalOverride = getSetTotalOverride(bonuses);
  const preOverrideTotal =
    totalOverride !== null && adjustedTotal === 0 && entries.length === 0
      ? totalOverride
      : adjustedTotal;
  const total =
    totalOverride === null ? preOverrideTotal : Math.min(preOverrideTotal, totalOverride);

  if (totalOverride !== null && total !== adjustedTotal) {
    const overrideBonus = bonuses.find((bonus) => bonus.setTotal === totalOverride);

    entries.push({
      label: overrideBonus?.label ?? "Speed Override",
      value: total - adjustedTotal
    });
  }

  return {
    total: Math.max(0, total),
    entries
  };
}

function createWalkSpeedBreakdown(character: Character): MovementSpeedBreakdown {
  const { speed: baseSpeed, source } = getSpeciesSpeedDetailsForCharacter(character);
  const bonuses = getMovementSpeedBonuses(character, "walk");
  const { total: preExhaustionTotal, entries } = resolveTotalFromBaseAndBonuses(baseSpeed, bonuses);
  const exhaustionAdjustment = getExhaustionSpeedAdjustment(
    preExhaustionTotal,
    character.statusEntries
  );

  if (exhaustionAdjustment && exhaustionAdjustment.value !== 0) {
    entries.push(exhaustionAdjustment);
  }

  return {
    type: "walk",
    label: movementLabels.walk,
    total: Math.max(
      0,
      entries.reduce((total, entry) => total + entry.value, baseSpeed)
    ),
    source,
    baseExpression: {
      kind: "fixed",
      value: baseSpeed,
      label: `Base (${source})`
    },
    entries,
    isModified: false
  };
}

function getMovementBaseExpression(
  movementType: Exclude<MovementSpeedType, "walk">,
  walkTotal: number,
  bonuses: FeatureSpeedBonus[]
): MovementSpeedBaseExpression {
  const defaultMultiplier = defaultMovementMultipliers[movementType];
  const multiplierOverrideBonus = bonuses.reduce<FeatureSpeedBonus | null>(
    (currentValue, bonus) => {
      if (typeof bonus.setBaseFromWalkMultiplier !== "number") {
        return currentValue;
      }

      return bonus;
    },
    null
  );
  const multiplierOverride =
    typeof multiplierOverrideBonus?.setBaseFromWalkMultiplier === "number"
      ? multiplierOverrideBonus.setBaseFromWalkMultiplier
      : defaultMultiplier;

  if (typeof multiplierOverride === "number") {
    return {
      kind: "walk",
      walkValue: walkTotal,
      multiplier: multiplierOverride,
      sourceLabel: multiplierOverrideBonus?.label
    };
  }

  return {
    kind: "none"
  };
}

function getMovementBaseTotal(baseExpression: MovementSpeedBaseExpression): number {
  if (baseExpression.kind === "fixed") {
    return baseExpression.value;
  }

  if (baseExpression.kind === "walk") {
    return Math.floor(baseExpression.walkValue * baseExpression.multiplier);
  }

  return 0;
}

function createDerivedMovementSpeedBreakdown(
  character: Character,
  movementType: Exclude<MovementSpeedType, "walk">,
  walkTotal: number
): MovementSpeedBreakdown {
  const bonuses = getMovementSpeedBonuses(character, movementType);
  const baseExpression = getMovementBaseExpression(movementType, walkTotal, bonuses);
  const baseTotal = getMovementBaseTotal(baseExpression);
  const { total, entries } = resolveTotalFromBaseAndBonuses(baseTotal, bonuses);
  const defaultMultiplier = defaultMovementMultipliers[movementType];
  const isModified =
    baseExpression.kind === "walk"
      ? baseExpression.multiplier !== defaultMultiplier || entries.length > 0
      : total > 0 || entries.length > 0;

  return {
    type: movementType,
    label: movementLabels[movementType],
    total: baseExpression.kind === "none" && total <= 0 ? null : total,
    source: "Walk Speed",
    baseExpression,
    entries,
    isModified
  };
}

export function getMovementSpeedBreakdownsForCharacter(
  character: Character
): MovementSpeedBreakdownMap {
  const walk = createWalkSpeedBreakdown(character);

  return {
    walk,
    climb: createDerivedMovementSpeedBreakdown(character, "climb", walk.total ?? 0),
    swim: createDerivedMovementSpeedBreakdown(character, "swim", walk.total ?? 0),
    fly: createDerivedMovementSpeedBreakdown(character, "fly", walk.total ?? 0),
    burrow: createDerivedMovementSpeedBreakdown(character, "burrow", walk.total ?? 0)
  };
}

function getJumpDistanceAbility(character: Character): {
  ability: AbilityKey;
  sourceLabel?: string;
} {
  if (hasRogueThiefSecondStoryWorkFeature(character)) {
    return {
      ability: "DEX",
      sourceLabel: secondStoryWorkSource
    };
  }

  return {
    ability: "STR"
  };
}

export function getJumpDistanceBreakdownsForCharacter(
  character: Character
): JumpDistanceBreakdownMap {
  const { ability, sourceLabel } = getJumpDistanceAbility(character);
  const abilityScore = getAbilityScoreForCharacter(character, ability);
  const abilityModifier = getAbilityModifierForCharacter(character, ability);

  return {
    longJump: {
      type: "long",
      label: "Long Jump",
      total: abilityScore,
      ability,
      abilityValue: abilityScore,
      sourceLabel
    },
    highJump: {
      type: "high",
      label: "High Jump",
      total: 3 + abilityModifier,
      ability,
      abilityValue: abilityModifier,
      sourceLabel
    }
  };
}

export function getSpeedBreakdownForCharacter(character: Character): MovementSpeedBreakdown {
  return getMovementSpeedBreakdownsForCharacter(character).walk;
}

export function getSpeedForCharacter(character: Character): number {
  return getMovementSpeedBreakdownsForCharacter(character).walk.total ?? 0;
}

export function hasModifiedSpecialMovementForCharacter(character: Character): boolean {
  const speedBreakdowns = getMovementSpeedBreakdownsForCharacter(character);

  return movementSpeedTypes
    .filter((movementType) => movementType !== "walk")
    .some((movementType) => speedBreakdowns[movementType].isModified);
}

export function canCharacterHover(character: Character): boolean {
  if (character.hover === true) {
    return true;
  }

  return getSpeedBonusesForCharacter(character, {
    wornBodyArmorType: getWornBodyArmorTypeForCharacter(character)
  })
    .concat(getSpeciesSpeedBonusesForCharacter(character))
    .some((bonus) => bonus.hover === true);
}
