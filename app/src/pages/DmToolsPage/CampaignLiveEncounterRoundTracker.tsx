import { Hourglass, Minus, Plus, SkipForward, StepBack, StepForward, Undo2 } from "lucide-react";
import { useState } from "react";
import type {
  CampaignLiveEncounterTurnAction,
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerRecord
} from "../../api/campaigns";
import { getInitiativeSlotInfo } from "./liveEncounterInitiative";
import styles from "./CampaignLiveEncounterRoundTracker.module.css";

type CampaignLiveEncounterRoundTrackerProps = {
  isTurnBusy?: boolean;
  onChange: (tracker: CampaignLiveEncounterTrackerRecord) => void;
  onTurnAction: (action: CampaignLiveEncounterTurnAction, afterParticipantId?: string) => void;
  readOnly?: boolean;
  tracker: CampaignLiveEncounterTrackerRecord;
};

function normalizeRoundNumber(value: number) {
  return Number.isInteger(value) && value > 0 ? value : 1;
}

function getParticipantName(participant: CampaignLiveEncounterTrackerParticipantRecord) {
  if (participant.kind === "party-member") {
    return participant.statBlock?.name ?? participant.summary.name;
  }

  if (participant.kind === "party-companion") {
    return participant.companion.name;
  }

  return participant.creature.name;
}

function CampaignLiveEncounterRoundTracker({
  isTurnBusy = false,
  onChange,
  onTurnAction,
  readOnly = false,
  tracker
}: CampaignLiveEncounterRoundTrackerProps) {
  const [isDelayOpen, setIsDelayOpen] = useState(false);
  const roundNumber = normalizeRoundNumber(tracker.roundNumber);
  const activeParticipantIndex = tracker.initiativeOrder.findIndex(
    (participant) => participant.participantId === tracker.activeParticipantId
  );
  const activeParticipant =
    activeParticipantIndex >= 0 ? tracker.initiativeOrder[activeParticipantIndex] : null;
  const hasParticipants = tracker.initiativeOrder.length > 0;
  const turnActionsDisabled = readOnly || isTurnBusy || !hasParticipants;
  const hasActiveParticipant = activeParticipantIndex >= 0;
  const delayTargets = hasActiveParticipant
    ? tracker.initiativeOrder
        .slice(activeParticipantIndex + 1)
        .filter((participant) => !slotInfo.get(participant.participantId)?.isActive)
    : [];
  const slotInfo = getInitiativeSlotInfo(tracker.initiativeOrder, tracker.activeParticipantId);
  const activePack = tracker.initiativeOrder.filter(
    (participant) => slotInfo.get(participant.participantId)?.isActive
  );
  const activeLabel =
    activePack.length > 1
      ? `${getParticipantName(activePack[0]!)} pack (${activePack.length})`
      : activeParticipant
        ? getParticipantName(activeParticipant)
        : "";
  const turnLabel = activeParticipant
    ? `${slotInfo.get(activeParticipant.participantId)?.slotNumber ?? activeParticipantIndex + 1}. ${activeLabel}'s Turn`
    : hasParticipants
      ? "Press Next Turn to begin"
      : "Add participants to initiative";

  function updateRound(nextRoundNumber: number) {
    if (readOnly) {
      return;
    }

    onChange({
      ...tracker,
      roundNumber: Math.max(1, nextRoundNumber)
    });
  }

  function runTurnAction(action: CampaignLiveEncounterTurnAction, afterParticipantId?: string) {
    setIsDelayOpen(false);
    onTurnAction(action, afterParticipantId);
  }

  return (
    <aside className={styles.root} aria-label="Encounter round tracker">
      <strong className={styles.turnLabel}>{turnLabel}</strong>
      <div className={styles.controls}>
        <div className={styles.roundControls}>
          <button
            type="button"
            className={styles.controlButton}
            disabled={readOnly || roundNumber <= 1}
            onClick={() => updateRound(roundNumber - 1)}
            aria-label="Decrease round"
            title="Decrease round"
          >
            <Minus size={17} aria-hidden="true" />
          </button>
          <span className={styles.roundLabel}>Round {roundNumber}</span>
          <button
            type="button"
            className={styles.controlButton}
            disabled={readOnly}
            onClick={() => updateRound(roundNumber + 1)}
            aria-label="Increase round"
            title="Increase round"
          >
            <Plus size={17} aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          className={styles.nextTurnButton}
          disabled={turnActionsDisabled}
          onClick={() => runTurnAction("next")}
          aria-label="Next turn"
          title="Next turn"
        >
          <StepForward size={17} aria-hidden="true" />
          <span>Next Turn</span>
        </button>
      </div>
      <div className={styles.turnActions} role="group" aria-label="More turn controls">
        <button
          type="button"
          className={styles.turnActionButton}
          disabled={turnActionsDisabled || !hasActiveParticipant}
          onClick={() => runTurnAction("previous")}
          title="Go back one turn"
        >
          <StepBack size={15} aria-hidden="true" />
          <span>Previous</span>
        </button>
        <button
          type="button"
          className={styles.turnActionButton}
          disabled={turnActionsDisabled}
          onClick={() => runTurnAction("skip")}
          title="Skip the next participant's turn"
        >
          <SkipForward size={15} aria-hidden="true" />
          <span>Skip next</span>
        </button>
        <button
          type="button"
          className={styles.turnActionButton}
          disabled={turnActionsDisabled || delayTargets.length === 0}
          aria-expanded={isDelayOpen}
          onClick={() => setIsDelayOpen((isOpen) => !isOpen)}
          title="Delay the current turn until later in the round"
        >
          <Hourglass size={15} aria-hidden="true" />
          <span>Delay</span>
        </button>
        <button
          type="button"
          className={styles.turnActionButton}
          disabled={readOnly || isTurnBusy || !tracker.canUndo}
          onClick={() => runTurnAction("undo")}
          title="Undo the last turn action"
        >
          <Undo2 size={15} aria-hidden="true" />
          <span>Undo</span>
        </button>
      </div>
      {isDelayOpen && delayTargets.length > 0 ? (
        <label className={styles.delayRow}>
          <span>Act after</span>
          <select
            className={styles.delaySelect}
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) {
                runTurnAction("delay", event.target.value);
              }
            }}
          >
            <option value="" disabled>
              Choose participant
            </option>
            {delayTargets.map((participant) => (
              <option key={participant.participantId} value={participant.participantId}>
                {getParticipantName(participant)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </aside>
  );
}

export default CampaignLiveEncounterRoundTracker;
