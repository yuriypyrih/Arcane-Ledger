import { LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import CampaignManagerGuideButton from "./CampaignManagerGuideButton";
import CampaignManagerGuideModal from "./CampaignManagerGuideModal";
import CampaignManagerBody from "./CampaignManagerBody";
import CustomSpellsBody from "./CustomSpellsBody";
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

const tabToneClassNames: Record<DmToolsTabId, string> = {
  "campaign-manager": styles.toolToneCampaign,
  "custom-spells": styles.toolToneCustomSpell,
  "encounter-templates": styles.toolToneEncounter,
  "party-manager": styles.toolToneParty
};

function getTabClassName(tabId: DmToolsTabId, selected: boolean) {
  const classNames = [styles.tabButton, tabToneClassNames[tabId]];

  if (selected) {
    classNames.push(styles.tabButtonActive);
  }

  return classNames.join(" ");
}

function renderTabBody(activeTab: DmToolsTabId) {
  const tabId = getTabButtonId(activeTab);
  const panelId = getTabPanelId(activeTab);

  switch (activeTab) {
    case "party-manager":
      return <PartyManagerBody panelId={panelId} tabId={tabId} />;
    case "encounter-templates":
      return <EncounterTemplatesBody panelId={panelId} tabId={tabId} />;
    case "custom-spells":
      return <CustomSpellsBody panelId={panelId} tabId={tabId} />;
    case "campaign-manager":
    default:
      return <CampaignManagerBody panelId={panelId} tabId={tabId} />;
  }
}

function DmToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
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
            <div className={styles.eyebrowHelpRow}>
              <p className={styles.eyebrow}>
                <LayoutDashboard size={15} aria-hidden="true" />
                <span>GM tools</span>
              </p>
              <CampaignManagerGuideButton onClick={() => setIsGuideOpen(true)} />
            </div>
            <h2 id="dm-tools-title" className={styles.title}>
              Prep Tray
            </h2>
          </div>
        </div>

        <div className={styles.tabRow} role="tablist" aria-label="GM tool sections">
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
                className={getTabClassName(id, selected)}
                onClick={() => handleTabChange(id)}
              >
                <TabIcon size={16} aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {renderTabBody(activeTab)}

        {isGuideOpen ? <CampaignManagerGuideModal onClose={() => setIsGuideOpen(false)} /> : null}
      </section>
    </section>
  );
}

export default DmToolsPage;
