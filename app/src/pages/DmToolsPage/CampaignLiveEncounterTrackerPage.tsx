import {
  AlertTriangle,
  CircleCheck,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  ScrollText,
  Swords,
  Tv,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHref, useNavigate, useParams } from "react-router-dom";
import {
  applyCampaignLiveEncounterTurn,
  getCampaign,
  updateCampaignPreparedEncounterCreatureVisibilitySettings,
  type CampaignLiveEncounterTurnAction,
  removeCampaignLiveEncounterTracker,
  upsertCampaignPreparedEncounterCreature,
  type CampaignLiveEncounterTrackerParticipantRecord,
  type CampaignLiveEncounterTrackerRecord
} from "../../api/campaigns";
import type {
  EncounterCreatureWriteRecord,
  EncounterTemplateCreatureRecord
} from "../../api/encounterTemplates";
import { ApiRequestFailedError } from "../../api/client";
import {
  clearLiveEncounterTrackerSaveStatus,
  patchSelectedCampaign,
  setLiveEncounterTrackerSaveStatus,
  setSelectedCampaign,
  setSelectedCampaignError,
  setSelectedCampaignLoading,
  store,
  useAppDispatch,
  useAppSelector
} from "../../store";
import ActionButton from "../../components/ActionButton";
import { useCampaignEvents } from "../../lib/useCampaignEvents";
import CampaignLiveEncounterTrackerBoard from "./CampaignLiveEncounterTrackerBoard";
import CampaignLiveEncounterTrackerInspectionDrawer from "./CampaignLiveEncounterTrackerInspectionDrawer";
import CampaignLiveEncounterRoundTracker from "./CampaignLiveEncounterRoundTracker";
import LiveEncounterGuideButton from "./LiveEncounterGuideButton";
import LiveEncounterGuideModal from "./LiveEncounterGuideModal";
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
import {
  openLiveEncounterTrackerWindow,
  openTableDisplayWindow
} from "./liveEncounterTrackerWindow";
import { applyDamageToEncounterCreature } from "./encounterCreatureDamage";
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

    return fullParticipant?.kind === "party-member" || fullParticipant?.kind === "party-companion"
      ? [fullParticipant]
      : [];
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
  const trackerHref = useHref(`/gm-tools/campaign-manager/${campaignId}/live-encounter`);
  const authStatus = useAppSelector((state) => state.auth.status);
  const campaign = useAppSelector((state) => state.dmTools.selectedCampaignsById[campaignId]);
  const tableDisplayHref = useHref(
    `/table/${campaign?.liveEncounterTracker?.partyGroupId ?? campaign?.selectedPartyId ?? ""}`
  );
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
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isTrackerRefreshCoolingDown, setIsTrackerRefreshCoolingDown] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isTurnBusy, setIsTurnBusy] = useState(false);
  const trackerRefreshCooldownRef = useRef<number | null>(null);
  const creatureUpdateQueueRef = useRef<Promise<unknown>>(Promise.resolve());

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

  const reloadCampaignFromServer = useCallback(() => {
    if (!campaignId || authStatus !== "authenticated") {
      return;
    }

    void getCampaign(campaignId, { suppressFailureToast: true })
      .then(({ campaign: nextCampaign }) => dispatch(setSelectedCampaign(nextCampaign)))
      .catch(() => undefined);
  }, [authStatus, campaignId, dispatch]);

  const { flushPendingSave, queueSave } = useLiveEncounterTrackerPersistence({
    campaignId,
    onConflict: reloadCampaignFromServer,
    onSavedTracker: handleSavedTracker
  });

  const serverTracker = useMemo(
    () =>
      campaign?.liveEncounterTracker
        ? normalizeLiveEncounterTracker(campaign.liveEncounterTracker)
        : null,
    [campaign?.liveEncounterTracker]
  );
  const serverRevision = serverTracker?.revision ?? 0;

  // Live updates: a player's turn or HP change reaches the GM without pressing Refresh.
  // Edits in flight are never overwritten; the draft only follows the server while the page is clean.
  useCampaignEvents(
    authStatus === "authenticated" && campaignId ? [campaignId] : [],
    (type, _id, revision) => {
      if (type === "game-session.updated" || type === "game-session.started") {
        return;
      }

      // Revision 0 means the tracker was removed, which must always reload.
      if (
        type === "live-encounter.updated" &&
        revision !== undefined &&
        revision > 0 &&
        revision <= serverRevision
      ) {
        return;
      }

      reloadCampaignFromServer();
    }
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

  // How many creatures share the inspected creature's type, so the drawer can say it is linked.
  const inspectedTypeGroupId =
    inspectedParticipant?.kind === "creature" ? inspectedParticipant.creature.typeGroupId : null;
  const inspectedTypeSize =
    inspectedTypeGroupId && tracker?.status.state === "valid"
      ? [...tracker.creatures, ...tracker.initiativeOrder].filter(
          (entry) =>
            entry.kind === "creature" && entry.creature.typeGroupId === inspectedTypeGroupId
        ).length
      : 0;

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

  // Creature edits run one at a time, each against the newest campaign, so quick clicks never
  // overwrite one another with stale hit points.
  function handleUpdateInspectedCreature(
    creatureId: string,
    updateCreature: (creature: EncounterTemplateCreatureRecord) => EncounterCreatureWriteRecord
  ) {
    const run = creatureUpdateQueueRef.current.then(() =>
      applyCreatureUpdate(creatureId, updateCreature)
    );

    creatureUpdateQueueRef.current = run.catch(() => undefined);

    return run;
  }

  /** Lets players see (or hide) one creature's resistances and immunities; other settings stay as they are. */
  async function handleSetResistanceVisibility(creatureId: string, show: boolean) {
    const latestCampaign = store.getState().dmTools.selectedCampaignsById[campaignId] ?? campaign;
    const latestTracker = latestCampaign?.liveEncounterTracker;
    const creature = latestTracker?.creatures
      .concat(latestTracker.initiativeOrder.filter((entry) => entry.kind === "creature"))
      .find((entry) => entry.kind === "creature" && entry.creatureId === creatureId);

    if (!campaignId || !latestTracker || creature?.kind !== "creature") {
      throw new Error("Unable to find this creature.");
    }

    const campaignPatch = await updateCampaignPreparedEncounterCreatureVisibilitySettings(
      campaignId,
      latestTracker.preparedEncounterId,
      creatureId,
      {
        ...creature.creature.effectivePlayerVisibilitySettings,
        showResistancesAndImmunities: show
      },
      { suppressFailureToast: true }
    );
    const nextTracker = campaignPatch.patch.liveEncounterTracker
      ? normalizeLiveEncounterTracker(campaignPatch.patch.liveEncounterTracker)
      : null;

    dispatch(patchSelectedCampaign(campaignPatch));
    setDraftTracker(nextTracker?.status.state === "valid" ? nextTracker : null);
  }

  function handleDamageCreature(creatureId: string, amount: number) {
    void handleUpdateInspectedCreature(creatureId, (creature) =>
      applyDamageToEncounterCreature(creature, amount)
    ).catch((damageError) =>
      setActionError(getDmToolsApiErrorMessage(damageError, "Unable to change hit points."))
    );
  }

  async function applyCreatureUpdate(
    creatureId: string,
    updateCreature: (creature: EncounterTemplateCreatureRecord) => EncounterCreatureWriteRecord
  ) {
    const latestCampaign = store.getState().dmTools.selectedCampaignsById[campaignId] ?? campaign;
    const latestTracker = latestCampaign?.liveEncounterTracker;

    if (
      !campaignId ||
      !latestCampaign ||
      !latestTracker ||
      latestTracker.status.state !== "valid" ||
      !isGmViewEnabled
    ) {
      throw new Error("Creature hit points can only be edited from GM View.");
    }

    const preparedEncounter = latestCampaign.preparedEncounters.find(
      (encounter) => encounter.id === latestTracker.preparedEncounterId
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

      // An "error" status with nothing pending (for example after a conflict reload) is not a reason
      // to block: creature edits do not depend on the tracker's own save.
      if (!savedTracker && saveStatus !== "error") {
        throw new Error("Unable to sync encounter tracker changes before editing hit points.");
      }
    }

    const nextCreature = updateCreature(sourceCreature);

    if (nextCreature.id !== creatureId) {
      throw new Error("The edit would change a different creature. Nothing was saved.");
    }
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

  async function handleTurnAction(
    action: CampaignLiveEncounterTurnAction,
    afterParticipantId?: string
  ) {
    if (isTurnBusy || !campaignId) {
      return;
    }

    setActionError(null);
    setIsTurnBusy(true);

    try {
      // Pending edits go first so the turn applies to the revision the server now holds.
      await flushPendingSave();

      const revision =
        store.getState().dmTools.selectedCampaignsById[campaignId]?.liveEncounterTracker?.revision;

      if (!revision) {
        return;
      }

      const campaignPatch = await applyCampaignLiveEncounterTurn(
        campaignId,
        { action, afterParticipantId, revision },
        { suppressFailureToast: true }
      );
      const nextTracker = campaignPatch.patch.liveEncounterTracker;

      dispatch(patchSelectedCampaign(campaignPatch));

      if (nextTracker?.status.state === "valid") {
        setDraftTracker(normalizeLiveEncounterTracker(nextTracker));
      }
    } catch (turnError) {
      if (
        turnError instanceof ApiRequestFailedError &&
        turnError.code === "LIVE_ENCOUNTER_REVISION_CONFLICT"
      ) {
        reloadCampaignFromServer();
      }

      setActionError(getDmToolsApiErrorMessage(turnError, "Unable to change the turn."));
    } finally {
      setIsTurnBusy(false);
    }
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
    <section className={styles.page}>
      <DmToolsBackButton onClick={() => navigate(`/gm-tools/campaign-manager/${campaignId}`)}>
        Back to Campaign
      </DmToolsBackButton>

      <section className={styles.panel} aria-labelledby="live-encounter-title">
        <div className={styles.header}>
          <div>
            <div className={styles.eyebrowHelpRow}>
              <p className={styles.eyebrow}>
                <Swords size={15} aria-hidden="true" />
                <span>Live Encounter</span>
              </p>
              <LiveEncounterGuideButton onClick={() => setIsGuideOpen(true)} />
            </div>
            <h2 id="live-encounter-title" className={styles.title}>
              {tracker?.preparedEncounterName ?? "Encounter Tracker"}
            </h2>
          </div>
          <div className={styles.headerActions}>
            <ActionButton
              actionType="INFO"
              variant="OUTLINE"
              fullWidth={false}
              icon={<ExternalLink size={16} aria-hidden="true" />}
              onClick={() => openLiveEncounterTrackerWindow(trackerHref)}
            >
              Pop out
            </ActionButton>
            <ActionButton
              actionType="INFO"
              variant="OUTLINE"
              fullWidth={false}
              disabled={!campaign?.selectedPartyId}
              icon={<Tv size={16} aria-hidden="true" />}
              onClick={() => openTableDisplayWindow(tableDisplayHref)}
            >
              Table view
            </ActionButton>
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
              onDamageCreature={handleDamageCreature}
              onInspectParticipant={(participant) =>
                setInspectedParticipantId(participant.participantId)
              }
            />
            <CampaignLiveEncounterRoundTracker
              tracker={displayTracker ?? tracker}
              isTurnBusy={isTurnBusy}
              onChange={handleDisplayedTrackerChange}
              onTurnAction={(action, afterParticipantId) =>
                void handleTurnAction(action, afterParticipantId)
              }
            />
            {inspectedParticipant ? (
              <CampaignLiveEncounterTrackerInspectionDrawer
                participant={inspectedParticipant}
                linkedCreatureCount={inspectedTypeSize}
                readOnly={!isGmViewEnabled}
                onClose={() => setInspectedParticipantId(null)}
                onSetResistanceVisibility={handleSetResistanceVisibility}
                onUpdateCreature={handleUpdateInspectedCreature}
              />
            ) : null}
          </>
        )}
        {isGuideOpen ? <LiveEncounterGuideModal onClose={() => setIsGuideOpen(false)} /> : null}
      </section>
    </section>
  );
}

export default CampaignLiveEncounterTrackerPage;
