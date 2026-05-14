import { isObjectRecord, normalizeBoolean } from "../utils/normalize";

export type DiceRollerBehaviorPreference = "full_manual" | "manual_with_roller" | "full_auto";

export type Preferences = {
  diceRollerBehavior: DiceRollerBehaviorPreference;
  broadLayout: boolean;
};

const PREFERENCES_STORAGE_KEY = "arcane-ledger.preferences";

const defaultPreferences: Preferences = {
  diceRollerBehavior: "full_auto",
  broadLayout: false
};

function normalizeDiceRollerBehaviorPreference(value: unknown): DiceRollerBehaviorPreference {
  if (value === "full_manual" || value === "manual_with_roller" || value === "full_auto") {
    return value;
  }

  return defaultPreferences.diceRollerBehavior;
}

function normalizePreferences(value: unknown): Preferences {
  if (!isObjectRecord(value)) {
    return defaultPreferences;
  }

  const record = value as Partial<Preferences>;

  return {
    diceRollerBehavior: normalizeDiceRollerBehaviorPreference(record.diceRollerBehavior),
    broadLayout: normalizeBoolean(record.broadLayout, defaultPreferences.broadLayout)
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
