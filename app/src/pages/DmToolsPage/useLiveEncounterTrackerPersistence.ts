import { useCallback, useEffect, useRef } from "react";
import {
  updateCampaignLiveEncounterTracker,
  type CampaignLiveEncounterTrackerRecord
} from "../../api/campaigns";
import { LIVE_ENCOUNTER_TRACKER_SYNC_REQUEST_EVENT } from "../../liveEncounterTracker/liveEncounterTrackerSyncRequests";
import {
  clearLiveEncounterTrackerSaveStatus,
  patchSelectedCampaign,
  setLiveEncounterTrackerSaveStatus,
  useAppDispatch
} from "../../store";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import {
  toLiveEncounterTrackerUpdateInput,
  withLiveEncounterTrackerRevision
} from "./liveEncounterTrackerUtils";

const liveEncounterTrackerSaveDebounceMs = 20_000;

type LiveEncounterTrackerSaveResult = {
  hasPendingChanges: boolean;
  savedTracker: CampaignLiveEncounterTrackerRecord | null;
};

type UseLiveEncounterTrackerPersistenceOptions = {
  campaignId: string;
  onSavedTracker: (
    savedTracker: CampaignLiveEncounterTrackerRecord,
    options: { hasPendingChanges: boolean }
  ) => void;
};

export function useLiveEncounterTrackerPersistence({
  campaignId,
  onSavedTracker
}: UseLiveEncounterTrackerPersistenceOptions) {
  const dispatch = useAppDispatch();
  const saveTimeoutRef = useRef<number | null>(null);
  const pendingTrackerRef = useRef<CampaignLiveEncounterTrackerRecord | null>(null);
  const savePromiseRef = useRef<Promise<LiveEncounterTrackerSaveResult> | null>(null);

  const clearSaveTimeout = useCallback(() => {
    if (saveTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = null;
  }, []);

  const flushPendingSave =
    useCallback(async (): Promise<CampaignLiveEncounterTrackerRecord | null> => {
      clearSaveTimeout();

      let latestSavedTracker: CampaignLiveEncounterTrackerRecord | null = null;

      while (true) {
        if (savePromiseRef.current) {
          const result = await savePromiseRef.current;

          if (result.savedTracker) {
            latestSavedTracker = result.savedTracker;
          }

          clearSaveTimeout();

          if (!result.hasPendingChanges || !pendingTrackerRef.current) {
            return latestSavedTracker;
          }

          continue;
        }

        const pendingTracker = pendingTrackerRef.current;

        if (!pendingTracker) {
          return latestSavedTracker;
        }

        const savePromise = (async (): Promise<LiveEncounterTrackerSaveResult> => {
          pendingTrackerRef.current = null;
          dispatch(
            setLiveEncounterTrackerSaveStatus({
              campaignId,
              status: "saving"
            })
          );

          try {
            const campaignPatch = await updateCampaignLiveEncounterTracker(
              campaignId,
              toLiveEncounterTrackerUpdateInput(pendingTracker),
              { suppressFailureToast: true }
            );
            const savedTracker = campaignPatch.patch.liveEncounterTracker;

            dispatch(patchSelectedCampaign(campaignPatch));

            if (savedTracker?.status.state === "valid") {
              const hasPendingChanges = Boolean(pendingTrackerRef.current);

              if (pendingTrackerRef.current) {
                pendingTrackerRef.current = withLiveEncounterTrackerRevision(
                  pendingTrackerRef.current,
                  savedTracker
                );
              }

              onSavedTracker(savedTracker, { hasPendingChanges });

              dispatch(
                setLiveEncounterTrackerSaveStatus({
                  campaignId,
                  status: hasPendingChanges ? "dirty" : "synced"
                })
              );

              if (hasPendingChanges) {
                saveTimeoutRef.current = window.setTimeout(() => {
                  saveTimeoutRef.current = null;
                  void flushPendingSave();
                }, liveEncounterTrackerSaveDebounceMs);
              }

              return { hasPendingChanges, savedTracker };
            }

            dispatch(
              setLiveEncounterTrackerSaveStatus({
                campaignId,
                status: "synced"
              })
            );

            return { hasPendingChanges: false, savedTracker: null };
          } catch (saveError) {
            pendingTrackerRef.current = pendingTracker;
            dispatch(
              setLiveEncounterTrackerSaveStatus({
                campaignId,
                error: getDmToolsApiErrorMessage(saveError, "Unable to save encounter tracker."),
                status: "error"
              })
            );

            return { hasPendingChanges: false, savedTracker: null };
          }
        })();

        savePromiseRef.current = savePromise;

        try {
          const result = await savePromise;

          if (result.savedTracker) {
            latestSavedTracker = result.savedTracker;
          }

          if (!result.hasPendingChanges || !pendingTrackerRef.current) {
            return latestSavedTracker;
          }
        } finally {
          if (savePromiseRef.current === savePromise) {
            savePromiseRef.current = null;
          }
        }
      }
    }, [campaignId, clearSaveTimeout, dispatch, onSavedTracker]);

  const queueSave = useCallback(
    (tracker: CampaignLiveEncounterTrackerRecord) => {
      pendingTrackerRef.current = tracker;
      clearSaveTimeout();
      dispatch(
        setLiveEncounterTrackerSaveStatus({
          campaignId,
          status: "dirty"
        })
      );

      saveTimeoutRef.current = window.setTimeout(() => {
        saveTimeoutRef.current = null;
        void flushPendingSave();
      }, liveEncounterTrackerSaveDebounceMs);
    },
    [campaignId, clearSaveTimeout, dispatch, flushPendingSave]
  );

  useEffect(() => {
    dispatch(
      setLiveEncounterTrackerSaveStatus({
        campaignId,
        status: "synced"
      })
    );

    return () => {
      void flushPendingSave();
      clearSaveTimeout();
      dispatch(clearLiveEncounterTrackerSaveStatus(campaignId));
    };
  }, [campaignId, clearSaveTimeout, dispatch, flushPendingSave]);

  useEffect(() => {
    function handleSyncRequest() {
      void flushPendingSave();
    }

    window.addEventListener(LIVE_ENCOUNTER_TRACKER_SYNC_REQUEST_EVENT, handleSyncRequest);

    return () => {
      window.removeEventListener(LIVE_ENCOUNTER_TRACKER_SYNC_REQUEST_EVENT, handleSyncRequest);
    };
  }, [flushPendingSave]);

  return {
    flushPendingSave,
    queueSave
  };
}
