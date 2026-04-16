import type { LucideIcon } from "lucide-react";
import { useState } from "react";
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
} from "../../../../Overlay";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./ResourceCountWidget.module.css";

const RESOURCE_MANAGER_DESCRIPTION =
  "Manage this resource manually if you want. Use these controls to add, spend, or fully reset the tracker.";

export type ResourceCountWidgetIcon =
  | {
      kind: "lucide";
      icon: LucideIcon;
    }
  | {
      kind: "image";
      src: string;
    };

type ResourceCountWidgetProps = {
  icon: ResourceCountWidgetIcon;
  pillLabel: string;
  modalTitle: string;
  eyebrow: string;
  current: number;
  total: number;
  titleSuffix?: string;
  onAdd: () => void;
  onUse: () => void;
  onReset: () => void;
};

function renderIcon(icon: ResourceCountWidgetIcon, size: "pill" | "button") {
  if (icon.kind === "lucide") {
    const Icon = icon.icon;

    return (
      <span className={size === "pill" ? styles.pillIcon : styles.actionIcon} aria-hidden="true">
        <Icon size={size === "pill" ? 16 : 14} />
      </span>
    );
  }

  return (
    <img
      src={icon.src}
      alt=""
      className={size === "pill" ? styles.pillImage : styles.actionImage}
      aria-hidden="true"
    />
  );
}

function ResourceCountWidget({
  icon,
  pillLabel,
  modalTitle,
  eyebrow,
  current,
  total,
  titleSuffix,
  onAdd,
  onUse,
  onReset
}: ResourceCountWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modalTitleId = `${modalTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-resource-modal-title`;
  const resolvedModalTitle = [modalTitle, `${current}/${total}`, titleSuffix]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <button
        type="button"
        className={styles.pill}
        onClick={() => setIsOpen(true)}
        aria-label={pillLabel}
        title={pillLabel}
      >
        {renderIcon(icon, "pill")}
        <span>{pillLabel}</span>
      </button>

      {isOpen ? (
        <SheetModal
          titleId={modalTitleId}
          onClose={() => setIsOpen(false)}
          panelClassName={styles.modal}
        >
          <OverlayHeader>
            <OverlayHeaderContent>
              <OverlayEyebrow>{eyebrow}</OverlayEyebrow>
              <OverlayTitleRow>
                <OverlayTitle id={modalTitleId}>{resolvedModalTitle}</OverlayTitle>
              </OverlayTitleRow>
            </OverlayHeaderContent>
            <OverlayCloseButton label={`Close ${modalTitle}`} onClick={() => setIsOpen(false)} />
          </OverlayHeader>

          <OverlayBody className={styles.body}>
            <p className={styles.description}>{RESOURCE_MANAGER_DESCRIPTION}</p>
          </OverlayBody>

          <OverlayFooter className={styles.footer}>
            <div className={styles.actions}>
              <button
                type="button"
                className={`${sheetStyles.castButton} ${styles.actionButton} ${styles.actionButtonCompact}`}
                disabled={current >= total}
                onClick={onAdd}
                aria-label={`Add 1 ${modalTitle}`}
              >
                <span>Add 1</span>
                {renderIcon(icon, "button")}
              </button>
              <button
                type="button"
                className={`${sheetStyles.castButton} ${styles.actionButton} ${styles.actionButtonCompact}`}
                disabled={current <= 0}
                onClick={onUse}
                aria-label={`Use 1 ${modalTitle}`}
              >
                <span>Use 1</span>
                {renderIcon(icon, "button")}
              </button>
              <button
                type="button"
                className={`${sheetStyles.castButton} ${styles.actionButton} ${styles.actionButtonWide}`}
                disabled={current >= total}
                onClick={onReset}
                aria-label={`Reset all ${modalTitle}`}
              >
                <span>Reset all</span>
                {renderIcon(icon, "button")}
              </button>
            </div>
          </OverlayFooter>
        </SheetModal>
      ) : null}
    </>
  );
}

export default ResourceCountWidget;
