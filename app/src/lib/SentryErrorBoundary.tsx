import type { ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import styles from "./SentryErrorBoundary.module.css";

type SentryErrorBoundaryProps = {
  children: ReactNode;
};

function reloadHomePage() {
  window.location.assign("/");
}

function ErrorFallback() {
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
        <button className={styles.reloadButton} type="button" onClick={reloadHomePage}>
          <RefreshCw className={styles.buttonIcon} aria-hidden="true" />
          <span>Reload</span>
        </button>
      </section>
    </main>
  );
}

export function SentryErrorBoundary({ children }: SentryErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={() => <ErrorFallback />}
      beforeCapture={(scope) => {
        scope.setTag("area", "frontend-render");
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
