import { AlertTriangle, Play, Swords, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  removeCampaignLiveEncounterTracker,
  type CampaignDetailRecord
} from "../../api/campaigns";
import { patchSelectedCampaign, useAppDispatch } from "../../store";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import DmToolsEmptyState from "./DmToolsEmptyState";
import DmToolsListCard from "./DmToolsListCard";
import styles from "./DmToolsPage.module.css";

type CampaignEncounterTrackerSectionProps = {
  campaign: CampaignDetailRecord;
};

function CampaignEncounterTrackerSection({ campaign }: CampaignEncounterTrackerSectionProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isRemovingTracker, setIsRemovingTracker] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const tracker = campaign.liveEncounterTracker;
  const isTrackerInvalid = tracker?.status.state === "invalid";

  async function handleRemoveTracker() {
    if (isRemovingTracker) {
      return;
    }

    setActionError(null);
    setIsRemovingTracker(true);

    try {
      const campaignPatch = await removeCampaignLiveEncounterTracker(campaign.id, {
        suppressFailureToast: true
      });

      dispatch(patchSelectedCampaign(campaignPatch));
    } catch (removeError) {
      setActionError(
        getDmToolsApiErrorMessage(removeError, "Unable to remove active encounter.")
      );
    } finally {
      setIsRemovingTracker(false);
    }
  }

  return (
    <section
      className={`${styles.membersPanel} ${styles.campaignDetailSummaryPanel}`}
      aria-labelledby="campaign-encounter-tracker-title"
    >
      <div className={styles.memberPanelHeader}>
        <div>
          <h3 id="campaign-encounter-tracker-title" className={styles.bodyTitle}>
            Encounter Tracker
          </h3>
        </div>
      </div>

      {actionError ? <p className={styles.modalError}>{actionError}</p> : null}

      {tracker ? (
        <DmToolsListCard
          icon={
            isTrackerInvalid ? (
              <AlertTriangle size={18} aria-hidden="true" />
            ) : (
              <Swords size={18} aria-hidden="true" />
            )
          }
          title={isTrackerInvalid ? "ENCOUNTER TRACKER INVALID" : "ENCOUNTER IN PROGRESS"}
          meta={
            tracker.status.state === "invalid"
              ? tracker.status.message
              : tracker.preparedEncounterName
          }
          tone={isTrackerInvalid ? "danger" : "encounter"}
          onClick={
            isTrackerInvalid
              ? undefined
              : () => navigate(`/gm-tools/campaign-manager/${campaign.id}/live-encounter`)
          }
          actions={[
            {
              icon: <X size={18} aria-hidden="true" />,
              label: "Remove active encounter",
              onClick: () => {
                void handleRemoveTracker();
              },
              title: isRemovingTracker ? "Removing..." : "Remove active encounter",
              disabled: isRemovingTracker
            }
          ]}
        />
      ) : (
        <DmToolsEmptyState icon={<Swords size={18} aria-hidden="true" />}>
          There is no active encounter. Press the{" "}
          <span className={styles.inlineIconButtonGlyph} role="img" aria-label="play">
            <Play size={13} aria-hidden="true" />
          </span>{" "}
          button on a prepared encounter
        </DmToolsEmptyState>
      )}
    </section>
  );
}

export default CampaignEncounterTrackerSection;
