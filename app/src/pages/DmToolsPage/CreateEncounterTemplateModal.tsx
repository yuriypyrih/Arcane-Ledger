import { Plus } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { createEncounterTemplate } from "../../api/encounterTemplates";
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
import { upsertEncounterTemplateRecord, useAppDispatch } from "../../store";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import {
  ENCOUNTER_TEMPLATE_NAME_MAX_LENGTH,
  ENCOUNTER_TEMPLATE_NAME_MIN_LENGTH,
  getEncounterTemplateNameValidationMessage
} from "./encounterTemplateNameValidation";
import styles from "./DmToolsPage.module.css";

type CreateEncounterTemplateModalProps = {
  onClose: () => void;
  onCreated: (encounterTemplateId: string) => void;
};

function CreateEncounterTemplateModal({
  onClose,
  onCreated
}: CreateEncounterTemplateModalProps) {
  const titleId = useId();
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const validationError = getEncounterTemplateNameValidationMessage(name);
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
      const { encounterTemplate } = await createEncounterTemplate(name.trim(), {
        suppressFailureToast: true
      });

      dispatch(upsertEncounterTemplateRecord(encounterTemplate));
      onCreated(encounterTemplate.id);
    } catch (createError) {
      setError(getDmToolsApiErrorMessage(createError, "Unable to create encounter template."));
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      isBusy={isCreating}
      busyLabel="Creating encounter template"
      size="medium"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Create Encounter Template</OverlayTitle>
          <OverlaySummary>Name the encounter bundle before adding creatures.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton
          label="Close create encounter template modal"
          disabled={isCreating}
          onClick={onClose}
        />
      </OverlayHeader>

      <form onSubmit={handleSubmit}>
        <OverlayBody>
          <label className={styles.modalField}>
            <span className={styles.modalFieldLabel}>Encounter name</span>
            <TextInput
              autoFocus
              disabled={isCreating}
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
              type="submit"
              icon={<Plus size={16} aria-hidden="true" />}
              disabled={!canSubmit}
              loading={isCreating}
              loadingLabel="Creating encounter template"
              fullWidth={false}
            >
              Create Encounter Template
            </ActionButton>
          </div>
        </OverlayFooter>
      </form>
    </SheetModal>
  );
}

export default CreateEncounterTemplateModal;
