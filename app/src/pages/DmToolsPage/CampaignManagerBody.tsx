import { Plus, ScrollText, Trash2 } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCampaign, listCampaigns, type CampaignRecord } from "../../api/campaigns";
import ActionButton from "../../components/ActionButton";
import { DestructiveConfirmationModal } from "../../components/Overlay";
import {
  removeCampaignRecord,
  setCampaigns,
  setCampaignsError,
  setCampaignsLoading,
  showToast,
  useAppDispatch,
  useAppSelector
} from "../../store";
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

function getDeleteCampaignMessage(campaign: CampaignRecord): ReactNode {
  return (
    <>
      Delete <strong>{campaign.name}</strong>, including its session notes and prepared encounters.
    </>
  );
}

function CampaignManagerBody({ panelId, tabId }: CampaignManagerBodyProps) {
  const deleteTitleId = useId();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const authUserRole = useAppSelector((state) => state.auth.user?.role ?? null);
  const campaigns = useAppSelector((state) => state.dmTools.campaigns);
  const campaignsStatus = useAppSelector((state) => state.dmTools.campaignsStatus);
  const campaignsError = useAppSelector((state) => state.dmTools.campaignsError);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pendingDeleteCampaign, setPendingDeleteCampaign] = useState<CampaignRecord | null>(null);
  const [isDeletingCampaign, setIsDeletingCampaign] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
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

  async function handleConfirmDeleteCampaign() {
    if (!pendingDeleteCampaign || isDeletingCampaign) {
      return;
    }

    setActionError(null);
    setIsDeletingCampaign(true);

    try {
      const { campaignId } = await deleteCampaign(pendingDeleteCampaign.id, {
        suppressFailureToast: true
      });

      dispatch(removeCampaignRecord(campaignId));
      dispatch(
        showToast({
          text: "Campaign deleted.",
          type: "success"
        })
      );
      setPendingDeleteCampaign(null);
    } catch (deleteError) {
      setActionError(getDmToolsApiErrorMessage(deleteError, "Unable to delete campaign."));
    } finally {
      setIsDeletingCampaign(false);
    }
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

      {actionError ? <p className={styles.modalError}>{actionError}</p> : null}

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
              to={`/gm-tools/campaign-manager/${campaign.id}`}
              actions={[
                {
                  disabled: isDeletingCampaign,
                  icon: <Trash2 size={18} aria-hidden="true" />,
                  label: `Delete ${campaign.name}`,
                  onClick: () => {
                    setActionError(null);
                    setPendingDeleteCampaign(campaign);
                  }
                }
              ]}
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
            navigate(`/gm-tools/campaign-manager/${campaignId}`);
          }}
        />
      ) : null}
      {pendingDeleteCampaign ? (
        <DestructiveConfirmationModal
          titleId={deleteTitleId}
          title="Delete campaign?"
          message={getDeleteCampaignMessage(pendingDeleteCampaign)}
          confirmLabel={isDeletingCampaign ? "Deleting..." : "Delete"}
          closeLabel="Close delete campaign confirmation"
          onCancel={() => setPendingDeleteCampaign(null)}
          onConfirm={() => {
            void handleConfirmDeleteCampaign();
          }}
        />
      ) : null}
    </section>
  );
}

export default CampaignManagerBody;
