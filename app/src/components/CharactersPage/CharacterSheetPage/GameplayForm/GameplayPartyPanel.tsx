import { AlertTriangle, ScrollText, Swords } from "lucide-react";
import type {
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerRecord
} from "../../../../api/campaigns";
import CampaignLiveEncounterTrackerInspectionDrawer from "../../../../pages/DmToolsPage/CampaignLiveEncounterTrackerInspectionDrawer";
import CampaignLiveEncounterTrackerReadOnlyInitiativeList from "../../../../pages/DmToolsPage/CampaignLiveEncounterTrackerReadOnlyInitiativeList";
import DmToolsEmptyState from "../../../../pages/DmToolsPage/DmToolsEmptyState";
import styles from "./GameplayForm.module.css";

type GameplayPartyPanelProps = {
  error: string | null;
  inspectedParticipant: CampaignLiveEncounterTrackerParticipantRecord | null;
  isInitialLoading: boolean;
  onCloseInspection: () => void;
  onInspectParticipant: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  tracker: CampaignLiveEncounterTrackerRecord | null;
};

function GameplayPartyPanel({
  error,
  inspectedParticipant,
  isInitialLoading,
  onCloseInspection,
  onInspectParticipant,
  tracker
}: GameplayPartyPanelProps) {
  return (
    <section className={styles.partyPanelContent} aria-label="Party initiative order">
      {isInitialLoading ? (
        <DmToolsEmptyState icon={<ScrollText size={18} aria-hidden="true" />}>
          Loading active encounter...
        </DmToolsEmptyState>
      ) : error ? (
        <DmToolsEmptyState icon={<AlertTriangle size={18} aria-hidden="true" />}>
          {error}
        </DmToolsEmptyState>
      ) : !tracker ? (
        <div className={styles.partyNoEncounterState} role="status">
          <Swords className={styles.partyNoEncounterIcon} size={48} aria-hidden="true" />
          <span>There is no active encounter.</span>
        </div>
      ) : tracker.status.state !== "valid" ? (
        <DmToolsEmptyState icon={<AlertTriangle size={18} aria-hidden="true" />}>
          {tracker.status.message}
        </DmToolsEmptyState>
      ) : (
        <CampaignLiveEncounterTrackerReadOnlyInitiativeList
          activeParticipantId={tracker.activeParticipantId}
          className={styles.partyInitiativeList}
          onInspectParticipant={onInspectParticipant}
          participantListClassName={styles.partyInitiativeParticipantList}
          participants={tracker.initiativeOrder}
        />
      )}

      {inspectedParticipant ? (
        <CampaignLiveEncounterTrackerInspectionDrawer
          participant={inspectedParticipant}
          onClose={onCloseInspection}
        />
      ) : null}
    </section>
  );
}

export default GameplayPartyPanel;
