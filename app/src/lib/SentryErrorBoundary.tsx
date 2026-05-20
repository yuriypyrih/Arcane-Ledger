import type { ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { isFrontendSentryEnabled } from "./sentry";

type SentryErrorBoundaryProps = {
  children: ReactNode;
};

function ErrorFallback({ resetError }: { resetError: () => void }) {
  return (
    <section role="alert" style={{ padding: "2rem", maxWidth: "40rem", margin: "0 auto" }}>
      <h1>Something went wrong.</h1>
      <p>Arcane Ledger hit an unexpected error.</p>
      <button type="button" onClick={resetError}>
        Try again
      </button>
    </section>
  );
}

export function SentryErrorBoundary({ children }: SentryErrorBoundaryProps) {
  if (!isFrontendSentryEnabled()) {
    return <>{children}</>;
  }

  return (
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => <ErrorFallback resetError={resetError} />}
      beforeCapture={(scope) => {
        scope.setTag("area", "frontend-render");
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
