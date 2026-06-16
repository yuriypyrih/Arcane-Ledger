import { isObjectRecord, normalizeBoolean } from "../utils/normalize";
import type {
  DiceRollerBehaviorPreference,
  Preferences,
  ThemeModePreference
} from "../types/preferences";

export type {
  DiceRollerBehaviorPreference,
  Preferences,
  ThemeModePreference
} from "../types/preferences";

const PREFERENCES_STORAGE_KEY = "arcane-ledger.preferences";
export const PREFERENCES_CHANGED_EVENT = "arcane-ledger:preferences-changed";
const THEME_MODE_ATTRIBUTE = "data-theme";

const defaultPreferences: Preferences = {
  diceRollerBehavior: "full_auto",
  broadLayout: false,
  themeMode: "light"
};

type PreferenceRemoteSave = (preferences: Preferences) => Promise<void> | void;
type PreferenceRemoteSaveErrorHandler = (error: unknown) => void;

let remotePreferenceSave: PreferenceRemoteSave | null = null;
let remotePreferenceSaveErrorHandler: PreferenceRemoteSaveErrorHandler | null = null;
let remoteSaveInFlight = false;
let queuedRemotePreferences: Preferences | null = null;

function dispatchPreferencesChanged(preferences: Preferences) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(PREFERENCES_CHANGED_EVENT, {
      detail: {
        preferences
      }
    })
  );
}

async function flushQueuedRemotePreferences() {
  if (!remotePreferenceSave || remoteSaveInFlight || !queuedRemotePreferences) {
    return;
  }

  const preferences = queuedRemotePreferences;
  queuedRemotePreferences = null;
  remoteSaveInFlight = true;

  try {
    await remotePreferenceSave(preferences);
  } catch (error) {
    remotePreferenceSaveErrorHandler?.(error);
  } finally {
    remoteSaveInFlight = false;
  }

  if (queuedRemotePreferences) {
    void flushQueuedRemotePreferences();
  }
}

function queueRemotePreferencesSave(preferences: Preferences) {
  if (!remotePreferenceSave) {
    return;
  }

  queuedRemotePreferences = preferences;
  void flushQueuedRemotePreferences();
}

export function configureRemotePreferencesSave(
  save: PreferenceRemoteSave | null,
  onError?: PreferenceRemoteSaveErrorHandler
) {
  remotePreferenceSave = save;
  remotePreferenceSaveErrorHandler = onError ?? null;

  if (!save) {
    queuedRemotePreferences = null;
  }
}

function normalizeDiceRollerBehaviorPreference(value: unknown): DiceRollerBehaviorPreference {
  if (value === "full_manual" || value === "manual_with_roller" || value === "full_auto") {
    return value;
  }

  return defaultPreferences.diceRollerBehavior;
}

function normalizeThemeModePreference(value: unknown): ThemeModePreference {
  if (value === "light" || value === "dark") {
    return value;
  }

  return defaultPreferences.themeMode;
}

export function normalizePreferences(value: unknown): Preferences {
  if (!isObjectRecord(value)) {
    return defaultPreferences;
  }

  const record = value as Partial<Preferences>;

  return {
    diceRollerBehavior: normalizeDiceRollerBehaviorPreference(record.diceRollerBehavior),
    broadLayout: normalizeBoolean(record.broadLayout, defaultPreferences.broadLayout),
    themeMode: normalizeThemeModePreference(record.themeMode)
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

export function savePreferences(preferences: Preferences, options?: { syncRemote?: boolean }) {
  const normalizedPreferences = normalizePreferences(preferences);

  if (typeof window === "undefined") {
    if (options?.syncRemote !== false) {
      queueRemotePreferencesSave(normalizedPreferences);
    }
    return;
  }

  window.localStorage.setItem(
    PREFERENCES_STORAGE_KEY,
    JSON.stringify(normalizedPreferences)
  );
  dispatchPreferencesChanged(normalizedPreferences);

  if (options?.syncRemote !== false) {
    queueRemotePreferencesSave(normalizedPreferences);
  }
}

export function replaceLocalPreferences(preferences: Preferences): Preferences {
  const normalizedPreferences = normalizePreferences(preferences);

  savePreferences(normalizedPreferences, { syncRemote: false });
  return normalizedPreferences;
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

export function getThemeModePreference(): ThemeModePreference {
  return loadPreferences().themeMode;
}

export function applyThemeModePreferenceToDocument(themeMode?: unknown) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute(
    THEME_MODE_ATTRIBUTE,
    normalizeThemeModePreference(themeMode ?? getThemeModePreference())
  );
}

export function updateThemeModePreference(themeMode: ThemeModePreference): Preferences {
  return updatePreferences({
    themeMode
  });
}
