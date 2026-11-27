import { ScrollText, UsersRound } from "lucide-react";
import { type KeyboardEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCampaign,
  startCampaignLiveEncounterTracker,
  type CampaignPreparedEncounterRecord
} from "../../api/campaigns";
import ExternalImage from "../../components/ExternalImage";
import {
  patchSelectedCampaign,
  setSelectedCampaign,
  setSelectedCampaignError,
  setSelectedCampaignLoading,
  useAppDispatch,
  useAppSelector
} from "../../store";
import DmToolsBackButton from "./DmToolsBackButton";
import DmToolsEditButton from "./DmToolsEditButton";
import DmToolsEmptyState from "./DmToolsEmptyState";
import CampaignManagerGuideButton from "./CampaignManagerGuideButton";
import CampaignManagerGuideModal from "./CampaignManagerGuideModal";
import CampaignEncounterTrackerSection from "./CampaignEncounterTrackerSection";
import CampaignPlayersTab from "./CampaignPlayersTab";
import CampaignPreparedEncountersSection from "./CampaignPreparedEncountersSection";
import CampaignSelectedPartySection from "./CampaignSelectedPartySection";
import CampaignSessionNotesSection from "./CampaignSessionNotesSection";
import CampaignSessionsSection from "./CampaignSessionsSection";
import CampaignVisibilitySettingsButton from "./CampaignVisibilitySettingsSection";
import detailStyles from "./CampaignDetailPage.module.css";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import EditCampaignModal from "./EditCampaignModal";
import styles from "./DmToolsPage.module.css";

type CampaignTab = "overview" | "players";

const CAMPAIGN_TABS: { id: CampaignTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "players", label: "Players" }
];

function CampaignDetailPage() {
  const { campaignId = "" } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const campaign = useAppSelector((state) => state.dmTools.selectedCampaignsById[campaignId]);
  const status = useAppSelector(
    (state) => state.dmTools.selectedCampaignStatusById[campaignId] ?? "idle"
  );
  const error = useAppSelector(
    (state) => state.dmTools.selectedCampaignErrorById[campaignId] ?? null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CampaignTab>("overview");

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

    setActiveTab(next.id);
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
          {campaign ? (
            <div className={styles.headerActions}>
              <CampaignVisibilitySettingsButton campaign={campaign} />
              <DmToolsEditButton onClick={() => setIsEditModalOpen(true)}>Edit</DmToolsEditButton>
            </div>
          ) : null}
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
              {CAMPAIGN_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`campaign-tab-${tab.id}`}
                  aria-controls={`campaign-panel-${tab.id}`}
                  aria-selected={activeTab === tab.id}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  className={detailStyles.tab}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={handleTabKeyDown}
                >
                  {tab.id === "players" ? <UsersRound size={16} aria-hidden="true" /> : null}
                  {tab.label}
                </button>
              ))}
            </div>
            <div
              role="tabpanel"
              id="campaign-panel-players"
              aria-labelledby="campaign-tab-players"
              hidden={activeTab !== "players"}
            >
              {activeTab === "players" ? (
                <CampaignPlayersTab
                  campaignId={campaign.id}
                  hasParty={campaign.selectedPartyId !== null}
                />
              ) : null}
            </div>
            <div
              role="tabpanel"
              id="campaign-panel-overview"
              aria-labelledby="campaign-tab-overview"
              hidden={activeTab !== "overview"}
              className={detailStyles.workspace}
            >
              <CampaignSelectedPartySection
                campaign={campaign}
                className={detailStyles.partyPanel}
              />

              <CampaignEncounterTrackerSection
                campaign={campaign}
                className={detailStyles.trackerPanel}
              />

              <CampaignPreparedEncountersSection
                campaign={campaign}
                className={detailStyles.encountersPanel}
                listClassName={detailStyles.encountersList}
                onStartEncounter={handleStartEncounter}
              />

              <CampaignSessionsSection
                campaignId={campaign.id}
                className={detailStyles.sessionsPanel}
                hasLiveEncounter={campaign.liveEncounterTracker !== null}
                partyGroupId={campaign.selectedPartyId}
                preparedEncounters={campaign.preparedEncounters}
              />

              <CampaignSessionNotesSection
                campaign={campaign}
                className={detailStyles.notesPanel}
                listClassName={detailStyles.notesList}
              />
            </div>

            {isEditModalOpen ? (
              <EditCampaignModal campaign={campaign} onClose={() => setIsEditModalOpen(false)} />
            ) : null}
          </>
        ) : null}
        {isGuideOpen ? <CampaignManagerGuideModal onClose={() => setIsGuideOpen(false)} /> : null}
      </section>
    </section>
  );
}

export default CampaignDetailPage;
