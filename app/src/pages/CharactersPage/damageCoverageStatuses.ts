import { DAMAGE_TYPE } from "../../codex/entries";
import type { DamageCoverageStatusValue } from "../../types";
import { formatCodexLabel } from "../../utils/codex";

export const ALL_DAMAGE_STATUS_VALUE = "All damage" as const;

const allDamageButStatusValuePrefix = "All damage but ";

function createAllDamageButStatusValue(damageType: DAMAGE_TYPE): DamageCoverageStatusValue {
  return `${allDamageButStatusValuePrefix}${formatCodexLabel(
    damageType
  )}` as DamageCoverageStatusValue;
}

const damageCoverageStatusValues: DamageCoverageStatusValue[] = [
  ALL_DAMAGE_STATUS_VALUE,
  ...(Object.values(DAMAGE_TYPE) as DAMAGE_TYPE[]).map(createAllDamageButStatusValue)
];

const damageCoverageStatusValueSet = new Set<string>(damageCoverageStatusValues);

export function getDamageCoverageStatusOptions(): DamageCoverageStatusValue[] {
  return [...damageCoverageStatusValues];
}

export function getAllDamageButStatusValue(
  damageType: DAMAGE_TYPE
): DamageCoverageStatusValue {
  return createAllDamageButStatusValue(damageType);
}

export function normalizeDamageCoverageStatusValue(
  value: unknown
): DamageCoverageStatusValue | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return damageCoverageStatusValueSet.has(trimmedValue)
    ? (trimmedValue as DamageCoverageStatusValue)
    : null;
}

export function isDamageCoverageStatusValue(
  value: unknown
): value is DamageCoverageStatusValue {
  return normalizeDamageCoverageStatusValue(value) !== null;
}

export function formatDamageDefenseStatusValue(value: string): string {
  return normalizeDamageCoverageStatusValue(value) ?? formatCodexLabel(value);
}

export function formatCompactDamageDefenseStatusValue(value: string): string {
  const coverageValue = normalizeDamageCoverageStatusValue(value);

  if (!coverageValue) {
    return formatCodexLabel(value);
  }

  return coverageValue.startsWith(allDamageButStatusValuePrefix)
    ? `All but ${coverageValue.slice(allDamageButStatusValuePrefix.length)}`
    : coverageValue;
}

export function formatDamageDefenseOptionLabel(value: string): string {
  return normalizeDamageCoverageStatusValue(value) ?? `${formatCodexLabel(value)} damage`;
}

export function formatDamageDefenseDescriptionTarget(value: string): string {
  const coverageValue = normalizeDamageCoverageStatusValue(value);

  if (coverageValue === ALL_DAMAGE_STATUS_VALUE) {
    return "all damage";
  }

  if (coverageValue) {
    return `${coverageValue.toLowerCase()} damage`;
  }

  return `${formatCodexLabel(value).toLowerCase()} damage`;
}
