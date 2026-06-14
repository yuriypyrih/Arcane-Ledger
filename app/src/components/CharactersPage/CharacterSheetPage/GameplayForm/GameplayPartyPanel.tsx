import { AlertTriangle, ScrollText } from "lucide-react";
import { useState } from "react";
import type {
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerRecord
} from "../../../../api/campaigns";
import CampaignLiveEncounterTrackerInspectionDrawer from "../../../../pages/DmToolsPage/CampaignLiveEncounterTrackerInspectionDrawer";
import CampaignLiveEncounterTrackerReadOnlyInitiativeList from "../../../../pages/DmToolsPage/CampaignLiveEncounterTrackerReadOnlyInitiativeList";
import DmToolsEmptyState from "../../../../pages/DmToolsPage/DmToolsEmptyState";
import LiveEncounterGuideModal from "../../../../pages/DmToolsPage/LiveEncounterGuideModal";
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
  const [isGuideOpen, setIsGuideOpen] = useState(false);

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
        <CampaignLiveEncounterTrackerReadOnlyInitiativeList
          activeParticipantId={null}
          className={styles.partyInitiativeList}
          emptyStateVariant="centered"
          emptyText="There is no active encounter."
          onOpenGuide={() => setIsGuideOpen(true)}
          onInspectParticipant={onInspectParticipant}
          participantListClassName={`${styles.partyInitiativeParticipantList} ${styles.partyInitiativeParticipantListCentered}`}
          participants={[]}
        />
      ) : tracker.status.state !== "valid" ? (
        <DmToolsEmptyState icon={<AlertTriangle size={18} aria-hidden="true" />}>
          {tracker.status.message}
        </DmToolsEmptyState>
      ) : (
        <CampaignLiveEncounterTrackerReadOnlyInitiativeList
          activeParticipantId={tracker.activeParticipantId}
          className={styles.partyInitiativeList}
          onOpenGuide={() => setIsGuideOpen(true)}
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
      {isGuideOpen ? <LiveEncounterGuideModal onClose={() => setIsGuideOpen(false)} /> : null}
    </section>
  );
}

export default GameplayPartyPanel;
