export const renderProfilerStorageKey = "arcane-ledger:render-profiler";
export const renderProfilerSearchParam = "renderProfiler";

export type RenderProfilerDetails = Record<string, unknown>;

type RenderProfilerOptions = {
  defaultEnabled?: boolean;
};

const disabledProfilerValues = new Set(["0", "false", "off"]);
const enabledProfilerValues = new Set(["1", "true", "on"]);

export function roundTiming(value: number): number {
  return Math.round(value * 10) / 10;
}

function normalizeProfilerValue(value: string | null): string | null {
  return value?.trim().toLowerCase() ?? null;
}

function isDisabledProfilerValue(value: string | null): boolean {
  const normalizedValue = normalizeProfilerValue(value);
  return normalizedValue !== null && disabledProfilerValues.has(normalizedValue);
}

function isEnabledProfilerValue(value: string | null): boolean {
  const normalizedValue = normalizeProfilerValue(value);
  return normalizedValue !== null && enabledProfilerValues.has(normalizedValue);
}

export function isRenderProfilerEnabled(options: RenderProfilerOptions = {}): boolean {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return false;
  }

  try {
    const storedValue = window.localStorage.getItem(renderProfilerStorageKey);

    if (isDisabledProfilerValue(storedValue)) {
      return false;
    }

    if (isEnabledProfilerValue(storedValue)) {
      return true;
    }

    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.has(renderProfilerSearchParam)) {
      return !isDisabledProfilerValue(searchParams.get(renderProfilerSearchParam));
    }

    return options.defaultEnabled ?? false;
  } catch {
    return options.defaultEnabled ?? false;
  }
}
