export type StatsViewMode = "tabs" | "full";

export type Preferences = {
  statsViewMode: StatsViewMode;
};

const PREFERENCES_STORAGE_KEY = "dnd-companion.preferences";

const defaultPreferences: Preferences = {
  statsViewMode: "tabs"
};

function normalizeStatsViewMode(value: unknown): StatsViewMode {
  return value === "full" ? "full" : "tabs";
}

function normalizePreferences(value: unknown): Preferences {
  if (!value || typeof value !== "object") {
    return defaultPreferences;
  }

  const record = value as Partial<Preferences>;

  return {
    statsViewMode: normalizeStatsViewMode(record.statsViewMode)
  };
}

export function loadPreferences(): Preferences {
  if (typeof window === "undefined") {
    return defaultPreferences;
  }

  const serializedPreferences = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);

  if (!serializedPreferences) {
    return defaultPreferences;
  }

  try {
    const parsedPreferences = JSON.parse(serializedPreferences) as unknown;
    return normalizePreferences(parsedPreferences);
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(preferences: Preferences) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PREFERENCES_STORAGE_KEY,
    JSON.stringify(normalizePreferences(preferences))
  );
}

export function updatePreferences(partialPreferences: Partial<Preferences>): Preferences {
  const nextPreferences = {
    ...loadPreferences(),
    ...partialPreferences
  };

  const normalizedPreferences = normalizePreferences(nextPreferences);
  savePreferences(normalizedPreferences);
  return normalizedPreferences;
}
