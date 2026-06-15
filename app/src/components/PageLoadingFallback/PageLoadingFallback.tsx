import { LoaderCircle } from "lucide-react";
import styles from "./PageLoadingFallback.module.css";

function PageLoadingFallback() {
  return (
    <section className={styles.routeFallback} aria-live="polite" aria-busy="true">
      <div className={styles.loadingPanel}>
        <h2 className={styles.loadingTitle}>
          <span>Loading</span>
          <LoaderCircle className={styles.loadingIcon} aria-hidden="true" />
        </h2>
        <p className={styles.loadingText}>Next page is loading.</p>
      </div>
    </section>
  );
}

export default PageLoadingFallback;
