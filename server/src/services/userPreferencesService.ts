import type {
  DiceRollerBehaviorPreference,
  ThemeModePreference,
  UserPreferences
} from "../types/preferences.js";
import type { UserDocument } from "../models/User.js";

export const defaultUserPreferences: UserPreferences = {
  diceRollerBehavior: "full_auto",
  broadLayout: false,
  themeMode: "light"
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeDiceRollerBehaviorPreference(value: unknown): DiceRollerBehaviorPreference {
  if (value === "full_manual" || value === "manual_with_roller" || value === "full_auto") {
    return value;
  }

  return defaultUserPreferences.diceRollerBehavior;
}

function normalizeThemeModePreference(value: unknown): ThemeModePreference {
  if (value === "light" || value === "dark") {
    return value;
  }

  return defaultUserPreferences.themeMode;
}

export function normalizeUserPreferences(value: unknown): UserPreferences {
  if (!isObjectRecord(value)) {
    return defaultUserPreferences;
  }

  return {
    diceRollerBehavior: normalizeDiceRollerBehaviorPreference(value.diceRollerBehavior),
    broadLayout: normalizeBoolean(value.broadLayout, defaultUserPreferences.broadLayout),
    themeMode: normalizeThemeModePreference(value.themeMode)
  };
}

export function mergeUserPreferences(
  currentPreferences: unknown,
  preferenceUpdates: unknown
): UserPreferences {
  if (!isObjectRecord(preferenceUpdates)) {
    return normalizeUserPreferences(currentPreferences);
  }

  return normalizeUserPreferences({
    ...normalizeUserPreferences(currentPreferences),
    ...preferenceUpdates
  });
}

function areUserPreferencesNormalized(value: unknown, preferences: UserPreferences): boolean {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    value.diceRollerBehavior === preferences.diceRollerBehavior &&
    value.broadLayout === preferences.broadLayout &&
    value.themeMode === preferences.themeMode
  );
}

export async function ensureUserPreferences(user: UserDocument): Promise<UserPreferences> {
  const preferences = normalizeUserPreferences(user.preferences);

  if (!areUserPreferencesNormalized(user.preferences, preferences)) {
    user.preferences = preferences;
    await user.save({ validateModifiedOnly: true });
  }

  return preferences;
}
