import { Pencil, Plus } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import type { CampaignPreparedEncounterRecord } from "../../api/campaigns";
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
import {
  ENCOUNTER_TEMPLATE_NAME_MAX_LENGTH,
  ENCOUNTER_TEMPLATE_NAME_MIN_LENGTH,
  getEncounterTemplateNameValidationMessage
} from "./encounterTemplateNameValidation";
import styles from "./DmToolsPage.module.css";

type CampaignPreparedEncounterModalProps = {
  encounter?: CampaignPreparedEncounterRecord;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
};

function CampaignPreparedEncounterModal({
  encounter,
  onClose,
  onSave
}: CampaignPreparedEncounterModalProps) {
  const titleId = useId();
  const [name, setName] = useState(encounter?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const trimmedName = name.trim();
  const validationError = getEncounterTemplateNameValidationMessage(name);
  const hasChanges = !encounter || trimmedName !== encounter.name;
  const canSubmit = !validationError && hasChanges && !isSaving;
  const isEditing = Boolean(encounter);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await onSave(trimmedName);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save encounter.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      isBusy={isSaving}
      busyLabel={isEditing ? "Saving encounter" : "Creating encounter"}
      size="medium"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>
            {isEditing ? "Edit Prepared Encounter" : "Create Prepared Encounter"}
          </OverlayTitle>
          <OverlaySummary>Name this campaign-specific encounter.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton
          label="Close prepared encounter modal"
          disabled={isSaving}
          onClick={onClose}
        />
      </OverlayHeader>

      <form onSubmit={handleSubmit}>
        <OverlayBody>
          <label className={styles.modalField}>
            <span className={styles.modalFieldLabel}>Encounter name</span>
            <TextInput
              autoFocus
              disabled={isSaving}
              invalid={Boolean(error)}
              maxLength={ENCOUNTER_TEMPLATE_NAME_MAX_LENGTH}
              minLength={ENCOUNTER_TEMPLATE_NAME_MIN_LENGTH}
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
              fullWidth={false}
              onClick={onClose}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              icon={
                isEditing ? (
                  <Pencil size={16} aria-hidden="true" />
                ) : (
                  <Plus size={16} aria-hidden="true" />
                )
              }
              disabled={!canSubmit}
              loading={isSaving}
              loadingLabel={isEditing ? "Saving encounter" : "Creating encounter"}
              fullWidth={false}
            >
              {isEditing ? "Save Changes" : "Create Encounter"}
            </ActionButton>
          </div>
        </OverlayFooter>
      </form>
    </SheetModal>
  );
}

export default CampaignPreparedEncounterModal;
