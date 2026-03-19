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
const SPELL_LEVEL_PARAM = "spellLevel";
const SPELL_CLASS_PARAM = "spellClass";
const PAGE_PARAM = "page";

function parseSpellLevelFilter(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0 || parsedValue > 9) {
    return null;
  }

  return parsedValue;
}

function parseSpellClassFilter(value: string | null): SPELL_LIST_CLASS | null {
  if (value === null) {
    return null;
  }

  return Object.values(SPELL_LIST_CLASS).includes(value as SPELL_LIST_CLASS)
    ? (value as SPELL_LIST_CLASS)
    : null;
}

function parsePageValue(value: string | null): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
}

function CodexPage() {
  const { entries, status } = useCodexEntries();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const categories = getCodexCategories();
  const categoryParam = searchParams.get("category");
  const category = categories.includes(categoryParam as CodexFilterCategory)
    ? (categoryParam as CodexFilterCategory)
    : ENTRY_CATEGORIES.CLASSES;
  const spellLevelFilter = parseSpellLevelFilter(searchParams.get(SPELL_LEVEL_PARAM));
  const spellClassFilter = parseSpellClassFilter(searchParams.get(SPELL_CLASS_PARAM));
  const currentPage = parsePageValue(searchParams.get(PAGE_PARAM));
  const updateCategory = useCallback(
    (nextCategory: CodexFilterCategory) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set("category", nextCategory);
      nextSearchParams.delete(PAGE_PARAM);

      if (nextCategory !== ENTRY_CATEGORIES.SPELLS) {
        nextSearchParams.delete(SPELL_LEVEL_PARAM);
        nextSearchParams.delete(SPELL_CLASS_PARAM);
      }

      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    if (category === ENTRY_CATEGORIES.SPELLS) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    const hadSpellParams =
      nextSearchParams.has(SPELL_LEVEL_PARAM) ||
      nextSearchParams.has(SPELL_CLASS_PARAM) ||
      nextSearchParams.has(PAGE_PARAM);

    if (!hadSpellParams) {
      return;
    }

    nextSearchParams.delete(SPELL_LEVEL_PARAM);
    nextSearchParams.delete(SPELL_CLASS_PARAM);
    nextSearchParams.delete(PAGE_PARAM);
    setSearchParams(nextSearchParams, { replace: true });
  }, [category, searchParams, setSearchParams]);

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
    if (
      status !== "ready" ||
      category !== ENTRY_CATEGORIES.SPELLS ||
      currentPage === safeCurrentPage
    ) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);

    if (safeCurrentPage <= 1) {
      nextSearchParams.delete(PAGE_PARAM);
    } else {
      nextSearchParams.set(PAGE_PARAM, String(safeCurrentPage));
    }

    setSearchParams(nextSearchParams, { replace: true });
  }, [category, currentPage, safeCurrentPage, searchParams, setSearchParams, status]);

  const visibleEntries = useMemo(() => {
    if (category !== ENTRY_CATEGORIES.SPELLS) {
      return sortedEntries;
    }

    const startIndex = (safeCurrentPage - 1) * SPELLS_PER_PAGE;
    return sortedEntries.slice(startIndex, startIndex + SPELLS_PER_PAGE);
  }, [category, safeCurrentPage, sortedEntries]);
  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (category !== ENTRY_CATEGORIES.SPELLS || !searchParams.has(PAGE_PARAM)) {
        return;
      }

      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.delete(PAGE_PARAM);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [category, searchParams, setSearchParams]
  );
  const handleSpellLevelFilterChange = useCallback(
    (value: number | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);

      if (value === null) {
        nextSearchParams.delete(SPELL_LEVEL_PARAM);
      } else {
        nextSearchParams.set(SPELL_LEVEL_PARAM, String(value));
      }

      nextSearchParams.delete(PAGE_PARAM);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleSpellClassFilterChange = useCallback(
    (value: SPELL_LIST_CLASS | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);

      if (value === null) {
        nextSearchParams.delete(SPELL_CLASS_PARAM);
      } else {
        nextSearchParams.set(SPELL_CLASS_PARAM, value);
      }

      nextSearchParams.delete(PAGE_PARAM);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handlePageChange = useCallback(
    (page: number) => {
      const nextPage = Math.max(1, Math.min(totalPages, page));
      const nextSearchParams = new URLSearchParams(searchParams);

      if (nextPage <= 1) {
        nextSearchParams.delete(PAGE_PARAM);
      } else {
        nextSearchParams.set(PAGE_PARAM, String(nextPage));
      }

      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams, totalPages]
  );
  const codexSearch = searchParams.toString();

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
        search={codexSearch}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </section>
  );
}

export default CodexPage;
