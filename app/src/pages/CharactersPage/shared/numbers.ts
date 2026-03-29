export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, parsedValue));
}

export function clampInteger(value: unknown, min: number, max: number, fallback: number): number {
  return Math.floor(clampNumber(value, min, max, fallback));
}

export function formatSignedLabel(value: number, label: string): string {
  return `${value >= 0 ? "+" : "-"} ${Math.abs(value)} ${label}`;
}
