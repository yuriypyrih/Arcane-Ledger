import { normalizeTemporaryHitPointsSource } from "./temporaryHitPoints";
import { clampNumber } from "./numbers";

export type MagicTemporaryHitPointsAssignment = {
  magicTemporaryHitPoints: number;
  magicTemporaryHitPointsSource?: string;
};

export function normalizeMagicTemporaryHitPoints(value: unknown): number {
  return Math.floor(clampNumber(value, 0, 999, 0));
}

export function normalizeMagicTemporaryHitPointsSource(value: unknown): string | undefined {
  return normalizeTemporaryHitPointsSource(value);
}

export function createMagicTemporaryHitPointsAssignment(
  value: unknown,
  source?: unknown
): MagicTemporaryHitPointsAssignment {
  const magicTemporaryHitPoints = normalizeMagicTemporaryHitPoints(value);

  if (magicTemporaryHitPoints <= 0) {
    return {
      magicTemporaryHitPoints: 0,
      magicTemporaryHitPointsSource: undefined
    };
  }

  return {
    magicTemporaryHitPoints,
    magicTemporaryHitPointsSource: normalizeMagicTemporaryHitPointsSource(source)
  };
}

export function gainMagicTemporaryHitPointsAssignment(
  currentValue: unknown,
  grantedValue: unknown,
  maximumValue: unknown,
  source?: unknown
): MagicTemporaryHitPointsAssignment {
  const currentMagicTemporaryHitPoints = normalizeMagicTemporaryHitPoints(currentValue);
  const grantedMagicTemporaryHitPoints = normalizeMagicTemporaryHitPoints(grantedValue);
  const maximumMagicTemporaryHitPoints = normalizeMagicTemporaryHitPoints(maximumValue);

  if (maximumMagicTemporaryHitPoints <= 0) {
    return createMagicTemporaryHitPointsAssignment(0);
  }

  return createMagicTemporaryHitPointsAssignment(
    Math.min(
      maximumMagicTemporaryHitPoints,
      currentMagicTemporaryHitPoints + grantedMagicTemporaryHitPoints
    ),
    source
  );
}
