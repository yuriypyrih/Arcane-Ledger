import { lazy, Suspense, useState, type ReactNode } from "react";
import type { MonsterRecord } from "../../types";
import styles from "../FeatureDisclosure/FeatureDisclosure.module.css";

const MonsterEntryDrawer = lazy(() => import("./MonsterEntryDrawer"));

export default function MonsterReferenceLink({
  monster,
  children,
  className
}: {
  monster: MonsterRecord;
  children: ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={className ?? styles.inlineLinkButton}
        onClick={() => setIsOpen(true)}
      >
        {children}
      </button>
      {isOpen ? (
        <Suspense fallback={null}>
          <MonsterEntryDrawer monster={monster} status="ready" onClose={() => setIsOpen(false)} />
        </Suspense>
      ) : null}
    </>
  );
}
