import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CodexFilters from "../../components/CodexPage/CodexFilters";
import CodexResults from "../../components/CodexPage/CodexResults";
import FeatCodexList from "../../components/CodexPage/FeatCodexList";
import ItemCodexTable from "../../components/CodexPage/ItemCodexTable";
import { sanitizeItemBrowserScopedFilters } from "../../components/ItemBrowser/itemBrowser";
import MonsterCodexTable from "../../components/CodexPage/MonsterCodexTable";
import CodexSpellDrawer from "../../components/CodexPage/CodexSpellDrawer";
import { MONSTER_SOURCE_OPTIONS, MONSTER_TYPE_OPTIONS } from "../../constants/monsters";
import {
  CODEX_FEATS_CATEGORY,
  filterCodexEntries,
  getCodexCategories,
  type CodexFilterCategory
} from "../../utils/codex";
import {
  ENTRY_CATEGORIES,
  FEAT_CATEGORY,
  SPELL_LIST_CLASS,
  type SpellEntry
} from "../../codex/entries";
import { useCodexEntries } from "./useCodexEntries";
import {
  clearCategoryScopedSearchParams,
  hasCategoryScopedSearchParams,
  ITEMS_PER_PAGE,
  ITEM_ARMOR_TYPE_PARAM,
  ITEM_ATTACK_TYPE_PARAM,
  ITEM_CATEGORY_PARAM,
  ITEM_MASTERY_PARAM,
  ITEM_ORDER_PARAM,
  ITEM_PROPERTY_PARAM,
  ITEM_PROFICIENCY_TYPE_PARAM,
  ITEM_RARITY_PARAM,
  ITEM_SOURCE_PARAM,
  ITEM_TAB_PARAM,
  FEAT_CATEGORY_PARAM,
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
import { useItemEntries } from "./useItemEntries";
import { useItemFilterOptions } from "./useItemFilterOptions";
import { useMonsterEntries } from "./useMonsterEntries";
import {
  DEFAULT_ITEM_BROWSER_TAB,
  type ItemArmorType,
  type ItemAttackType,
  type ItemBrowserTab,
  type ItemOrdering,
  type ItemProficiencyType,
  type MonsterOrdering
} from "../../types";
import styles from "./CodexPage.module.css";

function CodexPage() {
  const { entries, status } = useCodexEntries();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSpell, setSelectedSpell] = useState<SpellEntry | null>(null);
  const categories = getCodexCategories();
  const {
    category,
    currentPage,
    itemArmorTypeFilter,
    itemAttackTypeFilter,
    monsterOrdering,
    monsterSourceFilter,
    monsterTypeFilter,
    itemCategoryFilter,
    itemMasteryFilter,
    itemOrdering,
    itemPropertyFilter,
    itemProficiencyTypeFilter,
    itemRarityFilter,
    itemSourceFilter,
    itemTab,
    featCategoryFilter,
    query,
    spellClassFilter,
    spellLevelFilter
  } = useMemo(() => parseCodexSearchState(searchParams, categories), [categories, searchParams]);
  const { payload: itemFilterOptionsPayload } = useItemFilterOptions(
    category === ENTRY_CATEGORIES.ITEMS
  );
  const sanitizedItemFilters = useMemo(
    () =>
      sanitizeItemBrowserScopedFilters(
        {
          tab: itemTab,
          category: itemCategoryFilter,
          attackType: itemAttackTypeFilter,
          proficiencyType: itemProficiencyTypeFilter,
          mastery: itemMasteryFilter,
          property: itemPropertyFilter,
          armorType: itemArmorTypeFilter
        },
        itemFilterOptionsPayload
      ),
    [
      itemArmorTypeFilter,
      itemAttackTypeFilter,
      itemCategoryFilter,
      itemFilterOptionsPayload,
      itemMasteryFilter,
      itemPropertyFilter,
      itemProficiencyTypeFilter,
      itemTab
    ]
  );
  const { payload: itemPayload, status: itemStatus } = useItemEntries({
    enabled: category === ENTRY_CATEGORIES.ITEMS,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: query,
    tab: sanitizedItemFilters.tab,
    category: sanitizedItemFilters.category,
    attackType: sanitizedItemFilters.attackType,
    proficiencyType: sanitizedItemFilters.proficiencyType,
    mastery: sanitizedItemFilters.mastery,
    property: sanitizedItemFilters.property,
    armorType: sanitizedItemFilters.armorType,
    rarity: itemRarityFilter,
    source: itemSourceFilter,
    ordering: itemOrdering
  });
  const { payload: monsterPayload, status: monsterStatus } = useMonsterEntries({
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
      category === ENTRY_CATEGORIES.ITEMS ||
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
    if (category !== ENTRY_CATEGORIES.ITEMS) {
      return;
    }

    if (
      itemCategoryFilter === sanitizedItemFilters.category &&
      itemAttackTypeFilter === sanitizedItemFilters.attackType &&
      itemProficiencyTypeFilter === sanitizedItemFilters.proficiencyType &&
      itemMasteryFilter === sanitizedItemFilters.mastery &&
      itemPropertyFilter === sanitizedItemFilters.property &&
      itemArmorTypeFilter === sanitizedItemFilters.armorType
    ) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    setSearchParamValue(nextSearchParams, ITEM_CATEGORY_PARAM, sanitizedItemFilters.category);
    setSearchParamValue(nextSearchParams, ITEM_ATTACK_TYPE_PARAM, sanitizedItemFilters.attackType);
    setSearchParamValue(
      nextSearchParams,
      ITEM_PROFICIENCY_TYPE_PARAM,
      sanitizedItemFilters.proficiencyType
    );
    setSearchParamValue(nextSearchParams, ITEM_MASTERY_PARAM, sanitizedItemFilters.mastery);
    setSearchParamValue(nextSearchParams, ITEM_PROPERTY_PARAM, sanitizedItemFilters.property);
    setSearchParamValue(nextSearchParams, ITEM_ARMOR_TYPE_PARAM, sanitizedItemFilters.armorType);
    resetPageSearchParam(nextSearchParams);
    setSearchParams(nextSearchParams, { replace: true });
  }, [
    category,
    itemArmorTypeFilter,
    itemAttackTypeFilter,
    itemCategoryFilter,
    itemMasteryFilter,
    itemPropertyFilter,
    itemProficiencyTypeFilter,
    sanitizedItemFilters,
    searchParams,
    setSearchParams
  ]);

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
      : category === ENTRY_CATEGORIES.ITEMS
        ? Math.max(1, Math.ceil((itemPayload?.count ?? 0) / ITEMS_PER_PAGE))
        : category === ENTRY_CATEGORIES.MONSTERS
          ? Math.max(1, Math.ceil((monsterPayload?.count ?? 0) / MONSTERS_PER_PAGE))
          : 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (
      (category === ENTRY_CATEGORIES.SPELLS && status !== "ready") ||
      (category === ENTRY_CATEGORIES.ITEMS && itemStatus !== "ready") ||
      (category === ENTRY_CATEGORIES.MONSTERS && monsterStatus !== "ready") ||
      (category !== ENTRY_CATEGORIES.SPELLS &&
        category !== ENTRY_CATEGORIES.MONSTERS &&
        category !== ENTRY_CATEGORIES.ITEMS) ||
      currentPage === safeCurrentPage
    ) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    setPageSearchParam(nextSearchParams, safeCurrentPage);

    setSearchParams(nextSearchParams, { replace: true });
  }, [
    category,
    currentPage,
    itemStatus,
    monsterStatus,
    safeCurrentPage,
    searchParams,
    setSearchParams,
    status
  ]);

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
  const handleItemCategoryFilterChange = useCallback(
    (value: string | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, ITEM_CATEGORY_PARAM, value);
      resetPageSearchParam(nextSearchParams);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleItemTabChange = useCallback(
    (value: ItemBrowserTab) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(
        nextSearchParams,
        ITEM_TAB_PARAM,
        value === DEFAULT_ITEM_BROWSER_TAB ? null : value
      );
      setSearchParamValue(nextSearchParams, ITEM_CATEGORY_PARAM, null);
      setSearchParamValue(nextSearchParams, ITEM_ATTACK_TYPE_PARAM, null);
      setSearchParamValue(nextSearchParams, ITEM_PROFICIENCY_TYPE_PARAM, null);
      setSearchParamValue(nextSearchParams, ITEM_MASTERY_PARAM, null);
      setSearchParamValue(nextSearchParams, ITEM_PROPERTY_PARAM, null);
      setSearchParamValue(nextSearchParams, ITEM_ARMOR_TYPE_PARAM, null);
      resetPageSearchParam(nextSearchParams);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleItemAttackTypeFilterChange = useCallback(
    (value: ItemAttackType | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, ITEM_ATTACK_TYPE_PARAM, value);
      resetPageSearchParam(nextSearchParams);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleItemProficiencyTypeFilterChange = useCallback(
    (value: ItemProficiencyType | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, ITEM_PROFICIENCY_TYPE_PARAM, value);
      resetPageSearchParam(nextSearchParams);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleItemArmorTypeFilterChange = useCallback(
    (value: ItemArmorType | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, ITEM_ARMOR_TYPE_PARAM, value);
      resetPageSearchParam(nextSearchParams);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleItemMasteryFilterChange = useCallback(
    (value: string | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, ITEM_MASTERY_PARAM, value);
      resetPageSearchParam(nextSearchParams);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleItemPropertyFilterChange = useCallback(
    (value: string | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, ITEM_PROPERTY_PARAM, value);
      resetPageSearchParam(nextSearchParams);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleItemRarityFilterChange = useCallback(
    (value: string | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, ITEM_RARITY_PARAM, value);
      resetPageSearchParam(nextSearchParams);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleItemSourceFilterChange = useCallback(
    (value: string | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, ITEM_SOURCE_PARAM, value);
      resetPageSearchParam(nextSearchParams);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleItemOrderingChange = useCallback(
    (value: ItemOrdering) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, ITEM_ORDER_PARAM, value === "name" ? null : value);
      resetPageSearchParam(nextSearchParams);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );
  const handleFeatCategoryFilterChange = useCallback(
    (value: FEAT_CATEGORY | null) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      setSearchParamValue(nextSearchParams, FEAT_CATEGORY_PARAM, value);
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
  const isFeatCategory = category === CODEX_FEATS_CATEGORY;
  const isMonsterCategory = category === ENTRY_CATEGORIES.MONSTERS;
  const isItemCategory = category === ENTRY_CATEGORIES.ITEMS;
  const headerDescription = isMonsterCategory
    ? "Monster entries are loaded from the local backend and kept paginated at 50 per page."
    : isFeatCategory
      ? "Feat entries are loaded from the character feature registry and show implementation tracking."
      : isItemCategory
        ? "Item entries are loaded from the local backend and exposed with backend-driven filters."
        : "Starter entries are bundled with the app.";

  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Encyclopedia</p>
            <h2 className={styles.title}>Search the library.</h2>
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
          itemTab={sanitizedItemFilters.tab}
          itemCategoryFilter={sanitizedItemFilters.category}
          itemAttackTypeFilter={sanitizedItemFilters.attackType}
          itemProficiencyTypeFilter={sanitizedItemFilters.proficiencyType}
          itemMasteryFilter={sanitizedItemFilters.mastery}
          itemPropertyFilter={sanitizedItemFilters.property}
          itemArmorTypeFilter={sanitizedItemFilters.armorType}
          itemRarityFilter={itemRarityFilter}
          itemSourceFilter={itemSourceFilter}
          featCategoryFilter={featCategoryFilter}
          itemFilterOptions={itemFilterOptionsPayload}
          onQueryChange={handleQueryChange}
          onCategoryChange={updateCategory}
          onSpellLevelFilterChange={handleSpellLevelFilterChange}
          onSpellClassFilterChange={handleSpellClassFilterChange}
          onMonsterTypeFilterChange={handleMonsterTypeFilterChange}
          onMonsterSourceFilterChange={handleMonsterSourceFilterChange}
          onItemTabChange={handleItemTabChange}
          onItemCategoryFilterChange={handleItemCategoryFilterChange}
          onItemAttackTypeFilterChange={handleItemAttackTypeFilterChange}
          onItemProficiencyTypeFilterChange={handleItemProficiencyTypeFilterChange}
          onItemMasteryFilterChange={handleItemMasteryFilterChange}
          onItemPropertyFilterChange={handleItemPropertyFilterChange}
          onItemArmorTypeFilterChange={handleItemArmorTypeFilterChange}
          onItemRarityFilterChange={handleItemRarityFilterChange}
          onItemSourceFilterChange={handleItemSourceFilterChange}
          onFeatCategoryFilterChange={handleFeatCategoryFilterChange}
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
      ) : isItemCategory ? (
        <ItemCodexTable
          items={itemPayload?.results ?? []}
          totalEntries={itemPayload?.count ?? 0}
          status={itemStatus}
          search={codexSearch}
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          ordering={itemOrdering}
          onOrderingChange={handleItemOrderingChange}
        />
      ) : isFeatCategory ? (
        <FeatCodexList query={query} featCategoryFilter={featCategoryFilter} />
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
