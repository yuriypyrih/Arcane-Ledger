import clsx from "clsx";
import type { ReactNode } from "react";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../Overlay";
import sheetStyles from "../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./ResourceManagementModal.module.css";

const RESOURCE_MANAGEMENT_DESCRIPTION =
  "Here you can manually adjust your resources outside of the app internal logic.";

export type ResourceManagementModalAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

type ResourceManagementModalProps = {
  titleId: string;
  title: string;
  closeLabel: string;
  onClose: () => void;
  actions: ResourceManagementModalAction[];
  eyebrow?: string;
  description?: string;
  titleAccessory?: ReactNode;
};

function ResourceManagementModal({
  titleId,
  title,
  closeLabel,
  onClose,
  actions,
  eyebrow = "RESOURCE MANAGEMENT",
  description = RESOURCE_MANAGEMENT_DESCRIPTION,
  titleAccessory
}: ResourceManagementModalProps) {
  return (
    <SheetModal titleId={titleId} onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>{eyebrow}</OverlayEyebrow>
          <OverlayTitleRow className={styles.titleRow}>
            <OverlayTitle id={titleId}>{title}</OverlayTitle>
            {titleAccessory ? (
              <span className={styles.titleAccessory}>{titleAccessory}</span>
            ) : null}
          </OverlayTitleRow>
        </OverlayHeaderContent>
        <OverlayCloseButton label={closeLabel} onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <p className={styles.description}>{description}</p>
      </OverlayBody>

      <OverlayFooter className={styles.footer}>
        <div
          className={styles.footerActions}
          style={{ gridTemplateColumns: `repeat(${Math.max(1, actions.length)}, minmax(0, 1fr))` }}
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={clsx(sheetStyles.castButton, styles.footerButton)}
              onClick={action.onClick}
              disabled={action.disabled}
              aria-label={action.ariaLabel ?? action.label}
            >
              {action.label}
            </button>
          ))}
        </div>
      </OverlayFooter>
    </SheetModal>
  );
}

export default ResourceManagementModal;
