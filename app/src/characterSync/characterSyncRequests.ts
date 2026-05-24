export const CHARACTER_SYNC_REQUEST_EVENT = "arcane-ledger:character-sync-requested";

export function requestImmediateCharacterSync() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(CHARACTER_SYNC_REQUEST_EVENT));
}
