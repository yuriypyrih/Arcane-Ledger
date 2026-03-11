import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import CodexFilters from "../../components/CodexPage/CodexFilters";
import CodexResults from "../../components/CodexPage/CodexResults";
import {
  filterCodexEntries,
  getCodexCategories,
  type CodexFilterCategory
} from "../../utils/codex";
import { ENTRY_CATEGORIES } from "../../codex/entries";
import { useCodexEntries } from "./useCodexEntries";
import styles from "./CodexPage.module.css";

function CodexPage() {
  const { entries, status } = useCodexEntries();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const categories = getCodexCategories();
  const categoryParam = searchParams.get("category");
  const category = categories.includes(categoryParam as CodexFilterCategory)
    ? (categoryParam as CodexFilterCategory)
    : ENTRY_CATEGORIES.CLASSES;
  const updateCategory = (nextCategory: CodexFilterCategory) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("category", nextCategory);
    setSearchParams(nextSearchParams, { replace: true });
  };
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
            Starter entries are currently hardcoded in <code>src/codex/entries</code>.
          </p>
        </div>

        <CodexFilters
          query={query}
          category={category}
          categories={categories}
          onQueryChange={setQuery}
          onCategoryChange={updateCategory}
        />
      </div>

      <CodexResults entries={filteredEntries} status={status} category={category} />
    </section>
  );
}

export default CodexPage;
