import { CalendarDays, NotebookPen, ScrollText, Settings, Swords, UsersRound } from "lucide-react";
import { type KeyboardEvent, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getCampaign,
  startCampaignLiveEncounterTracker,
  type CampaignPreparedEncounterRecord
} from "../../api/campaigns";
import ActionButton from "../../components/ActionButton";
import ExternalImage from "../../components/ExternalImage";
import {
  patchSelectedCampaign,
  setSelectedCampaign,
  setSelectedCampaignError,
  setSelectedCampaignLoading,
  useAppDispatch,
  useAppSelector
} from "../../store";
import { useState } from "react";
import DmToolsBackButton from "./DmToolsBackButton";
import DmToolsEmptyState from "./DmToolsEmptyState";
import CampaignManagerGuideButton from "./CampaignManagerGuideButton";
import CampaignManagerGuideModal from "./CampaignManagerGuideModal";
import CampaignEncounterTrackerSection from "./CampaignEncounterTrackerSection";
import CampaignPlayersTab from "./CampaignPlayersTab";
import CampaignPreparedEncountersSection from "./CampaignPreparedEncountersSection";
import CampaignSelectedPartySection from "./CampaignSelectedPartySection";
import CampaignSessionNotesSection from "./CampaignSessionNotesSection";
import CampaignSessionsSection from "./CampaignSessionsSection";
import CampaignSettingsTab from "./CampaignSettingsTab";
import detailStyles from "./CampaignDetailPage.module.css";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import styles from "./DmToolsPage.module.css";

type CampaignTab = "play" | "sessions" | "prep" | "players" | "settings";

/** One job per tab, so a GM only sees what the moment needs. */
const CAMPAIGN_TABS: { icon: typeof Swords; id: CampaignTab; intro: string; label: string }[] = [
  {
    id: "play",
    label: "Play",
    icon: Swords,
    intro: "Run the table. Open the live encounter tracker when combat starts."
  },
  {
    id: "sessions",
    label: "Sessions",
    icon: CalendarDays,
    intro: "Schedule sessions, start and end them, and write the log your players read afterward."
  },
  {
    id: "prep",
    label: "Prep",
    icon: NotebookPen,
    intro: "Get ready between sessions: prepare encounters and keep your session notes."
  },
  {
    id: "players",
    label: "Players",
    icon: UsersRound,
    intro: "Choose the party and see who can make each session."
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    intro: "The campaign's name and picture, and what your players see by default."
  }
];

function isCampaignTab(value: string | null): value is CampaignTab {
  return CAMPAIGN_TABS.some((tab) => tab.id === value);
}

function CampaignDetailPage() {
  const { campaignId = "" } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const authStatus = useAppSelector((state) => state.auth.status);
  const campaign = useAppSelector((state) => state.dmTools.selectedCampaignsById[campaignId]);
  const status = useAppSelector(
    (state) => state.dmTools.selectedCampaignStatusById[campaignId] ?? "idle"
  );
  const error = useAppSelector(
    (state) => state.dmTools.selectedCampaignErrorById[campaignId] ?? null
  );
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  // The address names the tab (and a session to open), so notifications and emails can link straight to it.
  const requestedTab = searchParams.get("tab");
  const activeTab: CampaignTab = isCampaignTab(requestedTab) ? requestedTab : "play";
  const focusSessionId = activeTab === "sessions" ? searchParams.get("session") : null;
  const activeTabInfo = CAMPAIGN_TABS.find((tab) => tab.id === activeTab)!;

  function selectTab(tab: CampaignTab) {
    setSearchParams({ tab }, { replace: true });
  }

  useEffect(() => {
    let didCancel = false;

    if (!campaignId || authStatus !== "authenticated") {
      return () => {
        didCancel = true;
      };
    }

    dispatch(setSelectedCampaignLoading(campaignId));

    void getCampaign(campaignId, { suppressFailureToast: true })
      .then(({ campaign: nextCampaign }) => {
        if (!didCancel) {
          dispatch(setSelectedCampaign(nextCampaign));
        }
      })
      .catch((loadError) => {
        if (!didCancel) {
          dispatch(
            setSelectedCampaignError({
              campaignId,
              error: getDmToolsApiErrorMessage(loadError, "Unable to load campaign.")
            })
          );
        }
      });

    return () => {
      didCancel = true;
    };
  }, [authStatus, campaignId, dispatch]);

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }

    event.preventDefault();

    const index = CAMPAIGN_TABS.findIndex((tab) => tab.id === activeTab);
    const step = event.key === "ArrowRight" ? 1 : CAMPAIGN_TABS.length - 1;
    const next = CAMPAIGN_TABS[(index + step) % CAMPAIGN_TABS.length]!;

    selectTab(next.id);
    document.getElementById(`campaign-tab-${next.id}`)?.focus();
  }

  async function handleStartEncounter(encounter: CampaignPreparedEncounterRecord) {
    const campaignPatch = await startCampaignLiveEncounterTracker(campaignId, encounter.id, {
      suppressFailureToast: true
    });

    dispatch(patchSelectedCampaign(campaignPatch));
    navigate(`/gm-tools/campaign-manager/${campaignId}/live-encounter`);
  }

  return (
    <section className={styles.page}>
      <DmToolsBackButton onClick={() => navigate("/gm-tools?tab=campaign-manager")}>
        Back to GM Tools
      </DmToolsBackButton>

      <section className={styles.panel} aria-labelledby="campaign-title">
        <div className={styles.header}>
          <div>
            <div className={styles.eyebrowHelpRow}>
              <p className={styles.eyebrow}>
                <ScrollText size={15} aria-hidden="true" />
                <span>Campaign Manager</span>
              </p>
              <CampaignManagerGuideButton onClick={() => setIsGuideOpen(true)} />
            </div>
            <h2 id="campaign-title" className={styles.title}>
              {campaign?.name ?? "Campaign"}
            </h2>
          </div>
        </div>

        {authStatus !== "authenticated" ? (
          <DmToolsEmptyState icon={<ScrollText size={18} aria-hidden="true" />}>
            Sign in to view this campaign.
          </DmToolsEmptyState>
        ) : status === "loading" ? (
          <DmToolsEmptyState icon={<ScrollText size={18} aria-hidden="true" />}>
            Loading campaign...
          </DmToolsEmptyState>
        ) : error ? (
          <p className={styles.modalError}>{error}</p>
        ) : campaign ? (
          <>
            <ExternalImage
              src={campaign.imageUrl}
              className={styles.campaignCover}
              fallback={null}
            />
            <div role="tablist" aria-label="Campaign sections" className={detailStyles.tabs}>
              {CAMPAIGN_TABS.map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`campaign-tab-${tab.id}`}
                    aria-controls={`campaign-panel-${tab.id}`}
                    aria-selected={activeTab === tab.id}
                    tabIndex={activeTab === tab.id ? 0 : -1}
                    className={detailStyles.tab}
                    onClick={() => selectTab(tab.id)}
                    onKeyDown={handleTabKeyDown}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              id={`campaign-panel-${activeTab}`}
              aria-labelledby={`campaign-tab-${activeTab}`}
              className={detailStyles.stack}
            >
              <p className={detailStyles.intro}>{activeTabInfo.intro}</p>

              {activeTab === "play" ? (
                <>
                  <CampaignEncounterTrackerSection campaign={campaign} />
                  {campaign.liveEncounterTracker ? null : (
                    <div>
                      <ActionButton
                        variant="OUTLINE"
                        fullWidth={false}
                        icon={<NotebookPen size={16} aria-hidden="true" />}
                        onClick={() => selectTab("prep")}
                      >
                        Go to Prep to start an encounter
                      </ActionButton>
                    </div>
                  )}
                </>
              ) : null}

              {activeTab === "sessions" ? (
                <CampaignSessionsSection
                  campaignId={campaign.id}
                  focusSessionId={focusSessionId}
                  hasLiveEncounter={campaign.liveEncounterTracker !== null}
                  partyGroupId={campaign.selectedPartyId}
                  preparedEncounters={campaign.preparedEncounters}
                />
              ) : null}

              {activeTab === "prep" ? (
                <>
                  <CampaignPreparedEncountersSection
                    campaign={campaign}
                    listClassName={detailStyles.encountersList}
                    onStartEncounter={handleStartEncounter}
                  />
                  <CampaignSessionNotesSection
                    campaign={campaign}
                    listClassName={detailStyles.notesList}
                  />
                </>
              ) : null}

              {activeTab === "players" ? (
                <>
                  <CampaignSelectedPartySection campaign={campaign} />
                  <CampaignPlayersTab
                    campaignId={campaign.id}
                    hasParty={campaign.selectedPartyId !== null}
                  />
                </>
              ) : null}

              {activeTab === "settings" ? <CampaignSettingsTab campaign={campaign} /> : null}
            </div>
          </>
        ) : null}
        {isGuideOpen ? <CampaignManagerGuideModal onClose={() => setIsGuideOpen(false)} /> : null}
      </section>
    </section>
  );
}

export default CampaignDetailPage;
