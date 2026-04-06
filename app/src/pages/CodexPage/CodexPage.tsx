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
import { useMonsterEntries } from "./useMonsterEntries";
import type { MonsterOrdering } from "../../types";
import styles from "./CodexPage.module.css";

const SPELLS_PER_PAGE = 20;
const MONSTERS_PER_PAGE = 50;
const SPELL_LEVEL_PARAM = "spellLevel";
const SPELL_CLASS_PARAM = "spellClass";
const MONSTER_TYPE_PARAM = "monsterType";
const MONSTER_SOURCE_PARAM = "monsterSource";
const MONSTER_ORDER_PARAM = "monsterOrder";
const PAGE_PARAM = "page";
const QUERY_PARAM = "q";
const MONSTER_ORDERINGS = new Set<string>([
  "name",
  "-name",
  "cr",
  "-cr",
  "challenge_rating",
  "-challenge_rating"
]);
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

function parseMonsterOrdering(value: string | null): MonsterOrdering {
  if (!value || !MONSTER_ORDERINGS.has(value)) {
    return "name";
  }

  if (value === "challenge_rating") {
    return "cr";
  }

  if (value === "-challenge_rating") {
    return "-cr";
  }

  return value as MonsterOrdering;
}

function parseMonsterTypeFilter(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return MONSTER_TYPE_OPTIONS.includes(value as (typeof MONSTER_TYPE_OPTIONS)[number]) ? value : null;
}

function parseMonsterSourceFilter(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return MONSTER_SOURCE_OPTIONS.includes(value as (typeof MONSTER_SOURCE_OPTIONS)[number])
    ? value
    : null;
}

function CodexPage() {
  const { entries, status } = useCodexEntries();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSpell, setSelectedSpell] = useState<SpellEntry | null>(null);
  const categories = getCodexCategories();
  const categoryParam = searchParams.get("category");
  const category = categories.includes(categoryParam as CodexFilterCategory)
    ? (categoryParam as CodexFilterCategory)
    : ENTRY_CATEGORIES.CLASSES;
  const query = searchParams.get(QUERY_PARAM) ?? "";
  const spellLevelFilter = parseSpellLevelFilter(searchParams.get(SPELL_LEVEL_PARAM));
  const spellClassFilter = parseSpellClassFilter(searchParams.get(SPELL_CLASS_PARAM));
  const monsterTypeFilter = parseMonsterTypeFilter(searchParams.get(MONSTER_TYPE_PARAM));
  const monsterSourceFilter = parseMonsterSourceFilter(searchParams.get(MONSTER_SOURCE_PARAM));
  const monsterOrdering = parseMonsterOrdering(searchParams.get(MONSTER_ORDER_PARAM));
  const currentPage = parsePageValue(searchParams.get(PAGE_PARAM));
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
      nextSearchParams.delete(PAGE_PARAM);

      if (nextCategory !== ENTRY_CATEGORIES.SPELLS) {
        nextSearchParams.delete(SPELL_LEVEL_PARAM);
        nextSearchParams.delete(SPELL_CLASS_PARAM);
      }

      if (nextCategory !== ENTRY_CATEGORIES.MONSTERS) {
        nextSearchParams.delete(MONSTER_TYPE_PARAM);
        nextSearchParams.delete(MONSTER_SOURCE_PARAM);
        nextSearchParams.delete(MONSTER_ORDER_PARAM);
      }

      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    if (category === ENTRY_CATEGORIES.SPELLS || category === ENTRY_CATEGORIES.MONSTERS) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    const hadSpellParams =
      nextSearchParams.has(SPELL_LEVEL_PARAM) ||
      nextSearchParams.has(SPELL_CLASS_PARAM) ||
      nextSearchParams.has(MONSTER_TYPE_PARAM) ||
      nextSearchParams.has(MONSTER_SOURCE_PARAM) ||
      nextSearchParams.has(MONSTER_ORDER_PARAM) ||
      nextSearchParams.has(PAGE_PARAM);

    if (!hadSpellParams) {
      return;
    }

    nextSearchParams.delete(SPELL_LEVEL_PARAM);
    nextSearchParams.delete(SPELL_CLASS_PARAM);
    nextSearchParams.delete(MONSTER_TYPE_PARAM);
    nextSearchParams.delete(MONSTER_SOURCE_PARAM);
    nextSearchParams.delete(MONSTER_ORDER_PARAM);
    nextSearchParams.delete(PAGE_PARAM);
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

    if (safeCurrentPage <= 1) {
      nextSearchParams.delete(PAGE_PARAM);
    } else {
      nextSearchParams.set(PAGE_PARAM, String(safeCurrentPage));
    }

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

      if (value.trim().length === 0) {
        nextSearchParams.delete(QUERY_PARAM);
      } else {
        nextSearchParams.set(QUERY_PARAM, value);
      }

      if (nextSearchParams.has(PAGE_PARAM)) {
        nextSearchParams.delete(PAGE_PARAM);
      }

      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
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
  const handleMonsterTypeFilterChange = useCallback(
    (value: string | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);

      if (value === null) {
        nextSearchParams.delete(MONSTER_TYPE_PARAM);
      } else {
        nextSearchParams.set(MONSTER_TYPE_PARAM, value);
      }

      nextSearchParams.delete(PAGE_PARAM);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleMonsterSourceFilterChange = useCallback(
    (value: string | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);

      if (value === null) {
        nextSearchParams.delete(MONSTER_SOURCE_PARAM);
      } else {
        nextSearchParams.set(MONSTER_SOURCE_PARAM, value);
      }

      nextSearchParams.delete(PAGE_PARAM);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleMonsterOrderingChange = useCallback(
    (value: MonsterOrdering) => {
      const nextSearchParams = new URLSearchParams(searchParams);

      if (value === "name") {
        nextSearchParams.delete(MONSTER_ORDER_PARAM);
      } else {
        nextSearchParams.set(MONSTER_ORDER_PARAM, value);
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
