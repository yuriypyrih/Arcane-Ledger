import { Minus, Plus, type LucideIcon } from "lucide-react";
import styles from "./EquipmentInventoryItemDrawer.module.css";

type EquipmentInventoryDrawerButtonAction = {
  key: string;
  kind?: "button";
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  tone?: "neutral" | "positive" | "negative";
};

type EquipmentInventoryDrawerChargeAction = {
  key: string;
  kind: "charges";
  label: string;
  onUse: () => void;
  onReset: () => void;
  useDisabled?: boolean;
  resetDisabled?: boolean;
};

export type EquipmentInventoryDrawerAction =
  | EquipmentInventoryDrawerButtonAction
  | EquipmentInventoryDrawerChargeAction;

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
  if (action.kind === "charges") {
    return <FooterChargeControl action={action} />;
  }

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

function FooterChargeControl({ action }: { action: EquipmentInventoryDrawerChargeAction }) {
  return (
    <div className={styles.footerChargeControl} role="group" aria-label={action.label}>
      <span className={styles.footerChargeLabel}>{action.label}</span>
      <button
        type="button"
        className={`${styles.footerChargeIconButton} ${styles.footerChargeIconButtonPositive}`}
        onClick={action.onReset}
        disabled={action.resetDisabled}
        aria-label="Recover 1 charge"
        title="Recover 1 charge"
      >
        <Plus size={17} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`${styles.footerChargeIconButton} ${styles.footerChargeIconButtonNegative}`}
        onClick={action.onUse}
        disabled={action.useDisabled}
        aria-label="Use 1 charge"
        title="Use 1 charge"
      >
        <Minus size={17} aria-hidden="true" />
      </button>
    </div>
  );
}

export default EquipmentInventoryItemDrawerFooter;
