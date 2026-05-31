import { Pencil } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { updateEncounterTemplate, type EncounterTemplateDetailRecord } from "../../api/encounterTemplates";
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
import { setSelectedEncounterTemplate, useAppDispatch } from "../../store";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import {
  ENCOUNTER_TEMPLATE_NAME_MAX_LENGTH,
  ENCOUNTER_TEMPLATE_NAME_MIN_LENGTH,
  getEncounterTemplateNameValidationMessage
} from "./encounterTemplateNameValidation";
import styles from "./DmToolsPage.module.css";

type EditEncounterTemplateModalProps = {
  encounterTemplate: EncounterTemplateDetailRecord;
  onClose: () => void;
};

function EditEncounterTemplateModal({
  encounterTemplate,
  onClose
}: EditEncounterTemplateModalProps) {
  const titleId = useId();
  const dispatch = useAppDispatch();
  const [name, setName] = useState(encounterTemplate.name);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const trimmedName = name.trim();
  const validationError = getEncounterTemplateNameValidationMessage(name);
  const hasChanges = trimmedName !== encounterTemplate.name;
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
      const { encounterTemplate: nextEncounterTemplate } = await updateEncounterTemplate(
        encounterTemplate.id,
        trimmedName,
        { suppressFailureToast: true }
      );

      dispatch(setSelectedEncounterTemplate(nextEncounterTemplate));
      onClose();
    } catch (saveError) {
      setError(getDmToolsApiErrorMessage(saveError, "Unable to update encounter template."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      isBusy={isSaving}
      busyLabel="Saving encounter template"
      size="small"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Edit Encounter Template</OverlayTitle>
          <OverlaySummary>Update this reusable encounter bundle.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton
          label="Close edit encounter template modal"
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
              variant="OUTLINE"
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
              loadingLabel="Saving encounter template"
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

export default EditEncounterTemplateModal;
