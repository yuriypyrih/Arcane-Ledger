import { type FormEvent, useId, useState } from "react";
import { Pencil } from "lucide-react";
import ActionButton from "../../components/ActionButton";
import TextInput from "../../components/CharactersPage/FormInputs/TextInput";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  SheetModal
} from "../../components/Overlay";
import {
  getNicknameValidationMessage,
  normalizeNicknameInput,
  USER_NICKNAME_MAX_LENGTH,
  USER_NICKNAME_MIN_LENGTH
} from "./authNickname";
import styles from "./AuthPages.module.css";

type AccountNicknameModalProps = {
  error: string | null;
  initialNickname: string;
  isBusy: boolean;
  onChangeNickname: (nickname: string) => Promise<void>;
  onClearError: () => void;
  onClose: () => void;
};

function AccountNicknameModal({
  error,
  initialNickname,
  isBusy,
  onChangeNickname,
  onClearError,
  onClose
}: AccountNicknameModalProps) {
  const titleId = useId();
  const [nickname, setNickname] = useState(initialNickname);
  const [validationError, setValidationError] = useState<string | null>(null);
  const displayError = validationError ?? error;

  function handleClose() {
    if (!isBusy) {
      onClose();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    onClearError();

    const nicknameError = getNicknameValidationMessage(nickname);

    if (nicknameError) {
      setValidationError(nicknameError);
      return;
    }

    await onChangeNickname(normalizeNicknameInput(nickname));
  }

  return (
    <SheetModal
      titleId={titleId}
      onClose={handleClose}
      isBusy={isBusy}
      busyLabel="Changing nickname"
      size="medium"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Change Nickname</OverlayTitle>
        </OverlayHeaderContent>
        <OverlayCloseButton
          label="Close change nickname modal"
          disabled={isBusy}
          onClick={handleClose}
        />
      </OverlayHeader>

      <form className={styles.accountPasswordForm} onSubmit={handleSubmit}>
        <OverlayBody>
          <div className={styles.accountPasswordFields}>
            <label className={`${styles.field} ${styles.accountFieldWide}`}>
              <span className={styles.label}>Nickname</span>
              <TextInput
                className={styles.input}
                autoComplete="nickname"
                disabled={isBusy}
                minLength={USER_NICKNAME_MIN_LENGTH}
                maxLength={USER_NICKNAME_MAX_LENGTH}
                value={nickname}
                onChange={(event) => {
                  setNickname(event.target.value);
                  setValidationError(null);
                  onClearError();
                }}
              />
            </label>
          </div>

          {displayError ? (
            <div className={`${styles.message} ${styles.error}`}>{displayError}</div>
          ) : null}
        </OverlayBody>

        <OverlayFooter>
          <div className={styles.accountPasswordFooter}>
            <ActionButton
              className={styles.accountPasswordButton}
              icon={<Pencil size={16} aria-hidden="true" />}
              loading={isBusy}
              type="submit"
              fullWidth={false}
            >
              Change Nickname
            </ActionButton>
          </div>
        </OverlayFooter>
      </form>
    </SheetModal>
  );
}

export default AccountNicknameModal;
