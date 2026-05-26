import { Plus, ScrollText } from "lucide-react";
import ActionButton from "../../components/ActionButton";
import styles from "./DmToolsPage.module.css";

type CampaignManagerBodyProps = {
  panelId: string;
  tabId: string;
};

function CampaignManagerBody({ panelId, tabId }: CampaignManagerBodyProps) {
  return (
    <section
      className={styles.toolBody}
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={0}
    >
      <div className={styles.bodyHeader}>
        <div>
          <p className={styles.bodyEyebrow}>Campaign Manager</p>
          <h3 className={styles.bodyTitle}>Campaigns</h3>
        </div>
        <ActionButton icon={<Plus size={16} aria-hidden="true" />} fullWidth={false}>
          Create Campaign
        </ActionButton>
      </div>

      <div className={styles.emptyState}>
        <ScrollText size={28} aria-hidden="true" />
        <span>No campaigns yet.</span>
      </div>
    </section>
  );
}

export default CampaignManagerBody;
