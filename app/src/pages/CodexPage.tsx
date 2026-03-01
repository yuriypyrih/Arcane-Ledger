import { useEffect, useState } from "react";
import styles from "./CodexPage.module.css";

type CodexEntry = {
  id: string;
  name: string;
  category: string;
  tag: string;
  summary: string;
};

function CodexPage() {
  const [entries, setEntries] = useState<CodexEntry[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    async function loadEntries() {
      try {
        const response = await fetch("/data/codex.sample.json");

        if (!response.ok) {
          throw new Error("Failed to load codex entries.");
        }

        const payload = (await response.json()) as CodexEntry[];

        if (!active) {
          return;
        }

        setEntries(payload);
        setStatus("ready");
      } catch {
        if (!active) {
          return;
        }

        setStatus("error");
      }
    }

    void loadEntries();

    return () => {
      active = false;
    };
  }, []);

  const categories = ["All", ...new Set(entries.map((entry) => entry.category))];

  const normalizedQuery = query.trim().toLowerCase();
  const filteredEntries = entries.filter((entry) => {
    const matchesCategory = category === "All" || entry.category === category;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      entry.name.toLowerCase().includes(normalizedQuery) ||
      entry.tag.toLowerCase().includes(normalizedQuery) ||
      entry.summary.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Encyclopedia</p>
            <h2 className={styles.title}>Search the starter codex.</h2>
          </div>
          <p className={styles.description}>
            Placeholder content lives in <code>codex.sample.json</code> and can be replaced later
            with real rules data.
          </p>
        </div>

        <div className={styles.controls}>
          <label className={styles.field}>
            <span>Search</span>
            <input
              className={styles.input}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find spells, armor, or rules"
            />
          </label>

          <label className={styles.field}>
            <span>Category</span>
            <select
              className={styles.input}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className={styles.resultsHeader}>
        <h3>Entries</h3>
        <span>{filteredEntries.length} shown</span>
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

        {status === "ready" && filteredEntries.length === 0 ? (
          <article className={styles.card}>
            <h4>No matches</h4>
            <p>Try a different search or switch the category filter back to All.</p>
          </article>
        ) : null}

        {filteredEntries.map((entry) => (
          <article key={entry.id} className={styles.card}>
            <p className={styles.badge}>{entry.category}</p>
            <h4>{entry.name}</h4>
            <small>{entry.tag}</small>
            <p>{entry.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CodexPage;
