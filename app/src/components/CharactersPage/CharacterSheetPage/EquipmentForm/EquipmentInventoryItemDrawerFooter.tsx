import type { LucideIcon } from "lucide-react";
import styles from "./EquipmentInventoryItemDrawer.module.css";

export type EquipmentInventoryDrawerAction = {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  tone?: "neutral" | "positive" | "negative";
};

type EquipmentInventoryItemDrawerFooterProps = {
  leftActions?: EquipmentInventoryDrawerAction[];
  rightActions?: EquipmentInventoryDrawerAction[];
  notice?: string | null;
  ownedCount?: number;
};

function EquipmentInventoryItemDrawerFooter({
  leftActions = [],
  notice = null,
  rightActions = [],
  ownedCount = 0
}: EquipmentInventoryItemDrawerFooterProps) {
  if (leftActions.length === 0 && rightActions.length === 0 && ownedCount <= 0 && !notice) {
    return null;
  }

  return (
    <div className={styles.footerStack}>
      {notice ? <p className={styles.footerNotice}>{notice}</p> : null}

      <div className={styles.footerLayout}>
        <div className={styles.footerActionGroup}>
          {leftActions.map((action) => (
            <FooterActionButton key={action.key} action={action} />
          ))}
        </div>

        <div className={styles.footerRightGroup}>
          {ownedCount > 0 ? (
            <span className={styles.copyCountBadge}>{`[x${ownedCount}]`}</span>
          ) : null}
          <div className={styles.footerActionGroup}>
            {rightActions.map((action) => (
              <FooterActionButton key={action.key} action={action} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FooterActionButton({ action }: { action: EquipmentInventoryDrawerAction }) {
  const Icon = action.icon;
  const toneClassName =
    action.tone === "positive"
      ? styles.tonePositive
      : action.tone === "negative"
        ? styles.toneNegative
        : styles.toneNeutral;

  return (
    <button
      type="button"
      className={`${styles.footerButton} ${toneClassName}`}
      onClick={action.onClick}
      disabled={action.disabled}
      aria-label={action.label}
      title={action.label}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{action.label}</span>
    </button>
  );
}

export default EquipmentInventoryItemDrawerFooter;
