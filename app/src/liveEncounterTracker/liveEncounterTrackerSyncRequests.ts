export const LIVE_ENCOUNTER_TRACKER_SYNC_REQUEST_EVENT =
  "arcane-ledger:live-encounter-tracker-sync-requested";

export function requestImmediateLiveEncounterTrackerSync() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(LIVE_ENCOUNTER_TRACKER_SYNC_REQUEST_EVENT));
}
