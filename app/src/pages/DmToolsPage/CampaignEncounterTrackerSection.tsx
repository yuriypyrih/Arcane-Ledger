import { Play, Swords, X } from "lucide-react";
import type { CampaignPreparedEncounterRecord } from "../../api/campaigns";
import DmToolsEmptyState from "./DmToolsEmptyState";
import DmToolsListCard from "./DmToolsListCard";
import styles from "./DmToolsPage.module.css";

type CampaignEncounterTrackerSectionProps = {
  activeEncounter: Pick<CampaignPreparedEncounterRecord, "id" | "name"> | null;
  onClearActiveEncounter: () => void;
};

function CampaignEncounterTrackerSection({
  activeEncounter,
  onClearActiveEncounter
}: CampaignEncounterTrackerSectionProps) {
  return (
    <section className={styles.membersPanel} aria-labelledby="campaign-encounter-tracker-title">
      <div className={styles.memberPanelHeader}>
        <div>
          <h3 id="campaign-encounter-tracker-title" className={styles.bodyTitle}>
            Encounter Tracker
          </h3>
        </div>
      </div>

      {activeEncounter ? (
        <DmToolsListCard
          icon={<Swords size={18} aria-hidden="true" />}
          title="ENCOUNTER IN PROGRESS"
          meta={activeEncounter.name}
          actions={[
            {
              icon: <X size={18} aria-hidden="true" />,
              label: `Remove ${activeEncounter.name}`,
              onClick: onClearActiveEncounter,
              title: `Remove ${activeEncounter.name}`
            }
          ]}
        />
      ) : (
        <DmToolsEmptyState icon={<Swords size={18} aria-hidden="true" />}>
          There is no active encounter. Press the{" "}
          <span className={styles.inlineIconButtonGlyph} role="img" aria-label="play">
            <Play size={13} aria-hidden="true" />
          </span>{" "}
          button on a prepared encounter
        </DmToolsEmptyState>
      )}
    </section>
  );
}

export default CampaignEncounterTrackerSection;
