import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerRecord
} from "../../../../api/campaigns";
import {
  getPartyGroupLiveEncounter,
  type PartyMembershipRecord
} from "../../../../api/partyGroups";
import { getDmToolsApiErrorMessage } from "../../../../pages/DmToolsPage/dmToolsApiErrors";
import { normalizeLiveEncounterTracker } from "../../../../pages/DmToolsPage/liveEncounterTrackerUtils";

const refreshCooldownMs = 5_000;

type GameplayPartyEncounterStatus = "idle" | "loading" | "ready" | "error";

type UseGameplayPartyEncounterOptions = {
  beforeRefresh?: () => Promise<void> | void;
  isActive: boolean;
  membership?: PartyMembershipRecord;
};

function useGameplayPartyEncounter({
  beforeRefresh,
  isActive,
  membership
}: UseGameplayPartyEncounterOptions) {
  const partyGroupId = membership?.partyGroupId ?? null;
  const [tracker, setTracker] = useState<CampaignLiveEncounterTrackerRecord | null>(null);
  const [status, setStatus] = useState<GameplayPartyEncounterStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isRefreshCoolingDown, setIsRefreshCoolingDown] = useState(false);
  const [inspectedParticipant, setInspectedParticipant] =
    useState<CampaignLiveEncounterTrackerParticipantRecord | null>(null);
  const loadedPartyGroupIdRef = useRef<string | null>(null);
  const refreshCooldownRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);

  const clearRefreshCooldown = useCallback(() => {
    if (refreshCooldownRef.current === null) {
      return;
    }

    window.clearTimeout(refreshCooldownRef.current);
    refreshCooldownRef.current = null;
  }, []);

  const startRefreshCooldown = useCallback(() => {
    clearRefreshCooldown();
    setIsRefreshCoolingDown(true);

    refreshCooldownRef.current = window.setTimeout(() => {
      refreshCooldownRef.current = null;
      setIsRefreshCoolingDown(false);
    }, refreshCooldownMs);
  }, [clearRefreshCooldown]);

  const loadLiveEncounter = useCallback(
    async (options: { markRefreshed?: boolean } = {}) => {
      if (!partyGroupId) {
        return;
      }

      const requestId = requestIdRef.current + 1;

      requestIdRef.current = requestId;
      setStatus("loading");
      setError(null);

      try {
        const { liveEncounterTracker } = await getPartyGroupLiveEncounter(partyGroupId, {
          suppressFailureToast: true
        });

        if (requestIdRef.current !== requestId) {
          return;
        }

        setTracker(
          liveEncounterTracker ? normalizeLiveEncounterTracker(liveEncounterTracker) : null
        );
        setStatus("ready");

        if (options.markRefreshed) {
          startRefreshCooldown();
        }
      } catch (loadError) {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setError(getDmToolsApiErrorMessage(loadError, "Unable to load active encounter."));
        setStatus("error");
      }
    },
    [partyGroupId, startRefreshCooldown]
  );

  useEffect(() => {
    return () => clearRefreshCooldown();
  }, [clearRefreshCooldown]);

  useEffect(() => {
    if (!partyGroupId) {
      requestIdRef.current += 1;
      loadedPartyGroupIdRef.current = null;
      setInspectedParticipant(null);
      clearRefreshCooldown();
      setIsRefreshCoolingDown(false);
      setTracker(null);
      setStatus("idle");
      setError(null);

      return;
    }

    if (!isActive) {
      setInspectedParticipant(null);
      return;
    }

    if (loadedPartyGroupIdRef.current === partyGroupId) {
      return;
    }

    loadedPartyGroupIdRef.current = partyGroupId;
    setTracker(null);
    void loadLiveEncounter();
  }, [clearRefreshCooldown, isActive, loadLiveEncounter, partyGroupId]);

  const isInitialLoading = status === "loading" && tracker === null;
  const isRefreshLoading = status === "loading";
  const isRefreshDisabled = isRefreshCoolingDown || isRefreshLoading || !partyGroupId;
  const refreshLabel = isRefreshCoolingDown ? "Refreshed" : "Refresh";
  const refreshEncounter = useCallback(async () => {
    if (isRefreshDisabled) {
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      await beforeRefresh?.();
    } catch (refreshError) {
      setError(
        getDmToolsApiErrorMessage(refreshError, "Unable to sync character before refreshing.")
      );
      setStatus("error");
      return;
    }

    void loadLiveEncounter({ markRefreshed: true });
  }, [beforeRefresh, isRefreshDisabled, loadLiveEncounter]);
  const setEncounterTracker = useCallback(
    (nextTracker: CampaignLiveEncounterTrackerRecord | null) => {
      loadedPartyGroupIdRef.current = partyGroupId;
      setInspectedParticipant(null);
      setTracker(nextTracker ? normalizeLiveEncounterTracker(nextTracker) : null);
      setStatus("ready");
      setError(null);
    },
    [partyGroupId]
  );
  const invalidateEncounter = useCallback(() => {
    loadedPartyGroupIdRef.current = null;
    setInspectedParticipant(null);

    if (!partyGroupId) {
      requestIdRef.current += 1;
      setTracker(null);
      setStatus("idle");
      setError(null);
      return;
    }

    if (!isActive) {
      requestIdRef.current += 1;
      setTracker(null);
      setStatus("idle");
      setError(null);
      return;
    }

    loadedPartyGroupIdRef.current = partyGroupId;
    setTracker(null);
    void loadLiveEncounter();
  }, [isActive, loadLiveEncounter, partyGroupId]);

  return {
    error,
    invalidateEncounter,
    inspectedParticipant,
    isInitialLoading,
    isRefreshCoolingDown,
    isRefreshDisabled,
    isRefreshLoading,
    refreshEncounter,
    refreshLabel,
    setEncounterTracker,
    setInspectedParticipant,
    tracker
  };
}

export default useGameplayPartyEncounter;
