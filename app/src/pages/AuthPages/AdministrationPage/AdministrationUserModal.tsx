import { type FormEvent, useId, useState } from "react";
import { Save } from "lucide-react";
import ActionButton from "../../../components/ActionButton";
import SelectInput from "../../../components/CharactersPage/FormInputs/SelectInput";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../../components/Overlay";
import type { AdministrationAssignableRole, AdministrationUser } from "../../../types";
import type { UserRole } from "../../../types/auth";
import { formatAdministrationDate, formatAdministrationRole } from "./administrationFormatters";
import styles from "./AdministrationPage.module.css";

type AdministrationUserModalProps = {
  error: string | null;
  isBusy: boolean;
  onClose: () => void;
  onSave: (role: AdministrationAssignableRole) => void;
  user: AdministrationUser;
};

function AdministrationUserModal({
  error,
  isBusy,
  onClose,
  onSave,
  user
}: AdministrationUserModalProps) {
  const titleId = useId();
  const [role, setRole] = useState<UserRole>(user.role);
  const isAdmin = user.role === "admin";
  const canSave = !isAdmin && role !== "admin" && role !== user.role;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (canSave) {
      onSave(role);
    }
  }

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      isBusy={isBusy}
      busyLabel={`Saving ${user.nickname}`}
      size="medium"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>User Details</OverlayTitle>
          <OverlaySummary>Review account information and update its role.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close user details modal" disabled={isBusy} onClick={onClose} />
      </OverlayHeader>

      <form onSubmit={handleSubmit}>
        <OverlayBody className={styles.modalBody}>
          <div className={styles.modalFieldGrid}>
            <div className={styles.modalField}>
              <span>Nickname</span>
              <strong>{user.nickname}</strong>
            </div>
            <div className={styles.modalField}>
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>
            <div className={styles.modalField}>
              <span>Created</span>
              <strong>{formatAdministrationDate(user.createdAt)}</strong>
            </div>
            <div className={styles.modalField}>
              <span>Last Active</span>
              <strong>{formatAdministrationDate(user.lastActive)}</strong>
            </div>
            <label className={`${styles.modalField} ${styles.modalRoleField}`}>
              <span>Role</span>
              <SelectInput
                value={role}
                disabled={isAdmin || isBusy}
                onChange={(event) => setRole(event.target.value as UserRole)}
              >
                <option value="user">{formatAdministrationRole("user")}</option>
                <option value="keeper">{formatAdministrationRole("keeper")}</option>
                <option value="admin" disabled>
                  {formatAdministrationRole("admin")}
                </option>
              </SelectInput>
            </label>
          </div>
          {isAdmin ? (
            <p className={styles.modalText}>Admin roles are protected and cannot be changed.</p>
          ) : null}
          {error ? <p className={styles.modalError}>{error}</p> : null}
        </OverlayBody>

        <OverlayFooter>
          <div className={styles.modalActions}>
            <ActionButton
              type="button"
              variant="OUTLINE"
              fullWidth={false}
              disabled={isBusy}
              onClick={onClose}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              icon={<Save size={16} aria-hidden="true" />}
              fullWidth={false}
              loading={isBusy}
              disabled={!canSave}
            >
              Save
            </ActionButton>
          </div>
        </OverlayFooter>
      </form>
    </SheetModal>
  );
}

export default AdministrationUserModal;
