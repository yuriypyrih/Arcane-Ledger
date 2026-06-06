import {
  Award,
  Backpack,
  BookOpen,
  PawPrint,
  ScrollText,
  Sparkles,
  UserRound,
  type LucideIcon
} from "lucide-react";
import {
  CODEX_FEATS_CATEGORY,
  CODEX_SPELL_SPECIAL_FILTERS,
  getCodexSpellSpecialFilterLabel,
  type CodexFilterCategory,
  type CodexSpellSpecialFilter
} from "../../../utils/codex";
import {
  BACKGROUND_SOURCE_VALUES,
  ENTRY_CATEGORIES,
  FEAT_CATEGORY,
  MAGIC_SCHOOL,
  SPELL_LIST_CLASS,
  type BackgroundSource
} from "../../../codex/entries";
import ItemBrowserFilters from "../../ItemBrowser";
import {
  FEAT_SOURCE_VALUES,
  type FeatSource
} from "../../../pages/CharactersPage/feats/source";
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
  searchResetSignal?: unknown;
  category: CodexFilterCategory;
  categories: CodexFilterCategory[];
  spellLevelFilter: number | null;
  spellClassFilter: SPELL_LIST_CLASS | null;
  spellSchoolFilter: MAGIC_SCHOOL | null;
  spellSpecialFilter: CodexSpellSpecialFilter | null;
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
  backgroundSourceFilter: BackgroundSource | null;
  featCategoryFilter: FEAT_CATEGORY | null;
  featSourceFilter: FeatSource | null;
  itemFilterOptions: ItemFilterOptions | null;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: CodexFilterCategory) => void;
  onSpellLevelFilterChange: (value: number | null) => void;
  onSpellClassFilterChange: (value: SPELL_LIST_CLASS | null) => void;
  onSpellSchoolFilterChange: (value: MAGIC_SCHOOL | null) => void;
  onSpellSpecialFilterChange: (value: CodexSpellSpecialFilter | null) => void;
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
  onBackgroundSourceFilterChange: (value: BackgroundSource | null) => void;
  onFeatCategoryFilterChange: (value: FEAT_CATEGORY | null) => void;
  onFeatSourceFilterChange: (value: FeatSource | null) => void;
};

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function formatCategoryOptionLabel(category: CodexFilterCategory): string {
  if (category === ENTRY_CATEGORIES.ITEMS) {
    return "Equipment";
  }

  if (category === ENTRY_CATEGORIES.MONSTERS) {
    return "Bestiary";
  }

  return formatEnumLabel(category);
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
const spellSchoolOptions = Object.values(MAGIC_SCHOOL);
const featCategoryOptions = [
  FEAT_CATEGORY.ORIGIN,
  FEAT_CATEGORY.GENERAL,
  FEAT_CATEGORY.FIGHTING_STYLE,
  FEAT_CATEGORY.EPIC_BOON
];

const categoryIcons: Partial<Record<CodexFilterCategory, LucideIcon>> = {
  [ENTRY_CATEGORIES.BACKGROUNDS]: ScrollText,
  [ENTRY_CATEGORIES.MONSTERS]: PawPrint,
  [ENTRY_CATEGORIES.CLASSES]: BookOpen,
  [ENTRY_CATEGORIES.ITEMS]: Backpack,
  [CODEX_FEATS_CATEGORY]: Award,
  [ENTRY_CATEGORIES.SPECIES]: UserRound,
  [ENTRY_CATEGORIES.SPELLS]: Sparkles
};

function formatFeatCategoryOptionLabel(category: FEAT_CATEGORY): string {
  return category === FEAT_CATEGORY.EPIC_BOON ? "Boon" : formatEnumLabel(category);
}

function CodexFilters({
  query,
  searchResetSignal,
  category,
  categories,
  spellLevelFilter,
  spellClassFilter,
  spellSchoolFilter,
  spellSpecialFilter,
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
  backgroundSourceFilter,
  featCategoryFilter,
  featSourceFilter,
  itemFilterOptions,
  onQueryChange,
  onCategoryChange,
  onSpellLevelFilterChange,
  onSpellClassFilterChange,
  onSpellSchoolFilterChange,
  onSpellSpecialFilterChange,
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
  onItemSourceFilterChange,
  onBackgroundSourceFilterChange,
  onFeatCategoryFilterChange,
  onFeatSourceFilterChange
}: CodexFiltersProps) {
  const searchPlaceholder =
    category === ENTRY_CATEGORIES.ITEMS
      ? "Search equipment names..."
      : category === CODEX_FEATS_CATEGORY
        ? "Search feat names..."
        : category === ENTRY_CATEGORIES.SPELLS
          ? "Search spell names..."
          : category === ENTRY_CATEGORIES.MONSTERS
            ? "Search monster names..."
            : "Search names...";

  return (
    <div className={styles.controls}>
      <div className={styles.categoryTabs} role="radiogroup" aria-label="Compendium category">
        {categories.map((item) => {
          const CategoryIcon = categoryIcons[item] ?? BookOpen;
          const selected = item === category;

          return (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`${styles.categoryTab} ${selected ? styles.categoryTabActive : ""}`}
              onClick={() => {
                if (!selected) {
                  onCategoryChange(item);
                }
              }}
            >
              <span className={styles.categoryTabContent}>
                <span className={styles.categoryTabIcon} aria-hidden="true">
                  <CategoryIcon size={26} strokeWidth={2.1} />
                </span>
                <span className={styles.categoryTabLabel}>{formatCategoryOptionLabel(item)}</span>
              </span>
            </button>
          );
        })}
      </div>

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

          <label className={styles.field}>
            <span>School</span>
            <select
              className={styles.input}
              value={spellSchoolFilter ?? "ALL"}
              onChange={(event) =>
                onSpellSchoolFilterChange(
                  event.target.value === "ALL" ? null : (event.target.value as MAGIC_SCHOOL)
                )
              }
            >
              <option value="ALL">All</option>
              {spellSchoolOptions.map((magicSchool) => (
                <option key={magicSchool} value={magicSchool}>
                  {formatEnumLabel(magicSchool)}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Special</span>
            <select
              className={styles.input}
              value={spellSpecialFilter ?? "ALL"}
              onChange={(event) =>
                onSpellSpecialFilterChange(
                  event.target.value === "ALL"
                    ? null
                    : (event.target.value as CodexSpellSpecialFilter)
                )
              }
            >
              <option value="ALL">All</option>
              {CODEX_SPELL_SPECIAL_FILTERS.map((filter) => (
                <option key={filter} value={filter}>
                  {getCodexSpellSpecialFilterLabel(filter)}
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

      {category === CODEX_FEATS_CATEGORY ? (
        <>
          <label className={styles.field}>
            <span>Feat Category</span>
            <select
              className={styles.input}
              value={featCategoryFilter ?? "ALL"}
              onChange={(event) =>
                onFeatCategoryFilterChange(
                  event.target.value === "ALL" ? null : (event.target.value as FEAT_CATEGORY)
                )
              }
            >
              <option value="ALL">All</option>
              {featCategoryOptions.map((featCategory) => (
                <option key={featCategory} value={featCategory}>
                  {formatFeatCategoryOptionLabel(featCategory)}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Source</span>
            <select
              className={styles.input}
              value={featSourceFilter ?? "ALL"}
              onChange={(event) =>
                onFeatSourceFilterChange(
                  event.target.value === "ALL" ? null : (event.target.value as FeatSource)
                )
              }
            >
              <option value="ALL">All</option>
              {FEAT_SOURCE_VALUES.map((featSource) => (
                <option key={featSource} value={featSource}>
                  {featSource}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : null}

      {category === ENTRY_CATEGORIES.BACKGROUNDS ? (
        <label className={styles.field}>
          <span>Source</span>
          <select
            className={styles.input}
            value={backgroundSourceFilter ?? "ALL"}
            onChange={(event) =>
              onBackgroundSourceFilterChange(
                event.target.value === "ALL" ? null : (event.target.value as BackgroundSource)
              )
            }
          >
            <option value="ALL">All</option>
            {BACKGROUND_SOURCE_VALUES.map((backgroundSource) => (
              <option key={backgroundSource} value={backgroundSource}>
                {backgroundSource}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {category === ENTRY_CATEGORIES.ITEMS ? (
        <div className={styles.itemControls}>
          <ItemBrowserFilters
            query={query}
            searchResetSignal={searchResetSignal}
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
            resetSignal={searchResetSignal}
            onValueChange={onQueryChange}
            placeholder={searchPlaceholder}
          />
        </label>
      ) : null}
    </div>
  );
}

export default CodexFilters;
