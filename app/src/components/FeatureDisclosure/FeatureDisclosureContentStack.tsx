import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./FeatureDisclosure.module.css";

type FeatureDisclosureContentStackProps = {
  className?: string;
  children?: ReactNode;
};

function FeatureDisclosureContentStack({
  className,
  children
}: FeatureDisclosureContentStackProps) {
  return <div className={clsx(styles.contentStack, className)}>{children}</div>;
}

export default FeatureDisclosureContentStack;
