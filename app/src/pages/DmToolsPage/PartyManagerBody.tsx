import { Plus, Users } from "lucide-react";
import ActionButton from "../../components/ActionButton";
import styles from "./DmToolsPage.module.css";

type PartyManagerBodyProps = {
  panelId: string;
  tabId: string;
};

function PartyManagerBody({ panelId, tabId }: PartyManagerBodyProps) {
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
          <p className={styles.bodyEyebrow}>Party Manager</p>
          <h3 className={styles.bodyTitle}>Party Groups</h3>
        </div>
        <ActionButton icon={<Plus size={16} aria-hidden="true" />} fullWidth={false}>
          Create Party Group
        </ActionButton>
      </div>

      <div className={styles.emptyState}>
        <Users size={28} aria-hidden="true" />
        <span>No party groups yet.</span>
      </div>
    </section>
  );
}

export default PartyManagerBody;
