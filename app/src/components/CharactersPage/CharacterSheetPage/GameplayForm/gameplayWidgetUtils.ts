import type { ActionShapeType } from "../../../ActionShape";
import { ACTION_TYPE } from "../../../../codex/entries";
import {
  getRoundTrackerResourceForEconomyType,
  type EconomyType
} from "../../../../pages/CharactersPage/actionEconomy";
import {
  formatAbilityModifier,
  type WeaponAction
} from "../../../../pages/CharactersPage/gameplay";
import {
  isRoundTrackerResourceAvailable,
  type RoundTrackerResource
} from "../../../../pages/CharactersPage/combat";
import { parseRollFormulaRange } from "../../../../pages/CharactersPage/actionOutcome";
import {
  formatResolvedRollStateSummary,
  resolveFeatureIndicators
} from "../../../RollStatePill/rollState";

function formatSignedValue(value: number): string {
  return value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`;
}

function formatProficiencyLabel(label: string): string {
  return label
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDamageExpression(damageLabel: string, modifier: number): string {
  if (modifier === 0) {
    return damageLabel;
  }

  return `${damageLabel} ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
}

export function getDamageRangeLabel(
  damageLabel: string,
  modifier: number,
  fullRollFormula: string
): string {
  const parsedRange = parseRollFormulaRange(fullRollFormula);
  const damageExpression = formatDamageExpression(damageLabel, modifier);

  if (!parsedRange) {
    return `Damage (${damageExpression})`;
  }

  if (parsedRange.minimum === parsedRange.maximum) {
    return `${parsedRange.minimum} Damage (${damageExpression})`;
  }

  return `${parsedRange.minimum}~${parsedRange.maximum} Damage (${damageExpression})`;
}

function hasVisibleWeaponProficiency(
  action: Pick<WeaponAction, "proficiencyLabel" | "proficiencyBonus">
) {
  return action.proficiencyBonus !== 0 && action.proficiencyLabel.trim().length > 0;
}

export function getWeaponActionRollDescription(action: WeaponAction): string {
  const resolvedRollState = resolveFeatureIndicators(action.indicators);
  const damageAbility = action.damageAbility ?? action.ability;
  const damageAbilityModifier = action.damageAbilityModifier ?? action.abilityModifier;
  const segments = [
    ...(resolvedRollState ? [formatResolvedRollStateSummary(resolvedRollState)] : []),
    `${action.ability} ${formatAbilityModifier(action.abilityModifier)}`
  ];

  if (damageAbility !== action.ability || damageAbilityModifier !== action.abilityModifier) {
    segments.push(`Damage ${damageAbility} ${formatAbilityModifier(damageAbilityModifier)}`);
  }

  if (hasVisibleWeaponProficiency(action)) {
    segments.push(
      `Proficiency (${formatProficiencyLabel(action.proficiencyLabel)}) ${formatAbilityModifier(action.proficiencyBonus)}`
    );
  }

  if (action.hasVersatileBonus) {
    segments.push("+ Versatile Bonus");
  }

  if (action.hasGreatWeaponFighting) {
    segments.push("+ Great Weapon Fighting");
  }

  if (action.hasMartialArtsDamageDie) {
    segments.push("+ Martial Arts");
  }

  if (action.hasBatteringRootsBonus) {
    segments.push("+ Battering Roots");
  }

  action.damageBonusEntries.forEach((entry) => {
    if (entry.value !== undefined) {
      segments.push(`${entry.label} ${formatAbilityModifier(entry.value)}`);
      return;
    }

    segments.push(`+ ${entry.label}`);
  });

  return segments.join(" | ");
}

export function getWeaponActionBreakdown(action: WeaponAction): string {
  const resolvedRollState = resolveFeatureIndicators(action.indicators);
  const damageAbility = action.damageAbility ?? action.ability;
  const damageAbilityModifier = action.damageAbilityModifier ?? action.abilityModifier;
  const segments = [
    ...(resolvedRollState ? [formatResolvedRollStateSummary(resolvedRollState)] : []),
    `${action.ability} ${formatSignedValue(action.abilityModifier)}`
  ];

  if (damageAbility !== action.ability || damageAbilityModifier !== action.abilityModifier) {
    segments.push(`Damage ${damageAbility} ${formatSignedValue(damageAbilityModifier)}`);
  }

  if (action.damageBreakdownLabel) {
    segments.push(action.damageBreakdownLabel);
  }

  if (hasVisibleWeaponProficiency(action)) {
    segments.push(
      `Prof. (${formatProficiencyLabel(action.proficiencyLabel)}) ${formatSignedValue(action.proficiencyBonus)}`
    );
  }

  if (action.hasVersatileBonus) {
    segments.push("+ Versatile Bonus");
  }

  if (action.hasGreatWeaponFighting) {
    segments.push("+ Great Weapon Fighting");
  }

  if (action.hasMartialArtsDamageDie) {
    segments.push("+ Martial Arts");
  }

  if (action.hasBatteringRootsBonus) {
    segments.push("+ Battering Roots");
  }

  action.damageBonusEntries.forEach((entry) => {
    if (entry.value !== undefined) {
      segments.push(`${entry.label} ${formatSignedValue(entry.value)}`);
      return;
    }

    segments.push(`+ ${entry.label}`);
  });

  return segments.join(" | ");
}

function getRoundTrackerResourceLabel(resource: RoundTrackerResource): string {
  switch (resource) {
    case "bonusAction":
      return ACTION_TYPE.BONUS_ACTION;
    case "reaction":
      return ACTION_TYPE.REACTION;
    case "action":
    default:
      return ACTION_TYPE.ACTION;
  }
}

export function getRoundTrackerActionWarning(
  resource: RoundTrackerResource | null,
  roundTracker: {
    actionAvailable: boolean;
    bonusActionAvailable: boolean;
    reactionAvailable: boolean;
  }
): string | null {
  if (!resource || isRoundTrackerResourceAvailable(roundTracker, resource)) {
    return null;
  }

  return `You already used the ${getRoundTrackerResourceLabel(resource)} for this turn`;
}

export function getActionShapeForEconomyType(economyType: EconomyType): ActionShapeType | null {
  switch (economyType) {
    case "action":
      return "action";
    case "bonus_action":
      return "bonusAction";
    case "reaction":
      return "reaction";
    case "non_combat":
      return "nonCombat";
    case "free":
    default:
      return null;
  }
}

export function getEconomyShapeState(
  economyType: EconomyType,
  roundTracker: {
    actionAvailable: boolean;
    bonusActionAvailable: boolean;
    reactionAvailable: boolean;
  },
  multiCount = 0
): {
  isAvailable: boolean;
  multiCount: number;
  isUsable: boolean;
  disabledReason: string | null;
} {
  const disabledReason = getRoundTrackerActionWarning(
    getRoundTrackerResourceForEconomyType(economyType),
    roundTracker
  );
  const isAvailable = disabledReason === null;
  const resolvedMultiCount = !isAvailable ? Math.max(0, Math.floor(multiCount)) : 0;
  const isUsable = isAvailable || resolvedMultiCount > 0;

  return {
    isAvailable,
    multiCount: resolvedMultiCount,
    isUsable,
    disabledReason: resolvedMultiCount > 0 ? null : disabledReason
  };
}

export function getRoundTrackerResourceMeta(
  resource: RoundTrackerResource,
  isAvailable: boolean
): {
  title: string;
  description: string;
} {
  if (resource === "action") {
    return {
      title: "Action",
      description: isAvailable
        ? "Your main action is ready for this round. Weapon attacks and most spells will spend it automatically."
        : "Your main action has already been spent this round. Reset it here if you need to correct the tracker manually."
    };
  }

  if (resource === "reaction") {
    return {
      title: "Reaction",
      description: isAvailable
        ? "Your reaction is ready for this round. Reaction spells and similar responses will spend it automatically."
        : "Your reaction has already been spent this round. Reset it here if you need to correct the tracker manually."
    };
  }

  return {
    title: "Bonus Action",
    description: isAvailable
      ? "Your bonus action is ready for this round. Bonus-action spells and similar abilities will spend it automatically."
      : "Your bonus action has already been spent this round. Reset it here if you need to correct the tracker manually."
  };
}
