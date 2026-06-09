import { Users, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateCampaignSelectedParty, type CampaignDetailRecord } from "../../api/campaigns";
import ActionButton from "../../components/ActionButton";
import { patchSelectedCampaign, useAppDispatch } from "../../store";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import CampaignPartyPickerModal from "./CampaignPartyPickerModal";
import DmToolsEmptyState from "./DmToolsEmptyState";
import DmToolsListCard from "./DmToolsListCard";
import styles from "./DmToolsPage.module.css";

type CampaignSelectedPartySectionProps = {
  campaign: CampaignDetailRecord;
};

function CampaignSelectedPartySection({ campaign }: CampaignSelectedPartySectionProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleSelectedPartyChange(partyGroupId: string | null) {
    if (isSaving) {
      return;
    }

    setActionError(null);
    setIsSaving(true);

    try {
      const campaignPatch = await updateCampaignSelectedParty(campaign.id, partyGroupId, {
        suppressFailureToast: true
      });

      dispatch(patchSelectedCampaign(campaignPatch));
    } catch (saveError) {
      setActionError(getDmToolsApiErrorMessage(saveError, "Unable to update selected party."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section
      className={`${styles.membersPanel} ${styles.campaignDetailSummaryPanel}`}
      aria-labelledby="campaign-party-title"
    >
      <div className={styles.memberPanelHeader}>
        <div>
          <h3 id="campaign-party-title" className={styles.bodyTitle}>
            Selected Party
          </h3>
        </div>
      </div>

      {actionError ? <p className={styles.modalError}>{actionError}</p> : null}

      {campaign.selectedParty ? (
        <DmToolsListCard
          icon={<Users size={18} aria-hidden="true" />}
          title={campaign.selectedParty.name}
          meta={`${campaign.selectedParty.memberCount} ${
            campaign.selectedParty.memberCount === 1 ? "member" : "members"
          }`}
          tone="party"
          onClick={() =>
            navigate(
              `/gm-tools/party-manager/${campaign.selectedParty?.id}?returnToCampaign=${campaign.id}`
            )
          }
          actions={[
            {
              disabled: isSaving,
              icon: <X size={18} aria-hidden="true" />,
              label: `Remove ${campaign.selectedParty.name}`,
              onClick: () => {
                void handleSelectedPartyChange(null);
              },
              title: `Remove ${campaign.selectedParty.name}`
            }
          ]}
        />
      ) : (
        <div className={styles.selectedPartyEmptyRow}>
          <DmToolsEmptyState icon={<Users size={18} aria-hidden="true" />}>
            No selected party yet
          </DmToolsEmptyState>
          <ActionButton
            icon={<Users size={18} aria-hidden="true" />}
            disabled={isSaving}
            fullWidth={false}
            onClick={() => setIsPickerOpen(true)}
          >
            Select Party
          </ActionButton>
        </div>
      )}

      {isPickerOpen ? (
        <CampaignPartyPickerModal
          isSaving={isSaving}
          selectedPartyId={campaign.selectedParty?.id}
          onClose={() => setIsPickerOpen(false)}
          onSelectParty={handleSelectedPartyChange}
        />
      ) : null}
    </section>
  );
}

export default CampaignSelectedPartySection;
