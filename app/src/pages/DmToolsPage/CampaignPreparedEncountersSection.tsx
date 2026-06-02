import { Download, Play, Plus, Swords, Trash2 } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createCampaignPreparedEncounter,
  removeCampaignPreparedEncounter,
  type CampaignDetailRecord,
  type CampaignPreparedEncounterRecord
} from "../../api/campaigns";
import ActionButton from "../../components/ActionButton";
import { DestructiveConfirmationModal } from "../../components/Overlay";
import {
  CAMPAIGN_MAX_PREPARED_ENCOUNTERS,
  ENCOUNTER_MAX_CREATURES
} from "../../constants/QUOTAS";
import { patchSelectedCampaign, useAppDispatch } from "../../store";
import CampaignCopyEncounterTemplateModal from "./CampaignCopyEncounterTemplateModal";
import CampaignPreparedEncounterModal from "./CampaignPreparedEncounterModal";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import DmToolsEmptyState from "./DmToolsEmptyState";
import DmToolsListCard from "./DmToolsListCard";
import styles from "./DmToolsPage.module.css";

type CampaignPreparedEncountersSectionProps = {
  campaign: CampaignDetailRecord;
  onStartEncounter: (encounter: CampaignPreparedEncounterRecord) => void;
};

function getDeletePreparedEncounterMessage(encounter: CampaignPreparedEncounterRecord): ReactNode {
  return (
    <>
      Delete <strong>{encounter.name}</strong> and its prepared creatures from this campaign.
    </>
  );
}

function CampaignPreparedEncountersSection({
  campaign,
  onStartEncounter
}: CampaignPreparedEncountersSectionProps) {
  const deleteEncounterTitleId = useId();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [pendingDeleteEncounter, setPendingDeleteEncounter] =
    useState<CampaignPreparedEncounterRecord | null>(null);
  const [isDeletingEncounter, setIsDeletingEncounter] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const isAtPreparedEncounterLimit =
    campaign.preparedEncounters.length >= CAMPAIGN_MAX_PREPARED_ENCOUNTERS;
  const preparedEncounterLimitMessage = `Campaigns can hold up to ${CAMPAIGN_MAX_PREPARED_ENCOUNTERS} prepared encounters.`;
  const hasSelectedParty = Boolean(campaign.selectedParty);

  async function handleCreatePreparedEncounter(name: string) {
    const campaignPatch = await createCampaignPreparedEncounter(campaign.id, name, {
      suppressFailureToast: true
    });

    dispatch(patchSelectedCampaign(campaignPatch));
    setActionError(null);
  }

  async function handleConfirmDeleteEncounter() {
    if (!pendingDeleteEncounter || isDeletingEncounter) {
      return;
    }

    setActionError(null);
    setIsDeletingEncounter(true);

    try {
      const campaignPatch = await removeCampaignPreparedEncounter(
        campaign.id,
        pendingDeleteEncounter.id,
        { suppressFailureToast: true }
      );

      dispatch(patchSelectedCampaign(campaignPatch));
      setPendingDeleteEncounter(null);
    } catch (deleteError) {
      setActionError(
        getDmToolsApiErrorMessage(deleteError, "Unable to delete prepared encounter.")
      );
    } finally {
      setIsDeletingEncounter(false);
    }
  }

  return (
    <section className={styles.membersPanel} aria-labelledby="campaign-prepared-encounters-title">
      <div className={styles.memberPanelHeader}>
        <div>
          <h3 id="campaign-prepared-encounters-title" className={styles.bodyTitle}>
            Prepared Encounters
          </h3>
        </div>
        <span className={styles.memberCount}>
          {campaign.preparedEncounters.length}/{CAMPAIGN_MAX_PREPARED_ENCOUNTERS} encounters
        </span>
      </div>

      <div className={styles.panelActionsRow}>
        <ActionButton
          icon={<Plus size={16} aria-hidden="true" />}
          disabled={isAtPreparedEncounterLimit}
          fullWidth={false}
          title={isAtPreparedEncounterLimit ? preparedEncounterLimitMessage : undefined}
          onClick={() => {
            setActionError(null);
            setIsCreateModalOpen(true);
          }}
        >
          Create Encounter
        </ActionButton>
        <ActionButton
          icon={<Download size={16} aria-hidden="true" />}
          variant="OUTLINE"
          disabled={isAtPreparedEncounterLimit}
          fullWidth={false}
          title={isAtPreparedEncounterLimit ? preparedEncounterLimitMessage : undefined}
          onClick={() => {
            setActionError(null);
            setIsCopyModalOpen(true);
          }}
        >
          Import Template
        </ActionButton>
      </div>

      {actionError ? <p className={styles.modalError}>{actionError}</p> : null}

      {campaign.preparedEncounters.length > 0 ? (
        <div className={styles.dmToolsList}>
          {campaign.preparedEncounters.map((encounter) => (
            <DmToolsListCard
              key={encounter.id}
              icon={<Swords size={18} aria-hidden="true" />}
              title={encounter.name}
              meta={`${encounter.creatures.length}/${ENCOUNTER_MAX_CREATURES} creatures`}
              onClick={() =>
                navigate(`/gm-tools/campaign-manager/${campaign.id}/encounters/${encounter.id}`)
              }
              actions={[
                {
                  disabled: !hasSelectedParty,
                  icon: <Play size={18} aria-hidden="true" />,
                  label: `Start ${encounter.name}`,
                  onClick: () => onStartEncounter(encounter),
                  title: hasSelectedParty
                    ? `Start ${encounter.name}`
                    : "Select a party before starting an encounter."
                },
                {
                  icon: <Trash2 size={18} aria-hidden="true" />,
                  label: `Delete ${encounter.name}`,
                  onClick: () => setPendingDeleteEncounter(encounter)
                }
              ]}
            />
          ))}
        </div>
      ) : (
        <DmToolsEmptyState icon={<Swords size={18} aria-hidden="true" />}>
          No prepared encounters yet.
        </DmToolsEmptyState>
      )}

      {isCreateModalOpen ? (
        <CampaignPreparedEncounterModal
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreatePreparedEncounter}
        />
      ) : null}
      {isCopyModalOpen ? (
        <CampaignCopyEncounterTemplateModal
          campaign={campaign}
          onClose={() => setIsCopyModalOpen(false)}
        />
      ) : null}
      {pendingDeleteEncounter ? (
        <DestructiveConfirmationModal
          titleId={deleteEncounterTitleId}
          title="Delete prepared encounter?"
          message={getDeletePreparedEncounterMessage(pendingDeleteEncounter)}
          confirmLabel={isDeletingEncounter ? "Deleting..." : "Delete"}
          closeLabel="Close delete prepared encounter confirmation"
          onCancel={() => setPendingDeleteEncounter(null)}
          onConfirm={() => {
            void handleConfirmDeleteEncounter();
          }}
        />
      ) : null}
    </section>
  );
}

export default CampaignPreparedEncountersSection;
