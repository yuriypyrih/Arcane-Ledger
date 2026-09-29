export type OrderedAbilityBonus = { value: number; maxScore?: number | null; order?: number };

/** Pure arithmetic: callers choose their own bonus sources to avoid recursive derivation. */
export function getAppliedAbilityScoreBonus(
  currentScore: number,
  bonus: OrderedAbilityBonus
): number {
  const value = Math.floor(bonus.value);
  if (!Number.isFinite(value) || value === 0) return 0;
  return bonus.maxScore != null && value > 0
    ? Math.max(0, Math.min(value, bonus.maxScore - currentScore))
    : value;
}

export function compareAbilityScoreBonusOrder(
  left: OrderedAbilityBonus,
  right: OrderedAbilityBonus
): number {
  const leftCapped = left.maxScore != null;
  const rightCapped = right.maxScore != null;
  if (leftCapped !== rightCapped) return leftCapped ? -1 : 1;
  if (leftCapped && rightCapped && left.maxScore !== right.maxScore) {
    return left.maxScore! - right.maxScore!;
  }
  return (left.order ?? 0) - (right.order ?? 0);
}

export function compareLabeledAbilityScoreBonuses(
  left: OrderedAbilityBonus & { label: string },
  right: OrderedAbilityBonus & { label: string }
): number {
  const order = compareAbilityScoreBonusOrder(left, right);
  return order !== 0 ? order : left.label.localeCompare(right.label);
}
