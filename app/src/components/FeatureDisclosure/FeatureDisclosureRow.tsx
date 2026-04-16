import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
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
  showDivider = false,
  children,
  ...rest
}: FeatureDisclosureRowProps<TElement>) {
  const Component = (as ?? "div") as ElementType;

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
          className={styles.featureToggleButton}
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-controls={bodyId}
        >
          <span className={styles.featureHeading}>{title}</span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={clsx(styles.featureToggleIcon, !isExpanded && styles.featureToggleIconCollapsed)}
          />
          {headerMeta}
        </button>
        {trackingButton ? <div className={styles.featureHeaderActions}>{trackingButton}</div> : null}
      </div>

      {isExpanded ? (
        <div id={bodyId} className={clsx(styles.featureBody, bodyClassName)}>
          {children}
        </div>
      ) : null}
    </Component>
  );
}

export default FeatureDisclosureRow;
