import { Plus, Swords } from "lucide-react";
import ActionButton from "../../components/ActionButton";
import styles from "./DmToolsPage.module.css";

type EncounterTemplatesBodyProps = {
  panelId: string;
  tabId: string;
};

function EncounterTemplatesBody({ panelId, tabId }: EncounterTemplatesBodyProps) {
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
          <p className={styles.bodyEyebrow}>Encounter Templates</p>
          <h3 className={styles.bodyTitle}>Templates</h3>
        </div>
        <ActionButton icon={<Plus size={16} aria-hidden="true" />} fullWidth={false}>
          Create Encounter Template
        </ActionButton>
      </div>

      <div className={styles.emptyState}>
        <Swords size={28} aria-hidden="true" />
        <span>No encounter templates yet.</span>
      </div>
    </section>
  );
}

export default EncounterTemplatesBody;
