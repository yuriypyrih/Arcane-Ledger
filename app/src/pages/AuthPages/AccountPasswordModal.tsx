import { type FormEvent, useId, useState } from "react";
import { KeyRound } from "lucide-react";
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
import styles from "./AuthPages.module.css";

type AccountPasswordModalProps = {
  error: string | null;
  isBusy: boolean;
  onChangePassword: (currentPassword: string, password: string) => Promise<void>;
  onClearError: () => void;
  onClose: () => void;
};

function AccountPasswordModal({
  error,
  isBusy,
  onChangePassword,
  onClearError,
  onClose
}: AccountPasswordModalProps) {
  const titleId = useId();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    await onChangePassword(currentPassword, password);
  }

  return (
    <SheetModal
      titleId={titleId}
      onClose={handleClose}
      isBusy={isBusy}
      busyLabel="Changing password"
      size="medium"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Change Password</OverlayTitle>
          <OverlaySummary>You will log in again after it changes.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton
          label="Close change password modal"
          disabled={isBusy}
          onClick={handleClose}
        />
      </OverlayHeader>

      <form className={styles.accountPasswordForm} onSubmit={handleSubmit}>
        <OverlayBody>
          <div className={styles.accountPasswordFields}>
            <label className={`${styles.field} ${styles.accountFieldWide}`}>
              <span className={styles.label}>Current Password</span>
              <TextInput
                className={styles.input}
                autoComplete="current-password"
                disabled={isBusy}
                type="password"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  setValidationError(null);
                  onClearError();
                }}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>New Password</span>
              <TextInput
                className={styles.input}
                autoComplete="new-password"
                disabled={isBusy}
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setValidationError(null);
                  onClearError();
                }}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Confirm Password</span>
              <TextInput
                className={styles.input}
                autoComplete="new-password"
                disabled={isBusy}
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
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
              icon={<KeyRound size={16} aria-hidden="true" />}
              loading={isBusy}
              type="submit"
              fullWidth={false}
            >
              Change Password
            </ActionButton>
          </div>
        </OverlayFooter>
      </form>
    </SheetModal>
  );
}

export default AccountPasswordModal;
