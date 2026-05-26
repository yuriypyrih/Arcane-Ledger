import { LayoutDashboard } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import CampaignManagerBody from "./CampaignManagerBody";
import EncounterTemplatesBody from "./EncounterTemplatesBody";
import PartyManagerBody from "./PartyManagerBody";
import {
  DM_TOOLS_TAB_PARAM,
  DM_TOOLS_TABS,
  type DmToolsTabId,
  parseDmToolsTabId
} from "./dmToolsTabs";
import styles from "./DmToolsPage.module.css";

function getTabButtonId(tabId: DmToolsTabId) {
  return `dm-tools-${tabId}-tab`;
}

function getTabPanelId(tabId: DmToolsTabId) {
  return `dm-tools-${tabId}-panel`;
}

function renderTabBody(activeTab: DmToolsTabId) {
  const tabId = getTabButtonId(activeTab);
  const panelId = getTabPanelId(activeTab);

  switch (activeTab) {
    case "party-manager":
      return <PartyManagerBody panelId={panelId} tabId={tabId} />;
    case "encounter-templates":
      return <EncounterTemplatesBody panelId={panelId} tabId={tabId} />;
    case "campaign-manager":
    default:
      return <CampaignManagerBody panelId={panelId} tabId={tabId} />;
  }
}

function DmToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseDmToolsTabId(searchParams.get(DM_TOOLS_TAB_PARAM));

  function handleTabChange(nextTab: DmToolsTabId) {
    if (nextTab === activeTab) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set(DM_TOOLS_TAB_PARAM, nextTab);
    setSearchParams(nextSearchParams);
  }

  return (
    <section className={styles.page}>
      <section className={styles.panel} aria-labelledby="dm-tools-title">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              <LayoutDashboard size={15} aria-hidden="true" />
              <span>DM tools</span>
            </p>
            <h2 id="dm-tools-title" className={styles.title}>
              Prep Tray
            </h2>
          </div>
        </div>

        <div className={styles.tabRow} role="tablist" aria-label="DM tool sections">
          {DM_TOOLS_TABS.map(({ icon: TabIcon, id, label }) => {
            const selected = id === activeTab;

            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={getTabButtonId(id)}
                aria-controls={getTabPanelId(id)}
                aria-selected={selected}
                className={selected ? `${styles.tabButton} ${styles.tabButtonActive}` : styles.tabButton}
                onClick={() => handleTabChange(id)}
              >
                <TabIcon size={16} aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {renderTabBody(activeTab)}
      </section>
    </section>
  );
}

export default DmToolsPage;
