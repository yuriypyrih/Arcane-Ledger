import clsx from "clsx";
import { Swords } from "lucide-react";
import type { CampaignLiveEncounterTrackerParticipantRecord } from "../../api/campaigns";
import { CampaignLiveEncounterTrackerReadOnlyParticipantCard } from "./CampaignLiveEncounterTrackerParticipantCard";
import DmToolsEmptyState from "./DmToolsEmptyState";
import styles from "./DmToolsPage.module.css";

type CampaignLiveEncounterTrackerReadOnlyInitiativeListProps = {
  activeParticipantId: string | null;
  className?: string;
  emptyText?: string;
  onInspectParticipant: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  participantListClassName?: string;
  participants: CampaignLiveEncounterTrackerParticipantRecord[];
};

function CampaignLiveEncounterTrackerReadOnlyInitiativeList({
  activeParticipantId,
  className,
  emptyText = "No participants are in initiative yet.",
  onInspectParticipant,
  participantListClassName,
  participants
}: CampaignLiveEncounterTrackerReadOnlyInitiativeListProps) {
  const icon = <Swords size={16} aria-hidden="true" />;

  return (
    <section
      className={clsx(styles.liveTrackerDropList, className)}
      aria-labelledby="player-live-tracker-initiative-title"
    >
      <div className={styles.liveTrackerListHeader}>
        <h3 id="player-live-tracker-initiative-title">
          {icon}
          <span>Initiative Order</span>
        </h3>
      </div>

      <div className={clsx(styles.liveTrackerParticipantList, participantListClassName)}>
        {participants.length > 0 ? (
          participants.map((participant, participantIndex) => (
            <CampaignLiveEncounterTrackerReadOnlyParticipantCard
              key={participant.participantId}
              activeParticipantId={activeParticipantId}
              initiativeOrderNumber={participantIndex + 1}
              onInspect={onInspectParticipant}
              participant={participant}
            />
          ))
        ) : (
          <DmToolsEmptyState icon={icon}>{emptyText}</DmToolsEmptyState>
        )}
      </div>
    </section>
  );
}

export default CampaignLiveEncounterTrackerReadOnlyInitiativeList;
