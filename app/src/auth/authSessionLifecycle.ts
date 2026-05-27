import { clearAuthSession, setActiveCharacterSheet, showToast, store } from "../store";
import { clearCharacterRosterCache } from "../pages/CharactersPage/characterRoster";
import { clearRawStoredCharacters } from "../pages/CharactersPage/portableCharacterSheetStorage";

const AUTH_SESSION_MARKER_KEY = "arcane-ledger:auth-session";
export const AUTH_SESSION_EXPIRED_EVENT = "arcane-ledger:auth-session-expired";

let sessionExpiryHandled = false;

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function markAuthSessionActive() {
  sessionExpiryHandled = false;

  try {
    getLocalStorage()?.setItem(AUTH_SESSION_MARKER_KEY, "1");
  } catch {
    // The marker is a convenience for browser cookie expiry detection.
  }
}

export function clearAuthSessionMarker() {
  try {
    getLocalStorage()?.removeItem(AUTH_SESSION_MARKER_KEY);
  } catch {
    // Local logout should continue even if storage is unavailable.
  }
}

export function hasAuthSessionMarker() {
  try {
    return getLocalStorage()?.getItem(AUTH_SESSION_MARKER_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearLocalAuthSession() {
  clearAuthSessionMarker();
  clearRawStoredCharacters();
  clearCharacterRosterCache();
  store.dispatch(
    setActiveCharacterSheet({
      character: null,
      characterId: null
    })
  );
  store.dispatch(clearAuthSession());
}

export function handleExpiredAuthSession() {
  if (sessionExpiryHandled) {
    return;
  }

  sessionExpiryHandled = true;
  clearLocalAuthSession();
  store.dispatch(
    showToast({
      text: "Session Expired",
      type: "error"
    })
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
  }
}
