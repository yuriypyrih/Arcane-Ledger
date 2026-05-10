import { isObjectRecord, normalizeBoolean } from "../utils/normalize";

export type StatsViewMode = "tabs" | "full";
export type MaxHitPointsModePreference = "automatic" | "custom";
export type DiceRollerBehaviorPreference = "full_manual" | "manual_with_roller" | "full_auto";

export type Preferences = {
  statsViewMode: StatsViewMode;
  skillsProficienciesVisible: boolean;
  defaultMaxHitPointsMode: MaxHitPointsModePreference;
  diceRollerBehavior: DiceRollerBehaviorPreference;
  broadLayout: boolean;
};

const PREFERENCES_STORAGE_KEY = "arcane-ledger.preferences";
const LEGACY_PREFERENCES_STORAGE_KEY = "dnd-companion.preferences";

const defaultPreferences: Preferences = {
  statsViewMode: "tabs",
  skillsProficienciesVisible: true,
  defaultMaxHitPointsMode: "automatic",
  diceRollerBehavior: "manual_with_roller",
  broadLayout: false
};

function normalizeStatsViewMode(value: unknown): StatsViewMode {
  return value === "full" ? "full" : "tabs";
}

function normalizeMaxHitPointsModePreference(value: unknown): MaxHitPointsModePreference {
  return value === "custom" ? "custom" : "automatic";
}

function normalizeDiceRollerBehaviorPreference(value: unknown): DiceRollerBehaviorPreference {
  if (value === "full_manual" || value === "full_auto") {
    return value;
  }

  return "manual_with_roller";
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
    defaultMaxHitPointsMode: normalizeMaxHitPointsModePreference(record.defaultMaxHitPointsMode),
    diceRollerBehavior: normalizeDiceRollerBehaviorPreference(record.diceRollerBehavior),
    broadLayout: normalizeBoolean(record.broadLayout, defaultPreferences.broadLayout)
  };
}

export function loadPreferences(): Preferences {
  if (typeof window === "undefined") {
    return defaultPreferences;
  }

  const serializedPreferences = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
  const legacySerializedPreferences =
    serializedPreferences === null
      ? window.localStorage.getItem(LEGACY_PREFERENCES_STORAGE_KEY)
      : null;
  const storedPreferencesSource = serializedPreferences ?? legacySerializedPreferences;

  if (!storedPreferencesSource) {
    return defaultPreferences;
  }

  try {
    const parsedPreferences = JSON.parse(storedPreferencesSource) as unknown;
    const normalizedPreferences = normalizePreferences(parsedPreferences);
    const normalizedSerializedPreferences = JSON.stringify(normalizedPreferences);

    if (
      serializedPreferences === null ||
      normalizedSerializedPreferences !== serializedPreferences
    ) {
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

export function getDiceRollerBehaviorPreference(): DiceRollerBehaviorPreference {
  return loadPreferences().diceRollerBehavior;
}

export function updateDiceRollerBehaviorPreference(
  diceRollerBehavior: DiceRollerBehaviorPreference
): Preferences {
  return updatePreferences({
    diceRollerBehavior
  });
}

export function getBroadLayoutPreference(): boolean {
  return loadPreferences().broadLayout;
}

export function updateBroadLayoutPreference(broadLayout: boolean): Preferences {
  return updatePreferences({
    broadLayout
  });
}
