import { Pencil } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
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
import { updatePartyGroup, type PartyGroupDetailRecord } from "../../api/partyGroups";
import { setSelectedPartyGroup, useAppDispatch } from "../../store";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import {
  getPartyGroupNameValidationMessage,
  PARTY_GROUP_NAME_MAX_LENGTH,
  PARTY_GROUP_NAME_MIN_LENGTH
} from "./partyGroupNameValidation";
import styles from "./DmToolsPage.module.css";

type EditPartyGroupModalProps = {
  partyGroup: PartyGroupDetailRecord;
  onClose: () => void;
};

function EditPartyGroupModal({ partyGroup, onClose }: EditPartyGroupModalProps) {
  const titleId = useId();
  const dispatch = useAppDispatch();
  const [name, setName] = useState(partyGroup.name);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const trimmedName = name.trim();
  const validationError = getPartyGroupNameValidationMessage(name);
  const hasChanges = trimmedName !== partyGroup.name;
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
      const { partyGroup: nextPartyGroup } = await updatePartyGroup(partyGroup.id, trimmedName, {
        suppressFailureToast: true
      });

      dispatch(setSelectedPartyGroup(nextPartyGroup));
      onClose();
    } catch (saveError) {
      setError(getDmToolsApiErrorMessage(saveError, "Unable to update party group."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      isBusy={isSaving}
      busyLabel="Saving party group"
      size="medium"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Edit Party Group</OverlayTitle>
          <OverlaySummary>Update this party group&apos;s shared DM-facing details.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close edit party group modal" disabled={isSaving} onClick={onClose} />
      </OverlayHeader>

      <form onSubmit={handleSubmit}>
        <OverlayBody>
          <label className={styles.modalField}>
            <span className={styles.modalFieldLabel}>Party name</span>
            <TextInput
              autoFocus
              disabled={isSaving}
              invalid={Boolean(error)}
              maxLength={PARTY_GROUP_NAME_MAX_LENGTH}
              minLength={PARTY_GROUP_NAME_MIN_LENGTH}
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
            <ActionButton type="button" variant="GHOST" disabled={isSaving} fullWidth={false} onClick={onClose}>
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              icon={<Pencil size={16} aria-hidden="true" />}
              disabled={!canSubmit}
              loading={isSaving}
              loadingLabel="Saving party group"
              fullWidth={false}
            >
              Save Changes
            </ActionButton>
          </div>
        </OverlayFooter>
      </form>
    </SheetModal>
  );
}

export default EditPartyGroupModal;
