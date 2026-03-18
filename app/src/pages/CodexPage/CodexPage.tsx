import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CodexFilters from "../../components/CodexPage/CodexFilters";
import CodexResults from "../../components/CodexPage/CodexResults";
import {
  filterCodexEntries,
  getCodexCategories,
  type CodexFilterCategory
} from "../../utils/codex";
import { ENTRY_CATEGORIES, SPELL_LIST_CLASS } from "../../codex/entries";
import { useCodexEntries } from "./useCodexEntries";
import styles from "./CodexPage.module.css";

const SPELLS_PER_PAGE = 20;

function CodexPage() {
  const { entries, status } = useCodexEntries();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [spellLevelFilter, setSpellLevelFilter] = useState<number | null>(null);
  const [spellClassFilter, setSpellClassFilter] = useState<SPELL_LIST_CLASS | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const categories = getCodexCategories();
  const categoryParam = searchParams.get("category");
  const category = categories.includes(categoryParam as CodexFilterCategory)
    ? (categoryParam as CodexFilterCategory)
    : ENTRY_CATEGORIES.CLASSES;
  const updateCategory = useCallback(
    (nextCategory: CodexFilterCategory) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set("category", nextCategory);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    if (category === ENTRY_CATEGORIES.SPELLS) {
      return;
    }

    setSpellLevelFilter(null);
    setSpellClassFilter(null);
  }, [category]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, query, spellClassFilter, spellLevelFilter]);

  const filteredEntries = useMemo(
    () => filterCodexEntries(entries, query, category, spellLevelFilter, spellClassFilter),
    [entries, query, category, spellClassFilter, spellLevelFilter]
  );
  const sortedEntries = useMemo(() => {
    if (category !== ENTRY_CATEGORIES.SPELLS) {
      return filteredEntries;
    }

    return [...filteredEntries].sort((left, right) => {
      if (left.category !== ENTRY_CATEGORIES.SPELLS || right.category !== ENTRY_CATEGORIES.SPELLS) {
        return left.name.localeCompare(right.name);
      }

      if (left.spellLevel !== right.spellLevel) {
        return left.spellLevel - right.spellLevel;
      }

      return left.name.localeCompare(right.name);
    });
  }, [category, filteredEntries]);
  const totalPages =
    category === ENTRY_CATEGORIES.SPELLS
      ? Math.max(1, Math.ceil(sortedEntries.length / SPELLS_PER_PAGE))
      : 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage <= totalPages) {
      return;
    }

    setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const visibleEntries = useMemo(() => {
    if (category !== ENTRY_CATEGORIES.SPELLS) {
      return sortedEntries;
    }

    const startIndex = (safeCurrentPage - 1) * SPELLS_PER_PAGE;
    return sortedEntries.slice(startIndex, startIndex + SPELLS_PER_PAGE);
  }, [category, safeCurrentPage, sortedEntries]);
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);
  const handleSpellLevelFilterChange = useCallback((value: number | null) => {
    setSpellLevelFilter(value);
  }, []);
  const handleSpellClassFilterChange = useCallback((value: SPELL_LIST_CLASS | null) => {
    setSpellClassFilter(value);
  }, []);
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(totalPages, page)));
    },
    [totalPages]
  );

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
          spellLevelFilter={spellLevelFilter}
          spellClassFilter={spellClassFilter}
          onQueryChange={handleQueryChange}
          onCategoryChange={updateCategory}
          onSpellLevelFilterChange={handleSpellLevelFilterChange}
          onSpellClassFilterChange={handleSpellClassFilterChange}
        />
      </div>

      <CodexResults
        entries={visibleEntries}
        totalEntries={sortedEntries.length}
        status={status}
        category={category}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </section>
  );
}

export default CodexPage;
