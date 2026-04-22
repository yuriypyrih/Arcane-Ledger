import type { WeaponAction } from "../../../../../pages/CharactersPage/gameplay";

export const criticalHitBreakdownLabel = "+ Critical Hit";

const diceTermPattern = /(\d+)d(\d+)(m\d+)?/gi;

function doubleDiceTermCounts(text: string): string {
  return text.replace(diceTermPattern, (_, count, sides, minimum) => {
    return `${Number(count) * 2}d${sides}${minimum ?? ""}`;
  });
}

export function applyCriticalHitToWeaponAction(action: WeaponAction): WeaponAction {
  return {
    ...action,
    damageFormula: doubleDiceTermCounts(action.damageFormula),
    damageLabel: doubleDiceTermCounts(action.damageLabel),
    damageBonusEntries: action.damageBonusEntries.map((entry) => ({
      ...entry,
      formula: entry.formula ? doubleDiceTermCounts(entry.formula) : entry.formula,
      displayLabel: entry.displayLabel ? doubleDiceTermCounts(entry.displayLabel) : entry.displayLabel
    }))
  };
}

export function appendCriticalHitToFormulaBreakdown(breakdown?: string): string {
  if (!breakdown || breakdown.trim().length === 0) {
    return `[= ${criticalHitBreakdownLabel}]`;
  }

  const trimmedBreakdown = breakdown.trim();

  if (trimmedBreakdown.includes(criticalHitBreakdownLabel)) {
    return trimmedBreakdown;
  }

  if (trimmedBreakdown.startsWith("[=") && trimmedBreakdown.endsWith("]")) {
    return `${trimmedBreakdown.slice(0, -1)} | ${criticalHitBreakdownLabel}]`;
  }

  return `${trimmedBreakdown} ${criticalHitBreakdownLabel}`;
}
