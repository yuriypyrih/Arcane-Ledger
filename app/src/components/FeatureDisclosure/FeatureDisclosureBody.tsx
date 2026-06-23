import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./FeatureDisclosure.module.css";

type FeatureDisclosureBodyProps = {
  bodyId?: string;
  className?: string;
  children?: ReactNode;
};

function FeatureDisclosureBody({ bodyId, className, children }: FeatureDisclosureBodyProps) {
  return (
    <div id={bodyId} className={clsx(styles.featureBody, className)}>
      {children}
    </div>
  );
}

export default FeatureDisclosureBody;
