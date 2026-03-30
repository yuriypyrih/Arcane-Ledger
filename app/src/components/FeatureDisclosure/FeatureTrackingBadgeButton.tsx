import clsx from "clsx";
import { BadgeAlert, BadgeCheck, BadgeX } from "lucide-react";
import type { FeatureTrackingState } from "../../codex/entries";
import styles from "./FeatureDisclosure.module.css";

const trackingBadgeConfig = {
  tracked: {
    label: "Tracked",
    icon: BadgeCheck,
    className: styles.featureTrackingButtonTracked
  },
  "semi-tracked": {
    label: "Semi Tracked",
    icon: BadgeAlert,
    className: styles.featureTrackingButtonSemiTracked
  },
  "not-tracked": {
    label: "Not Tracked",
    icon: BadgeX,
    className: styles.featureTrackingButtonNotTracked
  }
} as const;

type FeatureTrackingBadgeButtonProps = {
  trackingState: FeatureTrackingState;
  onClick?: (trackingState: FeatureTrackingState) => void;
};

function FeatureTrackingBadgeButton({
  trackingState,
  onClick
}: FeatureTrackingBadgeButtonProps) {
  const trackingBadge = trackingBadgeConfig[trackingState];

  return (
    <button
      type="button"
      className={clsx(styles.featureTrackingButton, trackingBadge.className)}
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
