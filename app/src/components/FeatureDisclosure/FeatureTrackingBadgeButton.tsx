import clsx from "clsx";
import { BadgeAlert, BadgeCheck, BadgeX } from "lucide-react";
import { TRACKER } from "../../codex/entries";
import styles from "./FeatureDisclosure.module.css";

const trackingBadgeConfig: Record<
  TRACKER,
  {
    label: string;
    icon: typeof BadgeCheck;
    className: string;
  }
> = {
  [TRACKER.TRACKED]: {
    label: "Tracked",
    icon: BadgeCheck,
    className: styles.featureTrackingButtonTracked
  },
  [TRACKER.SEMI_TRACKED]: {
    label: "Semi Tracked",
    icon: BadgeAlert,
    className: styles.featureTrackingButtonSemiTracked
  },
  [TRACKER.NOT_TRACKED]: {
    label: "Not Tracked",
    icon: BadgeX,
    className: styles.featureTrackingButtonNotTracked
  }
};

type FeatureTrackingBadgeButtonProps = {
  trackingState: TRACKER;
  onClick?: (trackingState: TRACKER) => void;
  disabled?: boolean;
};

function FeatureTrackingBadgeButton({
  trackingState,
  onClick,
  disabled = false
}: FeatureTrackingBadgeButtonProps) {
  const trackingBadge = trackingBadgeConfig[trackingState];

  return (
    <button
      type="button"
      className={clsx(
        styles.featureTrackingButton,
        trackingBadge.className,
        disabled && styles.featureTrackingButtonDisabled
      )}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(trackingState);
      }}
    >
      <trackingBadge.icon size={18} aria-hidden="true" />
      <span>{trackingBadge.label}</span>
    </button>
  );
}

export default FeatureTrackingBadgeButton;
