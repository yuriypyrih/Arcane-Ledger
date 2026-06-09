import { useEffect, type ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { AppUpdateRequiredPanel } from "../components/AppUpdateGate";
import { markAssetLoadFailureUpdateRequired } from "./appUpdate";
import { isStaleAssetLoadError } from "./staleAssetLoadError";
import styles from "./SentryErrorBoundary.module.css";

type SentryErrorBoundaryProps = {
  children: ReactNode;
};

function reloadCurrentPage() {
  window.location.reload();
}

function GenericErrorFallback() {
  return (
    <main className={styles.root}>
      <section className={styles.message} role="alert" aria-labelledby="app-crash-title">
        <TriangleAlert className={styles.icon} aria-hidden="true" />
        <h1 id="app-crash-title" className={styles.title}>
          The app crashed
        </h1>
        <p className={styles.copy}>
          Arcane Ledger hit an unexpected error. The Admin has been informed. Apologies for the
          inconvenience.
        </p>
        <button className={styles.reloadButton} type="button" onClick={reloadCurrentPage}>
          <RefreshCw className={styles.buttonIcon} aria-hidden="true" />
          <span>Reload</span>
        </button>
      </section>
    </main>
  );
}

function AssetLoadErrorFallback() {
  useEffect(() => {
    markAssetLoadFailureUpdateRequired();
  }, []);

  return <AppUpdateRequiredPanel fullscreen titleId="stale-asset-update-required-title" />;
}

function ErrorFallback({ error }: { error: unknown }) {
  if (isStaleAssetLoadError(error)) {
    return <AssetLoadErrorFallback />;
  }

  return <GenericErrorFallback />;
}

export function SentryErrorBoundary({ children }: SentryErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error }) => <ErrorFallback error={error} />}
      beforeCapture={(scope, error) => {
        const isAssetLoadFailure = isStaleAssetLoadError(error);
        scope.setTag("area", isAssetLoadFailure ? "frontend-update" : "frontend-render");

        if (isAssetLoadFailure) {
          scope.setTag("update_reason", "asset-load-failure");
        }
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
