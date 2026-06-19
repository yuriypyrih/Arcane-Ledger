import type { CSSProperties, ReactNode } from "react";
import ActionButton from "../../ActionButton";
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
import styles from "./ResourceManagementModal.module.css";

const RESOURCE_MANAGEMENT_DESCRIPTION =
  "Here you can manually adjust your resources outside of the app internal logic.";

const resourceManagementButtonBasisProperty = "--resource-management-button-basis";
const resourceManagementActionGapRem = 0.65;

function getFooterColumnCount(actionCount: number, columnCount?: number): number {
  const requestedColumnCount = columnCount ?? actionCount;

  if (!Number.isFinite(requestedColumnCount)) {
    return 1;
  }

  return Math.min(3, Math.max(1, Math.floor(requestedColumnCount)));
}

function getFooterButtonBasis(columnCount: number): string {
  if (columnCount <= 1) {
    return "100%";
  }

  return `calc((100% - ${(columnCount - 1) * resourceManagementActionGapRem}rem) / ${columnCount})`;
}

export type ResourceManagementModalAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  keepOpen?: boolean;
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
  columnCount?: number;
};

function ResourceManagementModal({
  titleId,
  title,
  closeLabel,
  onClose,
  actions,
  columnCount,
  eyebrow = "RESOURCE MANAGEMENT",
  description = RESOURCE_MANAGEMENT_DESCRIPTION,
  titleAccessory
}: ResourceManagementModalProps) {
  function handleActionClick(action: ResourceManagementModalAction) {
    action.onClick();

    if (!action.keepOpen) {
      onClose();
    }
  }

  const footerColumnCount = getFooterColumnCount(actions.length, columnCount);
  const footerActionStyle = {
    [resourceManagementButtonBasisProperty]: getFooterButtonBasis(footerColumnCount)
  } as CSSProperties;

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
        <div className={styles.footerActions} style={footerActionStyle}>
          {actions.map((action) => (
            <ActionButton
              key={action.label}
              className={styles.footerButton}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
              aria-label={action.ariaLabel ?? action.label}
            >
              {action.label}
            </ActionButton>
          ))}
        </div>
      </OverlayFooter>
    </SheetModal>
  );
}

export default ResourceManagementModal;
