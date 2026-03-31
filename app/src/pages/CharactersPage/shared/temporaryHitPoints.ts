import { clampNumber } from "./numbers";

export const MANUAL_TEMPORARY_HIT_POINTS_SOURCE = "Manual";

export type TemporaryHitPointsAssignment = {
  temporaryHitPoints: number;
  temporaryHitPointsSource?: string;
};

export function normalizeTemporaryHitPoints(value: unknown): number {
  return Math.floor(clampNumber(value, 0, 999, 0));
}

export function normalizeTemporaryHitPointsSource(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

export function createTemporaryHitPointsAssignment(
  value: unknown,
  source?: unknown
): TemporaryHitPointsAssignment {
  const temporaryHitPoints = normalizeTemporaryHitPoints(value);

  if (temporaryHitPoints <= 0) {
    return {
      temporaryHitPoints: 0,
      temporaryHitPointsSource: undefined
    };
  }

  return {
    temporaryHitPoints,
    temporaryHitPointsSource: normalizeTemporaryHitPointsSource(source)
  };
}

export function swapTemporaryHitPoints(currentValue: unknown, grantedValue: unknown): number {
  return Math.max(
    normalizeTemporaryHitPoints(currentValue),
    normalizeTemporaryHitPoints(grantedValue)
  );
}

export function swapTemporaryHitPointsAssignment(
  currentValue: unknown,
  currentSource: unknown,
  grantedValue: unknown,
  grantedSource?: unknown
): TemporaryHitPointsAssignment {
  const normalizedCurrentValue = normalizeTemporaryHitPoints(currentValue);
  const normalizedGrantedValue = normalizeTemporaryHitPoints(grantedValue);

  if (normalizedGrantedValue > normalizedCurrentValue) {
    return createTemporaryHitPointsAssignment(normalizedGrantedValue, grantedSource);
  }

  return createTemporaryHitPointsAssignment(normalizedCurrentValue, currentSource);
}
