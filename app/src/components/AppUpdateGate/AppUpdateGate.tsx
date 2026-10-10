import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LoaderCircle, RefreshCw, Sparkles } from "lucide-react";
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
  const updateState = useAppUpdateState();
  const isReloading = updateState.phase === "preparing" || updateState.phase === "activating";
  const copy =
    updateState.error ??
    (updateState.phase === "activating"
      ? "Applying the update. Keep this window open."
      : isReloading
        ? "Downloading the update. Keep this window open."
        : updateState.reason === "asset-load-failure"
          ? "Some app files could not be loaded. Check your connection and try updating."
          : "An update is available. Update to continue.");

  useEffect(() => {
    reloadButtonRef.current?.focus();
  }, []);

  function handleReloadClick() {
    if (isReloading) {
      return;
    }

    void reloadForAppUpdate();
  }

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
          Arcane Ledger update
        </h1>
        <p className={styles.copy} role="status">
          {copy}
        </p>
        <button
          ref={reloadButtonRef}
          className={styles.reloadButton}
          type="button"
          onClick={handleReloadClick}
          disabled={isReloading}
          aria-busy={isReloading || undefined}
        >
          {isReloading ? (
            <LoaderCircle className={styles.loadingIcon} aria-hidden="true" />
          ) : (
            <RefreshCw className={styles.buttonIcon} aria-hidden="true" />
          )}
          <span>
            {isReloading ? "Updating" : updateState.phase === "failed" ? "Try again" : "Update"}
          </span>
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
