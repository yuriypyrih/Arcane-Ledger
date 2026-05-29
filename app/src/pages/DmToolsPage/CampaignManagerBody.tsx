import { Plus, ScrollText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listCampaigns } from "../../api/campaigns";
import ActionButton from "../../components/ActionButton";
import {
  setCampaigns,
  setCampaignsError,
  setCampaignsLoading,
  showToast,
  useAppDispatch,
  useAppSelector
} from "../../store";
import CampaignManagerGuideButton from "./CampaignManagerGuideButton";
import CampaignManagerGuideModal from "./CampaignManagerGuideModal";
import CreateCampaignModal from "./CreateCampaignModal";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import { getDmToolsQuotaForRole } from "./dmToolsQuotas";
import DmToolsEmptyState from "./DmToolsEmptyState";
import DmToolsListCard from "./DmToolsListCard";
import styles from "./DmToolsPage.module.css";

type CampaignManagerBodyProps = {
  panelId: string;
  tabId: string;
};

function CampaignManagerBody({ panelId, tabId }: CampaignManagerBodyProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const authUserRole = useAppSelector((state) => state.auth.user?.role ?? null);
  const campaigns = useAppSelector((state) => state.dmTools.campaigns);
  const campaignsStatus = useAppSelector((state) => state.dmTools.campaignsStatus);
  const campaignsError = useAppSelector((state) => state.dmTools.campaignsError);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const loadedCampaignsForAuthRef = useRef<string | null>(null);
  const isAuthenticated = authStatus === "authenticated";
  const campaignLimit = getDmToolsQuotaForRole("campaigns", authUserRole);
  const isAtCampaignLimit = isAuthenticated && campaigns.length >= campaignLimit;

  useEffect(() => {
    let didCancel = false;
    const loadKey = isAuthenticated ? authUserId : null;

    if (!loadKey) {
      loadedCampaignsForAuthRef.current = null;
      return () => {
        didCancel = true;
      };
    }

    if (loadedCampaignsForAuthRef.current === loadKey) {
      return () => {
        didCancel = true;
      };
    }

    loadedCampaignsForAuthRef.current = loadKey;
    dispatch(setCampaignsLoading());

    void listCampaigns({ suppressFailureToast: true })
      .then(({ campaigns: nextCampaigns }) => {
        if (!didCancel) {
          dispatch(setCampaigns(nextCampaigns));
        }
      })
      .catch((error) => {
        if (!didCancel) {
          dispatch(setCampaignsError(getDmToolsApiErrorMessage(error, "Unable to load campaigns.")));
          loadedCampaignsForAuthRef.current = null;
        }
      });

    return () => {
      didCancel = true;
    };
  }, [authUserId, dispatch, isAuthenticated]);

  function handleCreateClick() {
    if (!isAuthenticated) {
      dispatch(
        showToast({
          text: "Sign in to create campaigns.",
          type: "warning"
        })
      );
      return;
    }

    if (isAtCampaignLimit) {
      dispatch(
        showToast({
          text: `You can create up to ${campaignLimit} campaigns.`,
          type: "warning"
        })
      );
      return;
    }

    setCreateModalOpen(true);
  }

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
          <div className={styles.bodyEyebrowHelpRow}>
            <p className={styles.bodyEyebrow}>Campaign Manager</p>
            <CampaignManagerGuideButton onClick={() => setIsGuideOpen(true)} />
          </div>
          <h3 className={styles.bodyTitle}>Campaigns</h3>
        </div>
        <div className={styles.headerActions}>
          {isAuthenticated ? (
            <span className={styles.memberCount}>
              {campaigns.length}/{campaignLimit} campaigns
            </span>
          ) : null}
          <ActionButton
            icon={<Plus size={16} aria-hidden="true" />}
            disabled={isAtCampaignLimit}
            fullWidth={false}
            title={isAtCampaignLimit ? `You can create up to ${campaignLimit} campaigns.` : undefined}
            onClick={handleCreateClick}
          >
            Create Campaign
          </ActionButton>
        </div>
      </div>

      {campaignsStatus === "loading" ? (
        <DmToolsEmptyState icon={<ScrollText size={18} aria-hidden="true" />}>
          Loading campaigns...
        </DmToolsEmptyState>
      ) : campaignsError ? (
        <p className={styles.modalError}>{campaignsError}</p>
      ) : !isAuthenticated ? (
        <DmToolsEmptyState icon={<ScrollText size={18} aria-hidden="true" />}>
          Sign in to manage campaigns.
        </DmToolsEmptyState>
      ) : campaigns.length > 0 ? (
        <div className={styles.dmToolsList}>
          {campaigns.map((campaign) => (
            <DmToolsListCard
              key={campaign.id}
              icon={<ScrollText size={18} aria-hidden="true" />}
              title={campaign.name}
              meta={`${campaign.sessionNoteCount} ${
                campaign.sessionNoteCount === 1 ? "session note" : "session notes"
              } · ${campaign.preparedEncounterCount} ${
                campaign.preparedEncounterCount === 1 ? "encounter" : "encounters"
              }`}
              to={`/dm-tools/campaign-manager/${campaign.id}`}
            />
          ))}
        </div>
      ) : (
        <DmToolsEmptyState icon={<ScrollText size={18} aria-hidden="true" />}>
          No campaigns yet.
        </DmToolsEmptyState>
      )}

      {createModalOpen ? (
        <CreateCampaignModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={(campaignId) => {
            setCreateModalOpen(false);
            navigate(`/dm-tools/campaign-manager/${campaignId}`);
          }}
        />
      ) : null}
      {isGuideOpen ? <CampaignManagerGuideModal onClose={() => setIsGuideOpen(false)} /> : null}
    </section>
  );
}

export default CampaignManagerBody;
