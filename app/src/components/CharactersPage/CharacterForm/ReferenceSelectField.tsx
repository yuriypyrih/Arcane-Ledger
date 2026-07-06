import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./CharacterForm.module.css";

type ReferenceSelectFieldProps = {
  children: ReactNode;
  error?: ReactNode;
  label: string;
  onOpenReference: () => void;
  referenceLabel: string;
  referenceUnavailableLabel?: string;
  selectId: string;
  canOpenReference: boolean;
};

function ReferenceSelectField({
  children,
  error,
  label,
  onOpenReference,
  referenceLabel,
  referenceUnavailableLabel = `${label} reference unavailable`,
  selectId,
  canOpenReference
}: ReferenceSelectFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={selectId}>
        {label}
      </label>
      <div className={styles.referenceSelectRow}>
        {children}
        <button
          type="button"
          className={styles.referenceButton}
          disabled={!canOpenReference}
          aria-label={canOpenReference ? referenceLabel : referenceUnavailableLabel}
          title={canOpenReference ? referenceLabel : referenceUnavailableLabel}
          onClick={onOpenReference}
        >
          <BookOpen size={18} aria-hidden="true" />
        </button>
      </div>
      {error}
    </div>
  );
}

export default ReferenceSelectField;
