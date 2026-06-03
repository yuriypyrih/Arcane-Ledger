import { ScrollText } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCampaign,
  startCampaignLiveEncounterTracker,
  type CampaignPreparedEncounterRecord
} from "../../api/campaigns";
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
import CampaignPreparedEncountersSection from "./CampaignPreparedEncountersSection";
import CampaignSelectedPartySection from "./CampaignSelectedPartySection";
import CampaignSessionNotesSection from "./CampaignSessionNotesSection";
import CampaignVisibilitySettingsButton from "./CampaignVisibilitySettingsSection";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import EditCampaignModal from "./EditCampaignModal";
import styles from "./DmToolsPage.module.css";

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
              <DmToolsEditButton onClick={() => setIsEditModalOpen(true)}>
                Edit
              </DmToolsEditButton>
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
            <div className={styles.campaignDetailLayout}>
              <div className={styles.campaignDetailColumn}>
                <CampaignSelectedPartySection campaign={campaign} />
                <CampaignSessionNotesSection campaign={campaign} />
              </div>
              <div className={styles.campaignDetailColumn}>
                <CampaignEncounterTrackerSection campaign={campaign} />
                <CampaignPreparedEncountersSection
                  campaign={campaign}
                  onStartEncounter={handleStartEncounter}
                />
              </div>
            </div>

            {isEditModalOpen ? (
              <EditCampaignModal campaign={campaign} onClose={() => setIsEditModalOpen(false)} />
            ) : null}
          </>
        ) : null}
        {isGuideOpen ? (
          <CampaignManagerGuideModal onClose={() => setIsGuideOpen(false)} />
        ) : null}
      </section>
    </section>
  );
}

export default CampaignDetailPage;
