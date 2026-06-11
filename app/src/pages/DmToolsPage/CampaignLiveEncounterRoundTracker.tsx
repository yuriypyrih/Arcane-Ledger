import { Minus, Plus, StepForward } from "lucide-react";
import type {
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerRecord
} from "../../api/campaigns";
import styles from "./CampaignLiveEncounterRoundTracker.module.css";

type CampaignLiveEncounterRoundTrackerProps = {
  onChange: (tracker: CampaignLiveEncounterTrackerRecord) => void;
  readOnly?: boolean;
  tracker: CampaignLiveEncounterTrackerRecord;
};

function normalizeRoundNumber(value: number) {
  return Number.isInteger(value) && value > 0 ? value : 1;
}

function getParticipantName(participant: CampaignLiveEncounterTrackerParticipantRecord) {
  return participant.kind === "party-member"
    ? (participant.statBlock?.name ?? participant.summary.name)
    : participant.creature.name;
}

function CampaignLiveEncounterRoundTracker({
  onChange,
  readOnly = false,
  tracker
}: CampaignLiveEncounterRoundTrackerProps) {
  const roundNumber = normalizeRoundNumber(tracker.roundNumber);
  const activeParticipantIndex = tracker.initiativeOrder.findIndex(
    (participant) => participant.participantId === tracker.activeParticipantId
  );
  const activeParticipant =
    activeParticipantIndex >= 0 ? tracker.initiativeOrder[activeParticipantIndex] : null;
  const nextTurnDisabled = readOnly || activeParticipantIndex < 0;
  const turnLabel = activeParticipant
    ? `${getParticipantName(activeParticipant)}'s Turn`
    : "Decide who plays first";

  function updateRound(nextRoundNumber: number) {
    if (readOnly) {
      return;
    }

    onChange({
      ...tracker,
      roundNumber: Math.max(1, nextRoundNumber)
    });
  }

  function handleNextTurn() {
    if (readOnly) {
      return;
    }

    if (nextTurnDisabled || tracker.initiativeOrder.length === 0) {
      return;
    }

    const isLastParticipant = activeParticipantIndex === tracker.initiativeOrder.length - 1;
    const nextParticipant = isLastParticipant
      ? tracker.initiativeOrder[0]
      : tracker.initiativeOrder[activeParticipantIndex + 1];

    if (!nextParticipant) {
      return;
    }

    onChange({
      ...tracker,
      activeParticipantId: nextParticipant.participantId,
      roundNumber: isLastParticipant ? roundNumber + 1 : roundNumber
    });
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
          disabled={nextTurnDisabled}
          onClick={handleNextTurn}
          aria-label="Next turn"
          title="Next turn"
        >
          <StepForward size={17} aria-hidden="true" />
          <span>Next Turn</span>
        </button>
      </div>
    </aside>
  );
}

export default CampaignLiveEncounterRoundTracker;
