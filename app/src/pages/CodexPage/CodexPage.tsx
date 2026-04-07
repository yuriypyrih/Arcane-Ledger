import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CodexFilters from "../../components/CodexPage/CodexFilters";
import CodexResults from "../../components/CodexPage/CodexResults";
import MonsterCodexTable from "../../components/CodexPage/MonsterCodexTable";
import CodexSpellDrawer from "../../components/CodexPage/CodexSpellDrawer";
import { MONSTER_SOURCE_OPTIONS, MONSTER_TYPE_OPTIONS } from "../../constants/monsters";
import { filterCodexEntries, getCodexCategories, type CodexFilterCategory } from "../../utils/codex";
import { ENTRY_CATEGORIES, SPELL_LIST_CLASS, type SpellEntry } from "../../codex/entries";
import { useCodexEntries } from "./useCodexEntries";
import {
  clearCategoryScopedSearchParams,
  hasCategoryScopedSearchParams,
  MONSTERS_PER_PAGE,
  MONSTER_ORDER_PARAM,
  MONSTER_SOURCE_PARAM,
  MONSTER_TYPE_PARAM,
  parseCodexSearchState,
  QUERY_PARAM,
  resetPageSearchParam,
  setPageSearchParam,
  setSearchParamValue,
  SPELL_CLASS_PARAM,
  SPELL_LEVEL_PARAM,
  SPELLS_PER_PAGE
} from "./searchParams";
import { useMonsterEntries } from "./useMonsterEntries";
import type { MonsterOrdering } from "../../types";
import styles from "./CodexPage.module.css";

function CodexPage() {
  const { entries, status } = useCodexEntries();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSpell, setSelectedSpell] = useState<SpellEntry | null>(null);
  const categories = getCodexCategories();
  const {
    category,
    currentPage,
    monsterOrdering,
    monsterSourceFilter,
    monsterTypeFilter,
    query,
    spellClassFilter,
    spellLevelFilter
  } = useMemo(
    () => parseCodexSearchState(searchParams, categories),
    [categories, searchParams]
  );
  const {
    payload: monsterPayload,
    status: monsterStatus
  } = useMonsterEntries({
    enabled: category === ENTRY_CATEGORIES.MONSTERS,
    page: currentPage,
    limit: MONSTERS_PER_PAGE,
    search: query,
    type: monsterTypeFilter,
    source: monsterSourceFilter,
    ordering: monsterOrdering
  });
  const updateCategory = useCallback(
    (nextCategory: CodexFilterCategory) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set("category", nextCategory);
      resetPageSearchParam(nextSearchParams);
      clearCategoryScopedSearchParams(nextSearchParams, nextCategory);

      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    if (
      category === ENTRY_CATEGORIES.SPELLS ||
      category === ENTRY_CATEGORIES.MONSTERS ||
      !hasCategoryScopedSearchParams(searchParams)
    ) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    clearCategoryScopedSearchParams(nextSearchParams, category);
    resetPageSearchParam(nextSearchParams);
    setSearchParams(nextSearchParams, { replace: true });
  }, [category, searchParams, setSearchParams]);

  useEffect(() => {
    if (category === ENTRY_CATEGORIES.SPELLS) {
      return;
    }

    setSelectedSpell(null);
  }, [category]);

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
      : category === ENTRY_CATEGORIES.MONSTERS
        ? Math.max(1, Math.ceil((monsterPayload?.count ?? 0) / MONSTERS_PER_PAGE))
        : 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (
      ((category === ENTRY_CATEGORIES.SPELLS && status !== "ready") ||
        (category === ENTRY_CATEGORIES.MONSTERS && monsterStatus !== "ready")) ||
      (category !== ENTRY_CATEGORIES.SPELLS && category !== ENTRY_CATEGORIES.MONSTERS) ||
      currentPage === safeCurrentPage
    ) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    setPageSearchParam(nextSearchParams, safeCurrentPage);

    setSearchParams(nextSearchParams, { replace: true });
  }, [category, currentPage, monsterStatus, safeCurrentPage, searchParams, setSearchParams, status]);

  const visibleEntries = useMemo(() => {
    if (category !== ENTRY_CATEGORIES.SPELLS) {
      return sortedEntries;
    }

    const startIndex = (safeCurrentPage - 1) * SPELLS_PER_PAGE;
    return sortedEntries.slice(startIndex, startIndex + SPELLS_PER_PAGE);
  }, [category, safeCurrentPage, sortedEntries]);
  const handleQueryChange = useCallback(
    (value: string) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, QUERY_PARAM, value.trim().length === 0 ? null : value);
      resetPageSearchParam(nextSearchParams);

      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleSpellLevelFilterChange = useCallback(
    (value: number | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, SPELL_LEVEL_PARAM, value);
      resetPageSearchParam(nextSearchParams);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleSpellClassFilterChange = useCallback(
    (value: SPELL_LIST_CLASS | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, SPELL_CLASS_PARAM, value);
      resetPageSearchParam(nextSearchParams);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleMonsterTypeFilterChange = useCallback(
    (value: string | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, MONSTER_TYPE_PARAM, value);
      resetPageSearchParam(nextSearchParams);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleMonsterSourceFilterChange = useCallback(
    (value: string | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, MONSTER_SOURCE_PARAM, value);
      resetPageSearchParam(nextSearchParams);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleMonsterOrderingChange = useCallback(
    (value: MonsterOrdering) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, MONSTER_ORDER_PARAM, value === "name" ? null : value);
      resetPageSearchParam(nextSearchParams);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handlePageChange = useCallback(
    (page: number) => {
      const nextPage = Math.max(1, Math.min(totalPages, page));
      const nextSearchParams = new URLSearchParams(searchParams);
      setPageSearchParam(nextSearchParams, nextPage);

      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams, totalPages]
  );
  const handleSpellSelect = useCallback((spell: SpellEntry) => {
    setSelectedSpell(spell);
  }, []);
  const codexSearch = searchParams.toString();
  const isMonsterCategory = category === ENTRY_CATEGORIES.MONSTERS;
  const headerDescription = isMonsterCategory
    ? "Monster entries are loaded from the local backend and kept paginated at 50 per page."
    : "Starter entries are currently hardcoded in src/codex/entries.";

  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Encyclopedia</p>
            <h2 className={styles.title}>Search the codex.</h2>
          </div>
          <p className={styles.description}>{headerDescription}</p>
        </div>

        <CodexFilters
          query={query}
          category={category}
          categories={categories}
          spellLevelFilter={spellLevelFilter}
          spellClassFilter={spellClassFilter}
          monsterTypeFilter={monsterTypeFilter}
          monsterTypeOptions={MONSTER_TYPE_OPTIONS}
          monsterSourceFilter={monsterSourceFilter}
          monsterSourceOptions={MONSTER_SOURCE_OPTIONS}
          onQueryChange={handleQueryChange}
          onCategoryChange={updateCategory}
          onSpellLevelFilterChange={handleSpellLevelFilterChange}
          onSpellClassFilterChange={handleSpellClassFilterChange}
          onMonsterTypeFilterChange={handleMonsterTypeFilterChange}
          onMonsterSourceFilterChange={handleMonsterSourceFilterChange}
        />
      </div>

      {isMonsterCategory ? (
        <MonsterCodexTable
          monsters={monsterPayload?.results ?? []}
          totalEntries={monsterPayload?.count ?? 0}
          status={monsterStatus}
          search={codexSearch}
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          ordering={monsterOrdering}
          onOrderingChange={handleMonsterOrderingChange}
        />
      ) : (
        <CodexResults
          entries={visibleEntries}
          totalEntries={sortedEntries.length}
          status={status}
          category={category}
          search={codexSearch}
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onSpellSelect={handleSpellSelect}
        />
      )}

      {selectedSpell ? (
        <CodexSpellDrawer spell={selectedSpell} onClose={() => setSelectedSpell(null)} />
      ) : null}
    </section>
  );
}

export default CodexPage;
