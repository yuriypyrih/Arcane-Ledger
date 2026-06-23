import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import FeatureDisclosureBody from "./FeatureDisclosureBody";
import styles from "./FeatureDisclosure.module.css";

type FeatureDisclosureRowProps<TElement extends ElementType = "div"> = {
  as?: TElement;
  className?: string;
  title: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  bodyId?: string;
  bodyClassName?: string;
  trackingButton?: ReactNode;
  headerMeta?: ReactNode;
  endMeta?: ReactNode;
  toggleIconPlacement?: "inline" | "end";
  showDivider?: boolean;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<TElement>, "as" | "children" | "title" | "onToggle">;

function FeatureDisclosureRow<TElement extends ElementType = "div">({
  as,
  className,
  title,
  isExpanded,
  onToggle,
  bodyId,
  bodyClassName,
  trackingButton,
  headerMeta,
  endMeta,
  toggleIconPlacement = "inline",
  showDivider = false,
  children,
  ...rest
}: FeatureDisclosureRowProps<TElement>) {
  const Component = (as ?? "div") as ElementType;
  const toggleIcon = (
    <ChevronDown
      size={16}
      aria-hidden="true"
      className={clsx(
        styles.featureToggleIcon,
        !isExpanded && styles.featureToggleIconCollapsed
      )}
    />
  );

  return (
    <Component
      className={clsx(
        styles.featureItem,
        showDivider && styles.featureItemWithDivider,
        className
      )}
      {...rest}
    >
      <div className={styles.featureHeadingRow}>
        <button
          type="button"
          className={clsx(
            styles.featureToggleButton,
            toggleIconPlacement === "end" && styles.featureToggleButtonIconEnd
          )}
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-controls={bodyId}
        >
          {toggleIconPlacement === "end" ? (
            <>
              <span className={styles.featureToggleContent}>
                <span className={styles.featureHeading}>{title}</span>
                {toggleIcon}
                {headerMeta}
              </span>
              {endMeta}
            </>
          ) : (
            <>
              <span className={styles.featureHeading}>{title}</span>
              {toggleIcon}
              {headerMeta}
            </>
          )}
        </button>
        {trackingButton ? <div className={styles.featureHeaderActions}>{trackingButton}</div> : null}
      </div>

      {isExpanded ? (
        <FeatureDisclosureBody bodyId={bodyId} className={bodyClassName}>
          {children}
        </FeatureDisclosureBody>
      ) : null}
    </Component>
  );
}

export default FeatureDisclosureRow;
