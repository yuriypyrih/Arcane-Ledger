import clsx from "clsx";
import { Swords } from "lucide-react";
import type { CampaignLiveEncounterTrackerParticipantRecord } from "../../api/campaigns";
import { CampaignLiveEncounterTrackerReadOnlyParticipantCard } from "./CampaignLiveEncounterTrackerParticipantCard";
import { getInitiativeSlotInfo } from "./liveEncounterInitiative";
import DmToolsEmptyState from "./DmToolsEmptyState";
import LiveEncounterGuideButton from "./LiveEncounterGuideButton";
import styles from "./DmToolsPage.module.css";

type CampaignLiveEncounterTrackerReadOnlyInitiativeListProps = {
  activeParticipantId: string | null;
  className?: string;
  emptyStateVariant?: "inline" | "centered";
  emptyText?: string;
  onOpenGuide?: () => void;
  onInspectParticipant: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  participantListClassName?: string;
  participants: CampaignLiveEncounterTrackerParticipantRecord[];
};

function CampaignLiveEncounterTrackerReadOnlyInitiativeList({
  activeParticipantId,
  className,
  emptyStateVariant = "inline",
  emptyText = "No participants are in initiative yet.",
  onOpenGuide,
  onInspectParticipant,
  participantListClassName,
  participants
}: CampaignLiveEncounterTrackerReadOnlyInitiativeListProps) {
  const slotInfo = getInitiativeSlotInfo(participants, activeParticipantId);
  const icon = <Swords size={16} aria-hidden="true" />;
  const isCenteredEmptyState = emptyStateVariant === "centered" && participants.length === 0;

  return (
    <section
      className={clsx(styles.liveTrackerDropList, className)}
      aria-labelledby="player-live-tracker-initiative-title"
    >
      <div className={styles.liveTrackerListHeader}>
        <div className={styles.liveTrackerListTitleRow}>
          <h3 id="player-live-tracker-initiative-title">
            {icon}
            <span>Initiative Order</span>
          </h3>
          {onOpenGuide ? <LiveEncounterGuideButton onClick={onOpenGuide} /> : null}
        </div>
      </div>

      <div
        className={clsx(
          styles.liveTrackerParticipantList,
          isCenteredEmptyState && styles.liveTrackerCenteredParticipantList,
          participantListClassName
        )}
      >
        {participants.length > 0 ? (
          participants.map((participant) => (
            <CampaignLiveEncounterTrackerReadOnlyParticipantCard
              key={participant.participantId}
              activeParticipantId={activeParticipantId}
              groupPosition={slotInfo.get(participant.participantId)?.groupPosition}
              initiativeOrderNumber={slotInfo.get(participant.participantId)?.slotNumber}
              isActiveSlot={slotInfo.get(participant.participantId)?.isActive}
              onInspect={onInspectParticipant}
              participant={participant}
            />
          ))
        ) : (
          <DmToolsEmptyState
            className={isCenteredEmptyState ? styles.liveTrackerCenteredEmptyState : undefined}
            icon={icon}
          >
            {emptyText}
          </DmToolsEmptyState>
        )}
      </div>
    </section>
  );
}

export default CampaignLiveEncounterTrackerReadOnlyInitiativeList;
