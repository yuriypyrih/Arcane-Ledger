import { Save, X } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { updateCampaign, type CampaignDetailRecord } from "../../api/campaigns";
import ActionButton from "../../components/ActionButton";
import ExternalImage from "../../components/ExternalImage";
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
import { getHttpsUrlValidationMessage } from "../../utils/httpsUrl";
import styles from "./DmToolsPage.module.css";

type EditCampaignModalProps = {
  campaign: CampaignDetailRecord;
  onClose: () => void;
};

function EditCampaignModal({ campaign, onClose }: EditCampaignModalProps) {
  const titleId = useId();
  const dispatch = useAppDispatch();
  const [name, setName] = useState(campaign.name);
  const [imageUrl, setImageUrl] = useState(campaign.imageUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const trimmedName = name.trim();
  const validationError = getCampaignNameValidationMessage(name);
  const trimmedImageUrl = imageUrl.trim();
  const imageUrlError = getHttpsUrlValidationMessage(imageUrl, "Picture link");
  const hasChanges =
    trimmedName !== campaign.name || trimmedImageUrl !== (campaign.imageUrl ?? "");
  const canSubmit = !validationError && !imageUrlError && hasChanges && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setError(validationError ?? imageUrlError);
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const campaignPatch = await updateCampaign(
        campaign.id,
        {
          ...(trimmedName !== campaign.name ? { name: trimmedName } : {}),
          ...(trimmedImageUrl !== (campaign.imageUrl ?? "") ? { imageUrl: trimmedImageUrl } : {})
        },
        { suppressFailureToast: true }
      );

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
          <OverlaySummary>Update this campaign&apos;s name and picture.</OverlaySummary>
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
          <label className={styles.modalField}>
            <span className={styles.modalFieldLabel}>Picture link (optional)</span>
            <TextInput
              disabled={isSaving}
              inputMode="url"
              invalid={Boolean(imageUrlError)}
              maxLength={500}
              placeholder="https://example.com/campaign.jpg"
              value={imageUrl}
              onChange={(event) => {
                setImageUrl(event.target.value);
                setError(null);
              }}
            />
          </label>
          {imageUrlError ? <p className={styles.modalError}>{imageUrlError}</p> : null}
          {trimmedImageUrl && !imageUrlError ? (
            <ExternalImage
              src={trimmedImageUrl}
              className={styles.campaignImagePreview}
              fallback={
                <p className={styles.modalFieldHint}>
                  This link did not load as a picture. Players will see no picture.
                </p>
              }
            />
          ) : null}
          {error ? <p className={styles.modalError}>{error}</p> : null}
        </OverlayBody>

        <OverlayFooter>
          <div className={styles.modalFooterActions}>
            <ActionButton
              type="button"
              variant="OUTLINE"
              icon={<X size={16} aria-hidden="true" />}
              disabled={isSaving}
              fullWidth
              onClick={onClose}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              icon={<Save size={16} aria-hidden="true" />}
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
