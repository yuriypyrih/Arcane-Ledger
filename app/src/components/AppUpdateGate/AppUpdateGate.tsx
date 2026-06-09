import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { RefreshCw, Sparkles } from "lucide-react";
import { reloadForAppUpdate, useAppUpdateState } from "../../lib/appUpdate";
import styles from "./AppUpdateGate.module.css";

type AppUpdateRequiredPanelProps = {
  fullscreen?: boolean;
  titleId: string;
};

export function AppUpdateRequiredPanel({
  fullscreen = false,
  titleId
}: AppUpdateRequiredPanelProps) {
  const reloadButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    reloadButtonRef.current?.focus();
  }, []);

  return (
    <main className={fullscreen ? styles.fullscreen : styles.backdrop}>
      <section
        className={styles.panel}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <Sparkles className={styles.icon} aria-hidden="true" />
        <h1 id={titleId} className={styles.title}>
          Arcane Ledger updated
        </h1>
        <p className={styles.copy}>
          A newer version is ready. Reload to continue with the latest character sheet and codex
          tools.
        </p>
        <button
          ref={reloadButtonRef}
          className={styles.reloadButton}
          type="button"
          onClick={() => void reloadForAppUpdate()}
        >
          <RefreshCw className={styles.buttonIcon} aria-hidden="true" />
          <span>Reload</span>
        </button>
      </section>
    </main>
  );
}

function AppUpdateGate() {
  const updateState = useAppUpdateState();

  if (!updateState.updateRequired || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AppUpdateRequiredPanel titleId="app-update-required-title" />,
    document.body
  );
}

export default AppUpdateGate;
