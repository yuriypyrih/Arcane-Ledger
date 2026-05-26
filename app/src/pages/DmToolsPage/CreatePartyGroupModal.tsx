import { Plus } from "lucide-react";
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
import { createPartyGroup } from "../../api/partyGroups";
import { upsertPartyGroupRecord, useAppDispatch } from "../../store";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import {
  getPartyGroupNameValidationMessage,
  PARTY_GROUP_NAME_MAX_LENGTH,
  PARTY_GROUP_NAME_MIN_LENGTH
} from "./partyGroupNameValidation";
import styles from "./DmToolsPage.module.css";

type CreatePartyGroupModalProps = {
  onClose: () => void;
  onCreated: (partyGroupId: string) => void;
};

function CreatePartyGroupModal({ onClose, onCreated }: CreatePartyGroupModalProps) {
  const titleId = useId();
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const validationError = getPartyGroupNameValidationMessage(name);
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
      const { partyGroup } = await createPartyGroup(name.trim(), { suppressFailureToast: true });

      dispatch(upsertPartyGroupRecord(partyGroup));
      onCreated(partyGroup.id);
    } catch (createError) {
      setError(getDmToolsApiErrorMessage(createError, "Unable to create party group."));
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      isBusy={isCreating}
      busyLabel="Creating party group"
      size="medium"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Create Party Group</OverlayTitle>
          <OverlaySummary>Set up a party space for your players.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton
          label="Close create party group modal"
          disabled={isCreating}
          onClick={onClose}
        />
      </OverlayHeader>

      <form onSubmit={handleSubmit}>
        <OverlayBody>
          <p className={styles.modalCopy}>
            Only the DM should create the Party Group. The creator becomes the owner and admin for
            that party group.
          </p>
          <label className={styles.modalField}>
            <span className={styles.modalFieldLabel}>Party name</span>
            <TextInput
              autoFocus
              disabled={isCreating}
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
            <ActionButton
              type="submit"
              icon={<Plus size={16} aria-hidden="true" />}
              disabled={!canSubmit}
              loading={isCreating}
              loadingLabel="Creating party group"
              fullWidth={false}
            >
              Create Party Group
            </ActionButton>
          </div>
        </OverlayFooter>
      </form>
    </SheetModal>
  );
}

export default CreatePartyGroupModal;
