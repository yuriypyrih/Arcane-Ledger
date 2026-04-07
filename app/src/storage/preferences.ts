import { isObjectRecord, normalizeBoolean } from "../utils/normalize";

export type StatsViewMode = "tabs" | "full";
export type MaxHitPointsModePreference = "automatic" | "custom";

export type Preferences = {
  statsViewMode: StatsViewMode;
  skillsProficienciesVisible: boolean;
  defaultMaxHitPointsMode: MaxHitPointsModePreference;
};

const PREFERENCES_STORAGE_KEY = "dnd-companion.preferences";

const defaultPreferences: Preferences = {
  statsViewMode: "tabs",
  skillsProficienciesVisible: true,
  defaultMaxHitPointsMode: "automatic"
};

function normalizeStatsViewMode(value: unknown): StatsViewMode {
  return value === "full" ? "full" : "tabs";
}

function normalizeMaxHitPointsModePreference(value: unknown): MaxHitPointsModePreference {
  return value === "custom" ? "custom" : "automatic";
}

function normalizePreferences(value: unknown): Preferences {
  if (!isObjectRecord(value)) {
    return defaultPreferences;
  }

  const record = value as Partial<Preferences>;

  return {
    statsViewMode: normalizeStatsViewMode(record.statsViewMode),
    skillsProficienciesVisible: normalizeBoolean(
      record.skillsProficienciesVisible,
      defaultPreferences.skillsProficienciesVisible
    ),
    defaultMaxHitPointsMode: normalizeMaxHitPointsModePreference(
      record.defaultMaxHitPointsMode
    )
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
    const normalizedPreferences = normalizePreferences(parsedPreferences);
    const normalizedSerializedPreferences = JSON.stringify(normalizedPreferences);

    if (normalizedSerializedPreferences !== serializedPreferences) {
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, normalizedSerializedPreferences);
    }

    return normalizedPreferences;
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
