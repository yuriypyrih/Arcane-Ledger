import {
  AlertTriangle,
  CircleCheck,
  Eye,
  EyeOff,
  RefreshCw,
  ScrollText,
  Swords,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCampaign,
  removeCampaignLiveEncounterTracker,
  upsertCampaignPreparedEncounterCreature,
  type CampaignLiveEncounterTrackerParticipantRecord,
  type CampaignLiveEncounterTrackerRecord
} from "../../api/campaigns";
import type { EncounterTemplateCreatureRecord } from "../../api/encounterTemplates";
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
import { createPlayerVisibleLiveEncounterTracker } from "./liveEncounterPlayerVisibility";
import { useLiveEncounterTrackerPersistence } from "./useLiveEncounterTrackerPersistence";

const trackerRefreshCooldownMs = 5_000;

function PlayerVisibilitySwitchVisual({ checked }: { checked: boolean }) {
  return (
    <span
      className={
        checked
          ? `${styles.visibilitySwitch} ${styles.visibilitySwitchActive}`
          : styles.visibilitySwitch
      }
      aria-hidden="true"
    >
      <span className={styles.visibilitySwitchTrack}>
        <span className={styles.visibilitySwitchThumb} />
      </span>
    </span>
  );
}

function findLiveEncounterParticipantById(
  tracker: CampaignLiveEncounterTrackerRecord | null,
  participantId: string | null
) {
  if (!tracker || !participantId || tracker.status.state !== "valid") {
    return null;
  }

  return (
    tracker.initiativeOrder.find((participant) => participant.participantId === participantId) ??
    tracker.partyMembers.find((participant) => participant.participantId === participantId) ??
    tracker.creatures.find((participant) => participant.participantId === participantId) ??
    null
  );
}

function createLiveEncounterParticipantLookup(tracker: CampaignLiveEncounterTrackerRecord) {
  return new Map(
    [...tracker.partyMembers, ...tracker.creatures, ...tracker.initiativeOrder].map(
      (participant) => [participant.participantId, participant]
    )
  );
}

function restoreLiveEncounterPartyMembers(
  participants: CampaignLiveEncounterTrackerParticipantRecord[],
  participantById: Map<string, CampaignLiveEncounterTrackerParticipantRecord>
) {
  return participants.flatMap((participant) => {
    const fullParticipant = participantById.get(participant.participantId);

    return fullParticipant?.kind === "party-member" ? [fullParticipant] : [];
  });
}

function restoreLiveEncounterCreatures(
  participants: CampaignLiveEncounterTrackerParticipantRecord[],
  participantById: Map<string, CampaignLiveEncounterTrackerParticipantRecord>
) {
  return participants.flatMap((participant) => {
    const fullParticipant = participantById.get(participant.participantId);

    return fullParticipant?.kind === "creature" ? [fullParticipant] : [];
  });
}

function restoreLiveEncounterParticipants(
  participants: CampaignLiveEncounterTrackerParticipantRecord[],
  participantById: Map<string, CampaignLiveEncounterTrackerParticipantRecord>
) {
  return participants.flatMap((participant) => {
    const fullParticipant = participantById.get(participant.participantId);

    return fullParticipant ? [fullParticipant] : [];
  });
}

function restoreFullLiveEncounterTrackerFromDisplayTracker(
  fullTracker: CampaignLiveEncounterTrackerRecord,
  displayTracker: CampaignLiveEncounterTrackerRecord
): CampaignLiveEncounterTrackerRecord {
  if (fullTracker.status.state !== "valid" || displayTracker.status.state !== "valid") {
    return fullTracker;
  }

  const participantById = createLiveEncounterParticipantLookup(fullTracker);

  return {
    ...fullTracker,
    activeParticipantId: displayTracker.activeParticipantId,
    roundNumber: displayTracker.roundNumber,
    partyMembers: restoreLiveEncounterPartyMembers(displayTracker.partyMembers, participantById),
    creatures: restoreLiveEncounterCreatures(displayTracker.creatures, participantById),
    initiativeOrder: restoreLiveEncounterParticipants(
      displayTracker.initiativeOrder,
      participantById
    )
  };
}

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
  const [inspectedParticipantId, setInspectedParticipantId] = useState<string | null>(null);
  const [isGmViewEnabled, setIsGmViewEnabled] = useState(true);
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
  const displayTracker = useMemo(
    () =>
      tracker && tracker.status.state === "valid" && !isGmViewEnabled
        ? createPlayerVisibleLiveEncounterTracker(tracker)
        : tracker,
    [isGmViewEnabled, tracker]
  );
  const inspectedParticipant = useMemo(
    () => findLiveEncounterParticipantById(displayTracker, inspectedParticipantId),
    [displayTracker, inspectedParticipantId]
  );

  useEffect(() => {
    return () => clearTrackerRefreshCooldown();
  }, [clearTrackerRefreshCooldown]);

  useEffect(() => {
    if (saveStatus === "dirty" || saveStatus === "saving") {
      return;
    }

    const nextTracker = serverTracker?.status.state === "valid" ? serverTracker : null;

    setDraftTracker(nextTracker);
    setInspectedParticipantId((currentParticipantId) =>
      findLiveEncounterParticipantById(nextTracker, currentParticipantId)
        ? currentParticipantId
        : null
    );
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
          setInspectedParticipantId(null);
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
      setInspectedParticipantId(null);
      startTrackerRefreshCooldown();
    } catch (refreshError) {
      setActionError(
        getDmToolsApiErrorMessage(refreshError, "Unable to refresh encounter tracker.")
      );
    } finally {
      setIsRefreshingTracker(false);
    }
  }

  async function handleEditPreparedEncounter() {
    if (!campaignId || !tracker || tracker.status.state !== "valid") {
      return;
    }

    setActionError(null);

    try {
      if (saveStatus === "dirty" || saveStatus === "saving") {
        await flushPendingSave();
      }

      navigate(
        `/gm-tools/campaign-manager/${campaignId}/encounters/${tracker.preparedEncounterId}?returnToLiveEncounter=1`
      );
    } catch (syncError) {
      setActionError(
        getDmToolsApiErrorMessage(syncError, "Unable to sync encounter before editing.")
      );
    }
  }

  async function handleUpdateInspectedCreature(
    creatureId: string,
    updateCreature: (creature: EncounterTemplateCreatureRecord) => EncounterTemplateCreatureRecord
  ) {
    if (
      !campaignId ||
      !campaign ||
      !tracker ||
      tracker.status.state !== "valid" ||
      !isGmViewEnabled
    ) {
      throw new Error("Creature hit points can only be edited from GM View.");
    }

    const preparedEncounter = campaign.preparedEncounters.find(
      (encounter) => encounter.id === tracker.preparedEncounterId
    );
    const sourceCreature = preparedEncounter?.creatures.find(
      (creature) => creature.id === creatureId
    );

    if (!preparedEncounter || !sourceCreature) {
      throw new Error("Unable to find this prepared encounter creature.");
    }

    setActionError(null);

    if (saveStatus === "dirty" || saveStatus === "saving" || saveStatus === "error") {
      const savedTracker = await flushPendingSave();

      if (!savedTracker) {
        throw new Error("Unable to sync encounter tracker changes before editing hit points.");
      }
    }

    const nextCreature = updateCreature(sourceCreature);
    const campaignPatch = await upsertCampaignPreparedEncounterCreature(
      campaignId,
      preparedEncounter.id,
      nextCreature,
      { suppressFailureToast: true }
    );
    const nextTracker = campaignPatch.patch.liveEncounterTracker
      ? normalizeLiveEncounterTracker(campaignPatch.patch.liveEncounterTracker)
      : null;

    dispatch(patchSelectedCampaign(campaignPatch));

    setDraftTracker(nextTracker?.status.state === "valid" ? nextTracker : null);
  }

  function handleTrackerChange(nextTracker: CampaignLiveEncounterTrackerRecord) {
    setDraftTracker(nextTracker);
    queueSave(nextTracker);
  }

  function handleDisplayedTrackerChange(nextTracker: CampaignLiveEncounterTrackerRecord) {
    if (
      !isGmViewEnabled &&
      tracker?.status.state === "valid" &&
      nextTracker.status.state === "valid"
    ) {
      handleTrackerChange(restoreFullLiveEncounterTrackerFromDisplayTracker(tracker, nextTracker));
      return;
    }

    handleTrackerChange(nextTracker);
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
              role="switch"
              aria-checked={isGmViewEnabled}
              actionType="INFO"
              variant="OUTLINE"
              fullWidth={false}
              disabled={!isTrackerValid}
              icon={
                isGmViewEnabled ? (
                  <Eye size={16} aria-hidden="true" />
                ) : (
                  <EyeOff size={16} aria-hidden="true" />
                )
              }
              trailingBadge={<PlayerVisibilitySwitchVisual checked={isGmViewEnabled} />}
              onClick={() => setIsGmViewEnabled((currentValue) => !currentValue)}
            >
              GM View
            </ActionButton>
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
              tracker={displayTracker ?? tracker}
              onEditEncounterCreatures={() => {
                void handleEditPreparedEncounter();
              }}
              onChange={handleDisplayedTrackerChange}
              onInspectParticipant={(participant) =>
                setInspectedParticipantId(participant.participantId)
              }
            />
            <CampaignLiveEncounterRoundTracker
              tracker={displayTracker ?? tracker}
              onChange={handleDisplayedTrackerChange}
            />
            {inspectedParticipant ? (
              <CampaignLiveEncounterTrackerInspectionDrawer
                participant={inspectedParticipant}
                readOnly={!isGmViewEnabled}
                onClose={() => setInspectedParticipantId(null)}
                onUpdateCreature={handleUpdateInspectedCreature}
              />
            ) : null}
          </>
        )}
      </section>
    </section>
  );
}

export default CampaignLiveEncounterTrackerPage;
