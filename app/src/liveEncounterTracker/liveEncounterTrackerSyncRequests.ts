export const LIVE_ENCOUNTER_TRACKER_SYNC_REQUEST_EVENT =
  "arcane-ledger:live-encounter-tracker-sync-requested";
export const LIVE_ENCOUNTER_TRACKER_SYNC_COMPLETE_EVENT =
  "arcane-ledger:live-encounter-tracker-sync-completed";

const liveEncounterTrackerSyncRequestTimeoutMs = 30_000;

export type LiveEncounterTrackerSyncRequestEventDetail = {
  requestId: string;
};

function createLiveEncounterTrackerSyncRequestId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function requestImmediateLiveEncounterTrackerSync(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  const requestId = createLiveEncounterTrackerSyncRequestId();

  return new Promise((resolve) => {
    let timeoutId: number | null = null;

    function finish() {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }

      window.removeEventListener(LIVE_ENCOUNTER_TRACKER_SYNC_COMPLETE_EVENT, handleSyncComplete);
      resolve();
    }

    function handleSyncComplete(event: Event) {
      const detail = (event as CustomEvent<LiveEncounterTrackerSyncRequestEventDetail>).detail;

      if (detail?.requestId !== requestId) {
        return;
      }

      finish();
    }

    timeoutId = window.setTimeout(finish, liveEncounterTrackerSyncRequestTimeoutMs);
    window.addEventListener(LIVE_ENCOUNTER_TRACKER_SYNC_COMPLETE_EVENT, handleSyncComplete);

    const wasHandled = !window.dispatchEvent(
      new CustomEvent<LiveEncounterTrackerSyncRequestEventDetail>(
        LIVE_ENCOUNTER_TRACKER_SYNC_REQUEST_EVENT,
        {
          cancelable: true,
          detail: { requestId }
        }
      )
    );

    if (!wasHandled) {
      finish();
    }
  });
}

export function dispatchLiveEncounterTrackerSyncRequestComplete(
  requestId: string | null | undefined
) {
  if (typeof window === "undefined" || !requestId) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<LiveEncounterTrackerSyncRequestEventDetail>(
      LIVE_ENCOUNTER_TRACKER_SYNC_COMPLETE_EVENT,
      {
        detail: { requestId }
      }
    )
  );
}
