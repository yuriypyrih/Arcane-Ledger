import { Plus } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { createCampaign } from "../../api/campaigns";
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
import { upsertCampaignRecord, useAppDispatch } from "../../store";
import {
  CAMPAIGN_NAME_MAX_LENGTH,
  CAMPAIGN_NAME_MIN_LENGTH,
  getCampaignNameValidationMessage
} from "./campaignNameValidation";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import styles from "./DmToolsPage.module.css";

type CreateCampaignModalProps = {
  onClose: () => void;
  onCreated: (campaignId: string) => void;
};

function CreateCampaignModal({ onClose, onCreated }: CreateCampaignModalProps) {
  const titleId = useId();
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const validationError = getCampaignNameValidationMessage(name);
  const canSubmit = !validationError && !isCreating;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      const { campaign } = await createCampaign(name.trim(), { suppressFailureToast: true });

      dispatch(upsertCampaignRecord(campaign));
      onCreated(campaign.id);
    } catch (createError) {
      setError(getDmToolsApiErrorMessage(createError, "Unable to create campaign."));
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      isBusy={isCreating}
      busyLabel="Creating campaign"
      size="medium"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Create Campaign</OverlayTitle>
          <OverlaySummary>Name the campaign before adding prep notes and encounters.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton
          label="Close create campaign modal"
          disabled={isCreating}
          onClick={onClose}
        />
      </OverlayHeader>

      <form onSubmit={handleSubmit}>
        <OverlayBody>
          <label className={styles.modalField}>
            <span className={styles.modalFieldLabel}>Campaign name</span>
            <TextInput
              autoFocus
              disabled={isCreating}
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
              type="submit"
              icon={<Plus size={16} aria-hidden="true" />}
              disabled={!canSubmit}
              loading={isCreating}
              loadingLabel="Creating campaign"
              fullWidth={false}
            >
              Create Campaign
            </ActionButton>
          </div>
        </OverlayFooter>
      </form>
    </SheetModal>
  );
}

export default CreateCampaignModal;
