import { useState } from "react";
import CodexFilters from "../../components/CodexPage/CodexFilters";
import CodexResults from "../../components/CodexPage/CodexResults";
import { filterCodexEntries, getCodexCategories } from "../../utils/codex";
import { useCodexEntries } from "./useCodexEntries";
import styles from "./CodexPage.module.css";

function CodexPage() {
  const { entries, status } = useCodexEntries();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = getCodexCategories(entries);
  const filteredEntries = filterCodexEntries(entries, query, category);

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

        <CodexFilters
          query={query}
          category={category}
          categories={categories}
          onQueryChange={setQuery}
          onCategoryChange={setCategory}
        />
      </div>

      <CodexResults entries={filteredEntries} status={status} />
    </section>
  );
}

export default CodexPage;
