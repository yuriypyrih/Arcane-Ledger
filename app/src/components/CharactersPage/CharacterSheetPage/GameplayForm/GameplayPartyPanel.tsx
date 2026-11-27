import { AlertTriangle, ScrollText, Tv } from "lucide-react";
import { useHref } from "react-router-dom";
import { useState } from "react";
import type {
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerRecord
} from "../../../../api/campaigns";
import CampaignLiveEncounterTrackerInspectionDrawer from "../../../../pages/DmToolsPage/CampaignLiveEncounterTrackerInspectionDrawer";
import CampaignLiveEncounterTrackerReadOnlyInitiativeList from "../../../../pages/DmToolsPage/CampaignLiveEncounterTrackerReadOnlyInitiativeList";
import DmToolsEmptyState from "../../../../pages/DmToolsPage/DmToolsEmptyState";
import LiveEncounterGuideModal from "../../../../pages/DmToolsPage/LiveEncounterGuideModal";
import { openTableDisplayWindow } from "../../../../pages/DmToolsPage/liveEncounterTrackerWindow";
import ActionButton from "../../../ActionButton";
import PartyInitiativeSubmit from "./PartyInitiativeSubmit";
import styles from "./GameplayForm.module.css";

type GameplayPartyPanelProps = {
  error: string | null;
  initiativeSubmit?: {
    characterId: string;
    onUpdated: (tracker: CampaignLiveEncounterTrackerRecord | null) => void;
    partyGroupId: string;
  };
  inspectedParticipant: CampaignLiveEncounterTrackerParticipantRecord | null;
  isInitialLoading: boolean;
  partyGroupId?: string;
  onCloseInspection: () => void;
  onInspectParticipant: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  tracker: CampaignLiveEncounterTrackerRecord | null;
};

function GameplayPartyPanel({
  error,
  initiativeSubmit,
  inspectedParticipant,
  isInitialLoading,
  onCloseInspection,
  partyGroupId,
  onInspectParticipant,
  tracker
}: GameplayPartyPanelProps) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const tableViewHref = useHref(`/table/${partyGroupId ?? ""}`);

  return (
    <section className={styles.partyPanelContent} aria-label="Party initiative order">
      {partyGroupId ? (
        <ActionButton
          variant="OUTLINE"
          fullWidth={false}
          size="sm"
          icon={<Tv size={16} aria-hidden="true" />}
          onClick={() => openTableDisplayWindow(tableViewHref)}
        >
          Table view
        </ActionButton>
      ) : null}
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
        <>
          {initiativeSubmit ? (
            <PartyInitiativeSubmit {...initiativeSubmit} tracker={tracker} />
          ) : null}
          <CampaignLiveEncounterTrackerReadOnlyInitiativeList
            activeParticipantId={tracker.activeParticipantId}
            className={styles.partyInitiativeList}
            onOpenGuide={() => setIsGuideOpen(true)}
            onInspectParticipant={onInspectParticipant}
            participantListClassName={styles.partyInitiativeParticipantList}
            participants={tracker.initiativeOrder}
          />
        </>
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
