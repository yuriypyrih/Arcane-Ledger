import { Download, Swords } from "lucide-react";
import { useEffect, useState } from "react";
import { copyEncounterTemplateToCampaign, type CampaignDetailRecord } from "../../api/campaigns";
import { listEncounterTemplates, type EncounterTemplateRecord } from "../../api/encounterTemplates";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../components/Overlay";
import { patchSelectedCampaign, useAppDispatch } from "../../store";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import DmToolsEmptyState from "./DmToolsEmptyState";
import DmToolsListCard from "./DmToolsListCard";
import styles from "./DmToolsPage.module.css";

type CampaignCopyEncounterTemplateModalProps = {
  campaign: CampaignDetailRecord;
  onClose: () => void;
};

function CampaignCopyEncounterTemplateModal({
  campaign,
  onClose
}: CampaignCopyEncounterTemplateModalProps) {
  const titleId = "copy-encounter-template-modal-title";
  const dispatch = useAppDispatch();
  const [encounterTemplates, setEncounterTemplates] = useState<EncounterTemplateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyingTemplateId, setCopyingTemplateId] = useState<string | null>(null);
  const isCopying = copyingTemplateId !== null;

  useEffect(() => {
    let didCancel = false;

    setIsLoading(true);
    setLoadError(null);

    void listEncounterTemplates({ suppressFailureToast: true })
      .then(({ encounterTemplates: nextEncounterTemplates }) => {
        if (!didCancel) {
          setEncounterTemplates(nextEncounterTemplates);
        }
      })
      .catch((loadError) => {
        if (!didCancel) {
          setLoadError(getDmToolsApiErrorMessage(loadError, "Unable to load encounter templates."));
        }
      })
      .finally(() => {
        if (!didCancel) {
          setIsLoading(false);
        }
      });

    return () => {
      didCancel = true;
    };
  }, []);

  async function handleImportTemplate(encounterTemplateId: string) {
    if (isCopying) {
      return;
    }

    setError(null);
    setCopyingTemplateId(encounterTemplateId);

    try {
      const campaignPatch = await copyEncounterTemplateToCampaign(
        campaign.id,
        encounterTemplateId,
        { suppressFailureToast: true }
      );

      dispatch(patchSelectedCampaign(campaignPatch));
      onClose();
    } catch (copyError) {
      setError(getDmToolsApiErrorMessage(copyError, "Unable to import encounter template."));
    } finally {
      setCopyingTemplateId(null);
    }
  }

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      isBusy={isCopying}
      busyLabel="Importing encounter template"
      size="medium"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Import Encounter Template</OverlayTitle>
          <OverlaySummary>
            Copy an owned template into this campaign&apos;s prepared list.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton
          label="Close copy encounter template modal"
          disabled={isCopying}
          onClick={onClose}
        />
      </OverlayHeader>

      <OverlayBody>
        {isLoading ? (
          <DmToolsEmptyState icon={<Download size={18} aria-hidden="true" />}>
            Loading encounter templates...
          </DmToolsEmptyState>
        ) : encounterTemplates.length > 0 ? (
          <div className={styles.dmToolsList}>
            {encounterTemplates.map((encounterTemplate) => (
              <DmToolsListCard
                key={encounterTemplate.id}
                icon={<Swords size={18} aria-hidden="true" />}
                title={encounterTemplate.name}
                meta={`${encounterTemplate.creatureCount} ${
                  encounterTemplate.creatureCount === 1 ? "creature" : "creatures"
                }`}
                disabled={isCopying}
                onClick={() => {
                  void handleImportTemplate(encounterTemplate.id);
                }}
              />
            ))}
          </div>
        ) : (
          <DmToolsEmptyState icon={<Download size={18} aria-hidden="true" />}>
            No encounter templates are available to import.
          </DmToolsEmptyState>
        )}
        {loadError ? <p className={styles.modalError}>{loadError}</p> : null}
        {error ? <p className={styles.modalError}>{error}</p> : null}
      </OverlayBody>
    </SheetModal>
  );
}

export default CampaignCopyEncounterTemplateModal;
