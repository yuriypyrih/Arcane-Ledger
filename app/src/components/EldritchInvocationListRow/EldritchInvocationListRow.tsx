import clsx from "clsx";
import styles from "./EldritchInvocationListRow.module.css";

type EldritchInvocationListRowProps = {
  name: string;
  subtitle?: string | null;
  metaText?: string;
  onClick: () => void;
  className?: string;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
};

function EldritchInvocationListRow({
  name,
  subtitle,
  metaText = "",
  onClick,
  className,
  selectable = false,
  isSelected = false,
  onSelect,
  disabled = false
}: EldritchInvocationListRowProps) {
  const metaNode = metaText.trim().length > 0 ? <small className={styles.meta}>{metaText}</small> : <span />;

  if (selectable) {
    return (
      <article
        className={clsx(
          styles.button,
          styles.selectableCard,
          isSelected && styles.selectableCardSelected,
          className
        )}
      >
        <button
          type="button"
          className={clsx(
            styles.selectableToggleButton,
            disabled && styles.selectableToggleButtonDisabled
          )}
          role="checkbox"
          aria-checked={isSelected}
          aria-label={`${isSelected ? "Deselect" : "Select"} ${name}`}
          disabled={disabled}
          onClick={onSelect}
        >
          <input
            type="checkbox"
            checked={isSelected}
            readOnly
            tabIndex={-1}
            className={styles.selectableCheckbox}
            aria-hidden="true"
          />
        </button>
        <button type="button" className={styles.selectableDetailButton} onClick={onClick}>
          <div className={styles.contentRow}>
            <div className={styles.primaryBlock}>
              <div className={styles.nameRow}>
                <span className={styles.name}>{name}</span>
              </div>
              {subtitle ? <small className={styles.subtitle}>{subtitle}</small> : null}
            </div>
            {metaNode}
          </div>
        </button>
      </article>
    );
  }

  return (
    <button type="button" className={clsx(styles.button, className)} onClick={onClick}>
      <div className={styles.contentRow}>
        <div className={styles.primaryBlock}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{name}</span>
          </div>
          {subtitle ? <small className={styles.subtitle}>{subtitle}</small> : null}
        </div>
        {metaNode}
      </div>
    </button>
  );
}

export default EldritchInvocationListRow;
