import { Pencil } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { updateCampaign, type CampaignDetailRecord } from "../../api/campaigns";
import ActionButton from "../../components/ActionButton";
import TextInput from "../../components/CharactersPage/FormInputs/TextInput";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../components/Overlay";
import { patchSelectedCampaign, useAppDispatch } from "../../store";
import {
  CAMPAIGN_NAME_MAX_LENGTH,
  CAMPAIGN_NAME_MIN_LENGTH,
  getCampaignNameValidationMessage
} from "./campaignNameValidation";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import styles from "./DmToolsPage.module.css";

type EditCampaignModalProps = {
  campaign: CampaignDetailRecord;
  onClose: () => void;
};

function EditCampaignModal({ campaign, onClose }: EditCampaignModalProps) {
  const titleId = useId();
  const dispatch = useAppDispatch();
  const [name, setName] = useState(campaign.name);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const trimmedName = name.trim();
  const validationError = getCampaignNameValidationMessage(name);
  const hasChanges = trimmedName !== campaign.name;
  const canSubmit = !validationError && hasChanges && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const campaignPatch = await updateCampaign(campaign.id, trimmedName, {
        suppressFailureToast: true
      });

      dispatch(patchSelectedCampaign(campaignPatch));
      onClose();
    } catch (saveError) {
      setError(getDmToolsApiErrorMessage(saveError, "Unable to update campaign."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      isBusy={isSaving}
      busyLabel="Saving campaign"
      size="small"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Edit Campaign</OverlayTitle>
          <OverlaySummary>Update this campaign&apos;s GM-facing name.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close edit campaign modal" disabled={isSaving} onClick={onClose} />
      </OverlayHeader>

      <form onSubmit={handleSubmit}>
        <OverlayBody>
          <label className={styles.modalField}>
            <span className={styles.modalFieldLabel}>Campaign name</span>
            <TextInput
              autoFocus
              disabled={isSaving}
              invalid={Boolean(error)}
              maxLength={CAMPAIGN_NAME_MAX_LENGTH}
              minLength={CAMPAIGN_NAME_MIN_LENGTH}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
            />
          </label>
          {error ? <p className={styles.modalError}>{error}</p> : null}
        </OverlayBody>

        <OverlayFooter>
          <div className={styles.modalFooterActions}>
            <ActionButton
              type="button"
              variant="GHOST"
              disabled={isSaving}
              fullWidth
              onClick={onClose}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              icon={<Pencil size={16} aria-hidden="true" />}
              disabled={!canSubmit}
              loading={isSaving}
              loadingLabel="Saving campaign"
              fullWidth
            >
              Save Changes
            </ActionButton>
          </div>
        </OverlayFooter>
      </form>
    </SheetModal>
  );
}

export default EditCampaignModal;
