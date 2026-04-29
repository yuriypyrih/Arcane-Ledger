import clsx from "clsx";
import FeatureUsageLabel from "../FeatureUsageLabel";
import { renderFeatureUsageIcon } from "../featureUsageIcons";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import type {
  FeatureActionCardUsage,
  FeatureActionIcon
} from "../../../../pages/CharactersPage/classFeatures";
import styles from "./FeatureOptInToggle.module.css";

export type FeatureOptInToggleIconKind = FeatureActionIcon | "divinity";

export type FeatureOptInToggleApplication = {
  targetLabel: string;
  qualifierText?: string;
};

export type FeatureOptInToggleMetaItem =
  | {
      kind: "tracker";
      current: number;
      total: number;
      label?: string;
    }
  | {
      kind: "text";
      label: string;
    }
  | {
      kind: "cost";
      label: string;
      icon?: FeatureOptInToggleIconKind;
    };

type FeatureOptInToggleProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  title?: string;
  usage?: FeatureActionCardUsage;
  application?: FeatureOptInToggleApplication;
  usageKey?: string;
  metaItems?: FeatureOptInToggleMetaItem[];
  muted?: boolean;
  className?: string;
  checkboxAccentColor?: string;
};

function normalizeMetaIcon(icon?: FeatureOptInToggleIconKind): FeatureActionIcon | undefined {
  if (icon === "divinity") {
    return "pyromancy";
  }

  return icon;
}

function getApplicationLabel(application?: FeatureOptInToggleApplication) {
  if (!application) {
    return null;
  }

  const qualifierText = application.qualifierText?.trim();
  const targetLabel = application.targetLabel.trim();

  if (!qualifierText && !targetLabel) {
    return null;
  }

  return [qualifierText, targetLabel ? `on ${targetLabel}` : null].filter(Boolean).join(" ");
}

function FeatureOptInToggle({
  label,
  checked,
  onCheckedChange,
  disabled = false,
  title,
  usage,
  application,
  usageKey,
  metaItems = [],
  muted = false,
  className,
  checkboxAccentColor
}: FeatureOptInToggleProps) {
  const visibleMetaItems = metaItems.filter(
    (item) => item.kind !== "tracker" || Math.max(0, Math.floor(item.total)) > 0
  );
  const applicationLabel = getApplicationLabel(application);

  return (
    <div
      className={clsx(
        styles.toggle,
        muted && styles.toggleMuted,
        disabled && styles.toggleDisabled,
        className
      )}
    >
      <label className={styles.toggleContent} title={title ?? undefined}>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onCheckedChange(event.target.checked)}
          style={checkboxAccentColor ? { accentColor: checkboxAccentColor } : undefined}
        />
        <span>{label}</span>
        {usage ? (
          <span className={styles.metaGroup}>
            <span className={styles.metaDivider}>|</span>
            <FeatureUsageLabel
              usage={usage}
              usageKey={usageKey ?? label}
              className={styles.usageContent}
              chargesClassName={styles.usageCharges}
              textClassName={styles.usageText}
              operatorClassName={styles.usageOperator}
              dotsClassName={styles.usageDots}
              iconClassName={styles.metaIcon}
              imageIconClassName={styles.metaImageIcon}
            />
          </span>
        ) : null}
        {applicationLabel ? (
          <span className={styles.metaGroup}>
            <span className={styles.metaDivider}>|</span>
            <span className={styles.applicationText}>{applicationLabel}</span>
          </span>
        ) : null}
        {visibleMetaItems.map((item, index) => {
          if (item.kind === "tracker") {
            const total = Math.max(0, Math.floor(item.total));
            const current = Math.min(total, Math.max(0, Math.floor(item.current)));

            return (
              <span key={`tracker-${index}`} className={styles.metaGroup}>
                <span className={styles.metaDivider}>|</span>
                <span className={styles.metaText}>{item.label ?? "Charges"}</span>
                <span className={clsx(sheetStyles.shortRestDots, styles.trackerDots)}>
                  {Array.from({ length: total }, (_, dotIndex) => (
                    <span
                      key={`tracker-${index}-dot-${dotIndex}`}
                      className={clsx(
                        sheetStyles.shortRestDot,
                        dotIndex < current && sheetStyles.shortRestDotActive
                      )}
                    />
                  ))}
                </span>
              </span>
            );
          }

          return (
            <span key={`${item.kind}-${index}`} className={styles.metaGroup}>
              <span className={styles.metaDivider}>|</span>
              <span className={styles.metaText}>{item.label}</span>
              {item.kind === "cost"
                ? renderFeatureUsageIcon(normalizeMetaIcon(item.icon), {
                    iconClassName: styles.metaIcon,
                    imageIconClassName: styles.metaImageIcon
                  })
                : null}
            </span>
          );
        })}
      </label>
    </div>
  );
}

export default FeatureOptInToggle;
