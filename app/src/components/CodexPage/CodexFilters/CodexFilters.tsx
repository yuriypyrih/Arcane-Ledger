import type { CodexFilterCategory } from "../../../utils/codex";
import { ENTRY_CATEGORIES, SPELL_LIST_CLASS } from "../../../codex/entries";
import ItemBrowserFilters from "../../ItemBrowser";
import type {
  ItemArmorType,
  ItemAttackType,
  ItemBrowserTab,
  ItemFilterOptions,
  ItemProficiencyType
} from "../../../types";
import SearchField from "../../SearchField";
import styles from "./CodexFilters.module.css";

type CodexFiltersProps = {
  query: string;
  category: CodexFilterCategory;
  categories: CodexFilterCategory[];
  spellLevelFilter: number | null;
  spellClassFilter: SPELL_LIST_CLASS | null;
  monsterTypeFilter: string | null;
  monsterTypeOptions: readonly string[];
  monsterSourceFilter: string | null;
  monsterSourceOptions: readonly string[];
  itemTab: ItemBrowserTab;
  itemCategoryFilter: string | null;
  itemAttackTypeFilter: ItemAttackType | null;
  itemProficiencyTypeFilter: ItemProficiencyType | null;
  itemMasteryFilter: string | null;
  itemPropertyFilter: string | null;
  itemArmorTypeFilter: ItemArmorType | null;
  itemRarityFilter: string | null;
  itemSourceFilter: string | null;
  itemFilterOptions: ItemFilterOptions | null;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: CodexFilterCategory) => void;
  onSpellLevelFilterChange: (value: number | null) => void;
  onSpellClassFilterChange: (value: SPELL_LIST_CLASS | null) => void;
  onMonsterTypeFilterChange: (value: string | null) => void;
  onMonsterSourceFilterChange: (value: string | null) => void;
  onItemTabChange: (value: ItemBrowserTab) => void;
  onItemCategoryFilterChange: (value: string | null) => void;
  onItemAttackTypeFilterChange: (value: ItemAttackType | null) => void;
  onItemProficiencyTypeFilterChange: (value: ItemProficiencyType | null) => void;
  onItemMasteryFilterChange: (value: string | null) => void;
  onItemPropertyFilterChange: (value: string | null) => void;
  onItemArmorTypeFilterChange: (value: ItemArmorType | null) => void;
  onItemRarityFilterChange: (value: string | null) => void;
  onItemSourceFilterChange: (value: string | null) => void;
};

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function formatSpellLevelOptionLabel(level: number | null): string {
  if (level === null) {
    return "All";
  }

  if (level === 0) {
    return "Cantrips";
  }

  return `Spell ${level}`;
}

const spellClassOptions = Object.values(SPELL_LIST_CLASS);

function CodexFilters({
  query,
  category,
  categories,
  spellLevelFilter,
  spellClassFilter,
  monsterTypeFilter,
  monsterTypeOptions,
  monsterSourceFilter,
  monsterSourceOptions,
  itemTab,
  itemCategoryFilter,
  itemAttackTypeFilter,
  itemProficiencyTypeFilter,
  itemMasteryFilter,
  itemPropertyFilter,
  itemArmorTypeFilter,
  itemRarityFilter,
  itemSourceFilter,
  itemFilterOptions,
  onQueryChange,
  onCategoryChange,
  onSpellLevelFilterChange,
  onSpellClassFilterChange,
  onMonsterTypeFilterChange,
  onMonsterSourceFilterChange,
  onItemTabChange,
  onItemCategoryFilterChange,
  onItemAttackTypeFilterChange,
  onItemProficiencyTypeFilterChange,
  onItemMasteryFilterChange,
  onItemPropertyFilterChange,
  onItemArmorTypeFilterChange,
  onItemRarityFilterChange,
  onItemSourceFilterChange
}: CodexFiltersProps) {
  const searchPlaceholder =
    category === ENTRY_CATEGORIES.ITEMS
      ? "Search by name, rarity, category, or source..."
      : "Search based on name, rarity, type..";

  return (
    <div className={styles.controls}>
      <label className={styles.field}>
        <span>Category</span>
        <select
          className={styles.input}
          value={category}
          onChange={(event) => onCategoryChange(event.target.value as CodexFilterCategory)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {formatEnumLabel(item)}
            </option>
          ))}
        </select>
      </label>

      {category === ENTRY_CATEGORIES.SPELLS ? (
        <>
          <label className={styles.field}>
            <span>Spell Level</span>
            <select
              className={styles.input}
              value={spellLevelFilter === null ? "ALL" : String(spellLevelFilter)}
              onChange={(event) =>
                onSpellLevelFilterChange(
                  event.target.value === "ALL" ? null : Number(event.target.value)
                )
              }
            >
              {[null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                <option key={level === null ? "ALL" : level} value={level === null ? "ALL" : level}>
                  {formatSpellLevelOptionLabel(level)}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Class</span>
            <select
              className={styles.input}
              value={spellClassFilter ?? "ALL"}
              onChange={(event) =>
                onSpellClassFilterChange(
                  event.target.value === "ALL" ? null : (event.target.value as SPELL_LIST_CLASS)
                )
              }
            >
              <option value="ALL">All</option>
              {spellClassOptions.map((spellClass) => (
                <option key={spellClass} value={spellClass}>
                  {formatEnumLabel(spellClass)}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : null}

      {category === ENTRY_CATEGORIES.MONSTERS ? (
        <>
          <label className={styles.field}>
            <span>Type</span>
            <select
              className={styles.input}
              value={monsterTypeFilter ?? "ALL"}
              onChange={(event) =>
                onMonsterTypeFilterChange(event.target.value === "ALL" ? null : event.target.value)
              }
            >
              <option value="ALL">All</option>
              {monsterTypeOptions.map((monsterType) => (
                <option key={monsterType} value={monsterType}>
                  {monsterType}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Source</span>
            <select
              className={styles.input}
              value={monsterSourceFilter ?? "ALL"}
              onChange={(event) =>
                onMonsterSourceFilterChange(event.target.value === "ALL" ? null : event.target.value)
              }
            >
              <option value="ALL">All</option>
              {monsterSourceOptions.map((monsterSource) => (
                <option key={monsterSource} value={monsterSource}>
                  {monsterSource}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : null}

      {category === ENTRY_CATEGORIES.ITEMS ? (
        <div className={styles.itemControls}>
          <ItemBrowserFilters
            query={query}
            tab={itemTab}
            category={itemCategoryFilter}
            attackType={itemAttackTypeFilter}
            proficiencyType={itemProficiencyTypeFilter}
            mastery={itemMasteryFilter}
            property={itemPropertyFilter}
            armorType={itemArmorTypeFilter}
            rarity={itemRarityFilter}
            source={itemSourceFilter}
            filterOptions={itemFilterOptions}
            onQueryChange={onQueryChange}
            onTabChange={onItemTabChange}
            onCategoryChange={onItemCategoryFilterChange}
            onAttackTypeChange={onItemAttackTypeFilterChange}
            onProficiencyTypeChange={onItemProficiencyTypeFilterChange}
            onMasteryChange={onItemMasteryFilterChange}
            onPropertyChange={onItemPropertyFilterChange}
            onArmorTypeChange={onItemArmorTypeFilterChange}
            onRarityChange={onItemRarityFilterChange}
            onSourceChange={onItemSourceFilterChange}
          />
        </div>
      ) : null}

      {category !== ENTRY_CATEGORIES.ITEMS ? (
        <label className={`${styles.field} ${styles.searchField}`}>
          <span>Search</span>
          <SearchField
            className={styles.input}
            value={query}
            onValueChange={onQueryChange}
            placeholder={searchPlaceholder}
          />
        </label>
      ) : null}
    </div>
  );
}

export default CodexFilters;
