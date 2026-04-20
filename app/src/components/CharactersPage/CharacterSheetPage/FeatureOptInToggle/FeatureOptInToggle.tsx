import clsx from "clsx";
import { Brain, Hexagon, Music, Pentagon, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import pyromancyIcon from "../../../../assets/svg/pyromancy.svg";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./FeatureOptInToggle.module.css";

export type FeatureOptInToggleIconKind =
  | "brain"
  | "divinity"
  | "music"
  | "psi"
  | "superiority"
  | "sparkles";

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
  metaItems?: FeatureOptInToggleMetaItem[];
  muted?: boolean;
  className?: string;
  checkboxAccentColor?: string;
};

function renderMetaIcon(icon?: FeatureOptInToggleIconKind): ReactNode {
  switch (icon) {
    case "brain":
      return <Brain size={14} strokeWidth={2.1} className={styles.metaIcon} aria-hidden="true" />;
    case "divinity":
      return <img src={pyromancyIcon} alt="" className={styles.metaImageIcon} />;
    case "music":
      return <Music size={14} strokeWidth={2.1} className={styles.metaIcon} aria-hidden="true" />;
    case "psi":
      return (
        <Hexagon size={14} strokeWidth={2.1} className={styles.metaIcon} aria-hidden="true" />
      );
    case "superiority":
      return (
        <Pentagon size={14} strokeWidth={2.1} className={styles.metaIcon} aria-hidden="true" />
      );
    case "sparkles":
      return (
        <Sparkles size={14} strokeWidth={2.1} className={styles.metaIcon} aria-hidden="true" />
      );
    default:
      return null;
  }
}

function FeatureOptInToggle({
  label,
  checked,
  onCheckedChange,
  disabled = false,
  title,
  metaItems = [],
  muted = false,
  className,
  checkboxAccentColor
}: FeatureOptInToggleProps) {
  const visibleMetaItems = metaItems.filter(
    (item) => item.kind !== "tracker" || Math.max(0, Math.floor(item.total)) > 0
  );

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
              {item.kind === "cost" ? renderMetaIcon(item.icon) : null}
            </span>
          );
        })}
      </label>
    </div>
  );
}

export default FeatureOptInToggle;
