import type { CodexEntry, CodexStatus } from "../../../types";
import styles from "./CodexResults.module.css";

type CodexResultsProps = {
  entries: CodexEntry[];
  status: CodexStatus;
};

function CodexResults({ entries, status }: CodexResultsProps) {
  return (
    <>
      <div className={styles.resultsHeader}>
        <h3>Entries</h3>
        <span>{entries.length} shown</span>
      </div>

      <div className={styles.grid}>
        {status === "loading" ? (
          <article className={styles.card}>
            <h4>Loading codex...</h4>
            <p>Fetching the sample JSON so the data is also available to the service worker cache.</p>
          </article>
        ) : null}

        {status === "error" ? (
          <article className={styles.card}>
            <h4>Codex unavailable</h4>
            <p>The sample JSON could not be loaded.</p>
          </article>
        ) : null}

        {status === "ready" && entries.length === 0 ? (
          <article className={styles.card}>
            <h4>No matches</h4>
            <p>Try a different search or switch the category filter back to All.</p>
          </article>
        ) : null}

        {entries.map((entry) => (
          <article key={entry.id} className={styles.card}>
            <p className={styles.badge}>{entry.category}</p>
            <h4>{entry.name}</h4>
            <small>{entry.tag}</small>
            <p>{entry.summary}</p>
          </article>
        ))}
      </div>
    </>
  );
}

export default CodexResults;
