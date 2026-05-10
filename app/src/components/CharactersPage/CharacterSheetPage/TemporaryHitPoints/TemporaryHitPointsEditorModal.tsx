import type { ChangeEvent } from "react";
import ActionButton from "../../../ActionButton";
import NumberInput from "../../FormInputs/NumberInput";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../Overlay";
import styles from "./TemporaryHitPointsEditorModal.module.css";

type TemporaryHitPointsEditorModalProps = {
  titleId: string;
  title: string;
  closeLabel: string;
  description: string;
  sourceLabel?: string;
  fieldLabel: string;
  value: number;
  maxValue?: number;
  maximumLabel?: string;
  hasUnsavedChanges: boolean;
  onChange: (value: number) => void;
  onClear?: () => void;
  onClose: () => void;
  onSave: () => void;
};

function normalizeEditorValue(value: string, maxValue: number | undefined): number {
  const parsedValue = Number(value.replace(/^0+(?=\d)/, ""));
  const normalizedValue = Number.isFinite(parsedValue)
    ? Math.floor(Math.max(0, Math.min(999, parsedValue)))
    : 0;

  return maxValue === undefined ? normalizedValue : Math.min(maxValue, normalizedValue);
}

function TemporaryHitPointsEditorModal({
  titleId,
  title,
  closeLabel,
  description,
  sourceLabel,
  fieldLabel,
  value,
  maxValue,
  maximumLabel = "Maximum",
  hasUnsavedChanges,
  onChange,
  onClear,
  onClose,
  onSave
}: TemporaryHitPointsEditorModalProps) {
  const normalizedMaxValue =
    typeof maxValue === "number" && Number.isFinite(maxValue)
      ? Math.floor(Math.max(0, Math.min(999, maxValue)))
      : undefined;

  function updateValue(event: ChangeEvent<HTMLInputElement>) {
    onChange(normalizeEditorValue(event.target.value, normalizedMaxValue));
  }

  return (
    <SheetModal titleId={titleId} onClose={onClose} size="small">
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitleRow>
            <OverlayTitle id={titleId}>{title}</OverlayTitle>
          </OverlayTitleRow>
        </OverlayHeaderContent>
        <OverlayCloseButton label={closeLabel} onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <p className={styles.description}>{description}</p>

        {sourceLabel ? (
          <p className={styles.source}>
            Source: <strong>{sourceLabel}</strong>
          </p>
        ) : null}

        <label className={styles.fieldBlock}>
          <span className={styles.fieldLabel}>{fieldLabel}</span>
          <NumberInput
            min={0}
            max={normalizedMaxValue}
            className={styles.input}
            value={value}
            onChange={updateValue}
          />
        </label>

        {normalizedMaxValue !== undefined ? (
          <div className={styles.detailGrid}>
            <article className={styles.detailItem}>
              <span className={styles.detailLabel}>{maximumLabel}</span>
              <strong className={styles.detailValue}>{normalizedMaxValue}</strong>
            </article>
          </div>
        ) : null}
      </OverlayBody>

      <OverlayFooter>
        <div className={onClear ? styles.footerActionsWithClear : styles.footerActions}>
          <ActionButton
            className={styles.footerButton}
            onClick={onSave}
            disabled={!hasUnsavedChanges}
          >
            Save
          </ActionButton>
          {onClear ? (
            <ActionButton
              actionType="ERROR"
              variant="GHOST"
              className={styles.footerButton}
              onClick={onClear}
            >
              Clear
            </ActionButton>
          ) : null}
        </div>
      </OverlayFooter>
    </SheetModal>
  );
}

export default TemporaryHitPointsEditorModal;
