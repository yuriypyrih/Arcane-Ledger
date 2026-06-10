import { AlertTriangle, CircleCheck, RefreshCw, ScrollText, Swords, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCampaign,
  removeCampaignLiveEncounterTracker,
  type CampaignLiveEncounterTrackerParticipantRecord,
  type CampaignLiveEncounterTrackerRecord
} from "../../api/campaigns";
import {
  clearLiveEncounterTrackerSaveStatus,
  patchSelectedCampaign,
  setLiveEncounterTrackerSaveStatus,
  setSelectedCampaign,
  setSelectedCampaignError,
  setSelectedCampaignLoading,
  useAppDispatch,
  useAppSelector
} from "../../store";
import ActionButton from "../../components/ActionButton";
import CampaignLiveEncounterTrackerBoard from "./CampaignLiveEncounterTrackerBoard";
import CampaignLiveEncounterTrackerInspectionDrawer from "./CampaignLiveEncounterTrackerInspectionDrawer";
import CampaignLiveEncounterRoundTracker from "./CampaignLiveEncounterRoundTracker";
import liveEncounterStyles from "./CampaignLiveEncounterTrackerPage.module.css";
import DmToolsBackButton from "./DmToolsBackButton";
import DmToolsEmptyState from "./DmToolsEmptyState";
import DmToolsListCard from "./DmToolsListCard";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import styles from "./DmToolsPage.module.css";
import {
  normalizeLiveEncounterTracker,
  withLiveEncounterTrackerRevision
} from "./liveEncounterTrackerUtils";
import { useLiveEncounterTrackerPersistence } from "./useLiveEncounterTrackerPersistence";

const trackerRefreshCooldownMs = 5_000;

function CampaignLiveEncounterTrackerPage() {
  const { campaignId = "" } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const campaign = useAppSelector((state) => state.dmTools.selectedCampaignsById[campaignId]);
  const status = useAppSelector(
    (state) => state.dmTools.selectedCampaignStatusById[campaignId] ?? "idle"
  );
  const error = useAppSelector(
    (state) => state.dmTools.selectedCampaignErrorById[campaignId] ?? null
  );
  const saveStatus = useAppSelector(
    (state) => state.dmTools.liveEncounterTrackerSaveStatusByCampaignId[campaignId] ?? "synced"
  );
  const saveError = useAppSelector(
    (state) => state.dmTools.liveEncounterTrackerSaveErrorByCampaignId[campaignId] ?? null
  );
  const [draftTracker, setDraftTracker] = useState<CampaignLiveEncounterTrackerRecord | null>(null);
  const [inspectedParticipant, setInspectedParticipant] =
    useState<CampaignLiveEncounterTrackerParticipantRecord | null>(null);
  const [isRemovingTracker, setIsRemovingTracker] = useState(false);
  const [isRefreshingTracker, setIsRefreshingTracker] = useState(false);
  const [isTrackerRefreshCoolingDown, setIsTrackerRefreshCoolingDown] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const trackerRefreshCooldownRef = useRef<number | null>(null);

  const clearTrackerRefreshCooldown = useCallback(() => {
    if (trackerRefreshCooldownRef.current === null) {
      return;
    }

    window.clearTimeout(trackerRefreshCooldownRef.current);
    trackerRefreshCooldownRef.current = null;
  }, []);

  const startTrackerRefreshCooldown = useCallback(() => {
    clearTrackerRefreshCooldown();
    setIsTrackerRefreshCoolingDown(true);

    trackerRefreshCooldownRef.current = window.setTimeout(() => {
      trackerRefreshCooldownRef.current = null;
      setIsTrackerRefreshCoolingDown(false);
    }, trackerRefreshCooldownMs);
  }, [clearTrackerRefreshCooldown]);

  useEffect(() => {
    let didCancel = false;

    if (!campaignId || authStatus !== "authenticated") {
      return () => {
        didCancel = true;
      };
    }

    dispatch(setSelectedCampaignLoading(campaignId));

    void getCampaign(campaignId, { suppressFailureToast: true })
      .then(({ campaign: nextCampaign }) => {
        if (!didCancel) {
          dispatch(setSelectedCampaign(nextCampaign));
        }
      })
      .catch((loadError) => {
        if (!didCancel) {
          dispatch(
            setSelectedCampaignError({
              campaignId,
              error: getDmToolsApiErrorMessage(loadError, "Unable to load campaign.")
            })
          );
        }
      });

    return () => {
      didCancel = true;
    };
  }, [authStatus, campaignId, dispatch]);

  const handleSavedTracker = useCallback(
    (savedTracker: CampaignLiveEncounterTrackerRecord, options: { hasPendingChanges: boolean }) => {
      const normalizedSavedTracker = normalizeLiveEncounterTracker(savedTracker);

      setDraftTracker((currentTracker) => {
        if (!options.hasPendingChanges || !currentTracker) {
          return normalizedSavedTracker;
        }

        return withLiveEncounterTrackerRevision(currentTracker, normalizedSavedTracker);
      });
    },
    []
  );

  const { flushPendingSave, queueSave } = useLiveEncounterTrackerPersistence({
    campaignId,
    onSavedTracker: handleSavedTracker
  });

  const serverTracker = useMemo(
    () =>
      campaign?.liveEncounterTracker
        ? normalizeLiveEncounterTracker(campaign.liveEncounterTracker)
        : null,
    [campaign?.liveEncounterTracker]
  );
  const tracker = draftTracker ?? serverTracker;
  const isTrackerValid = tracker?.status.state === "valid";

  useEffect(() => {
    return () => clearTrackerRefreshCooldown();
  }, [clearTrackerRefreshCooldown]);

  useEffect(() => {
    if (saveStatus === "dirty" || saveStatus === "saving") {
      return;
    }

    setDraftTracker(serverTracker?.status.state === "valid" ? serverTracker : null);
    setInspectedParticipant(null);
  }, [saveStatus, serverTracker]);

  useEffect(() => {
    if (!serverTracker || serverTracker.status.state !== "valid") {
      dispatch(
        setLiveEncounterTrackerSaveStatus({
          campaignId,
          status: "synced"
        })
      );
    }
  }, [campaignId, dispatch, serverTracker]);

  async function handleRemoveTracker() {
    if (isRemovingTracker) {
      return;
    }

    setActionError(null);
    setIsRemovingTracker(true);

    try {
      const campaignPatch = await removeCampaignLiveEncounterTracker(campaignId, {
        suppressFailureToast: true
      });

      dispatch(patchSelectedCampaign(campaignPatch));
      dispatch(clearLiveEncounterTrackerSaveStatus(campaignId));
      navigate(`/gm-tools/campaign-manager/${campaignId}`);
    } catch (removeError) {
      setActionError(getDmToolsApiErrorMessage(removeError, "Unable to remove active encounter."));
    } finally {
      setIsRemovingTracker(false);
    }
  }

  async function handleRefreshTracker() {
    if (
      isRefreshingTracker ||
      isTrackerRefreshCoolingDown ||
      !campaignId ||
      authStatus !== "authenticated"
    ) {
      return;
    }

    setActionError(null);
    setIsRefreshingTracker(true);

    try {
      if (saveStatus === "dirty" || saveStatus === "saving") {
        const savedTracker = await flushPendingSave();

        if (savedTracker) {
          setInspectedParticipant(null);
          startTrackerRefreshCooldown();
        }

        return;
      }

      const { campaign: nextCampaign } = await getCampaign(campaignId, {
        suppressFailureToast: true
      });
      const nextTracker = nextCampaign.liveEncounterTracker
        ? normalizeLiveEncounterTracker(nextCampaign.liveEncounterTracker)
        : null;

      dispatch(setSelectedCampaign(nextCampaign));
      setDraftTracker(nextTracker?.status.state === "valid" ? nextTracker : null);
      setInspectedParticipant(null);
      startTrackerRefreshCooldown();
    } catch (refreshError) {
      setActionError(
        getDmToolsApiErrorMessage(refreshError, "Unable to refresh encounter tracker.")
      );
    } finally {
      setIsRefreshingTracker(false);
    }
  }

  function handleTrackerChange(nextTracker: CampaignLiveEncounterTrackerRecord) {
    setDraftTracker(nextTracker);
    queueSave(nextTracker);
  }

  return (
    <section className={`${styles.page} ${liveEncounterStyles.page}`}>
      <DmToolsBackButton onClick={() => navigate(`/gm-tools/campaign-manager/${campaignId}`)}>
        Back to Campaign
      </DmToolsBackButton>

      <section className={styles.panel} aria-labelledby="live-encounter-title">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              <Swords size={15} aria-hidden="true" />
              <span>Live Encounter</span>
            </p>
            <h2 id="live-encounter-title" className={styles.title}>
              {tracker?.preparedEncounterName ?? "Encounter Tracker"}
            </h2>
          </div>
          <div className={styles.headerActions}>
            <ActionButton
              actionType={isTrackerRefreshCoolingDown ? "SUCCESS" : "INFO"}
              variant="FILL"
              fullWidth={false}
              icon={
                isTrackerRefreshCoolingDown ? (
                  <CircleCheck size={16} aria-hidden="true" />
                ) : (
                  <RefreshCw size={16} aria-hidden="true" />
                )
              }
              loading={isRefreshingTracker}
              loadingLabel="Refreshing encounter tracker"
              disabled={
                isRefreshingTracker ||
                isTrackerRefreshCoolingDown ||
                !campaignId ||
                authStatus !== "authenticated"
              }
              onClick={() => {
                void handleRefreshTracker();
              }}
            >
              {isTrackerRefreshCoolingDown ? "Refreshed" : "Refresh"}
            </ActionButton>
          </div>
        </div>

        {actionError ? <p className={styles.modalError}>{actionError}</p> : null}

        {authStatus !== "authenticated" ? (
          <DmToolsEmptyState icon={<ScrollText size={18} aria-hidden="true" />}>
            Sign in to view this encounter tracker.
          </DmToolsEmptyState>
        ) : status === "loading" ? (
          <DmToolsEmptyState icon={<ScrollText size={18} aria-hidden="true" />}>
            Loading encounter tracker...
          </DmToolsEmptyState>
        ) : error ? (
          <p className={styles.modalError}>{error}</p>
        ) : !tracker ? (
          <DmToolsEmptyState icon={<Swords size={18} aria-hidden="true" />}>
            There is no active encounter tracker.
          </DmToolsEmptyState>
        ) : !isTrackerValid ? (
          <DmToolsListCard
            icon={<AlertTriangle size={18} aria-hidden="true" />}
            title="ENCOUNTER TRACKER INVALID"
            meta={tracker.status.state === "invalid" ? tracker.status.message : undefined}
            tone="danger"
            actions={[
              {
                icon: <X size={18} aria-hidden="true" />,
                label: "Remove active encounter",
                onClick: () => {
                  void handleRemoveTracker();
                },
                title: isRemovingTracker ? "Removing..." : "Remove active encounter",
                disabled: isRemovingTracker
              }
            ]}
          />
        ) : (
          <>
            {saveStatus === "error" && saveError ? (
              <p className={styles.modalError}>{saveError}</p>
            ) : null}
            <CampaignLiveEncounterTrackerBoard
              tracker={tracker}
              onChange={handleTrackerChange}
              onInspectParticipant={setInspectedParticipant}
            />
            <CampaignLiveEncounterRoundTracker tracker={tracker} onChange={handleTrackerChange} />
            {inspectedParticipant ? (
              <CampaignLiveEncounterTrackerInspectionDrawer
                participant={inspectedParticipant}
                onClose={() => setInspectedParticipant(null)}
              />
            ) : null}
          </>
        )}
      </section>
    </section>
  );
}

export default CampaignLiveEncounterTrackerPage;
