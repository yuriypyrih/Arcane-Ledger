import type {
  ItemArmorType,
  ItemAttackType,
  ItemBrowserTab,
  ItemFilterOptions,
  ItemProficiencyType
} from "../../types";
import {
  getItemBrowserArmorTypeOptions,
  getItemBrowserAttackTypeOptions,
  getItemBrowserCategoryOptions,
  getItemBrowserMasteryOptions,
  getItemBrowserPropertyOptions,
  getItemBrowserProficiencyTypeOptions,
  getItemBrowserTabCount,
  ITEM_BROWSER_TAB_OPTIONS
} from "./itemBrowser";
import SearchField from "../SearchField";
import styles from "./ItemBrowserFilters.module.css";

type ItemBrowserFiltersProps = {
  query: string;
  tab: ItemBrowserTab;
  category: string | null;
  rarity: string | null;
  source: string | null;
  attackType: ItemAttackType | null;
  proficiencyType: ItemProficiencyType | null;
  mastery: string | null;
  property: string | null;
  armorType: ItemArmorType | null;
  filterOptions: ItemFilterOptions | null;
  onQueryChange: (value: string) => void;
  onTabChange: (value: ItemBrowserTab) => void;
  onCategoryChange: (value: string | null) => void;
  onRarityChange: (value: string | null) => void;
  onSourceChange: (value: string | null) => void;
  onAttackTypeChange: (value: ItemAttackType | null) => void;
  onProficiencyTypeChange: (value: ItemProficiencyType | null) => void;
  onMasteryChange: (value: string | null) => void;
  onPropertyChange: (value: string | null) => void;
  onArmorTypeChange: (value: ItemArmorType | null) => void;
};

function ItemBrowserFilters({
  query,
  tab,
  category,
  rarity,
  source,
  attackType,
  proficiencyType,
  mastery,
  property,
  armorType,
  filterOptions,
  onQueryChange,
  onTabChange,
  onCategoryChange,
  onRarityChange,
  onSourceChange,
  onAttackTypeChange,
  onProficiencyTypeChange,
  onMasteryChange,
  onPropertyChange,
  onArmorTypeChange
}: ItemBrowserFiltersProps) {
  const categoryOptions = getItemBrowserCategoryOptions(filterOptions, tab);
  const attackTypeOptions = getItemBrowserAttackTypeOptions(filterOptions, tab);
  const proficiencyTypeOptions = getItemBrowserProficiencyTypeOptions(filterOptions, tab);
  const masteryOptions = getItemBrowserMasteryOptions(filterOptions, tab);
  const propertyOptions = getItemBrowserPropertyOptions(filterOptions, tab);
  const armorTypeOptions = getItemBrowserArmorTypeOptions(filterOptions, tab);

  return (
    <div className={styles.stack}>
      <div className={styles.tabRow} role="tablist" aria-label="Item browser groups">
        {ITEM_BROWSER_TAB_OPTIONS.map((option) => {
          const isActive = tab === option.value;
          const count = getItemBrowserTabCount(filterOptions, option.value);

          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={isActive ? `${styles.tabButton} ${styles.tabButtonActive}` : styles.tabButton}
              onClick={() => onTabChange(option.value)}
            >
              <span>{option.label}</span>
              <span className={styles.tabCount}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.controls}>
        <label className={styles.field}>
          <span>Category</span>
          <select
            className={styles.input}
            value={category ?? "ALL"}
            onChange={(event) => onCategoryChange(event.target.value === "ALL" ? null : event.target.value)}
          >
            <option value="ALL">All</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {`${option.label} (${option.count})`}
              </option>
            ))}
          </select>
        </label>

        {tab === "weapons" ? (
          <>
            <label className={styles.field}>
              <span>Attack Type</span>
              <select
                className={styles.input}
                value={attackType ?? "ALL"}
                onChange={(event) =>
                  onAttackTypeChange(
                    event.target.value === "ALL" ? null : (event.target.value as ItemAttackType)
                  )
                }
              >
                <option value="ALL">All</option>
                {attackTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {`${option.label} (${option.count})`}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Proficiency</span>
              <select
                className={styles.input}
                value={proficiencyType ?? "ALL"}
                onChange={(event) =>
                  onProficiencyTypeChange(
                    event.target.value === "ALL"
                      ? null
                      : (event.target.value as ItemProficiencyType)
                  )
                }
              >
                <option value="ALL">All</option>
                {proficiencyTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {`${option.label} (${option.count})`}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Mastery</span>
              <select
                className={styles.input}
                value={mastery ?? "ALL"}
                onChange={(event) =>
                  onMasteryChange(event.target.value === "ALL" ? null : event.target.value)
                }
              >
                <option value="ALL">All</option>
                {masteryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {`${option.label} (${option.count})`}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Property</span>
              <select
                className={styles.input}
                value={property ?? "ALL"}
                onChange={(event) =>
                  onPropertyChange(event.target.value === "ALL" ? null : event.target.value)
                }
              >
                <option value="ALL">All</option>
                {propertyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {`${option.label} (${option.count})`}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        {tab === "armor" ? (
          <label className={styles.field}>
            <span>Armor Type</span>
            <select
              className={styles.input}
              value={armorType ?? "ALL"}
              onChange={(event) =>
                onArmorTypeChange(
                  event.target.value === "ALL" ? null : (event.target.value as ItemArmorType)
                )
              }
            >
              <option value="ALL">All</option>
              {armorTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {`${option.label} (${option.count})`}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className={styles.field}>
          <span>Rarity</span>
          <select
            className={styles.input}
            value={rarity ?? "ALL"}
            onChange={(event) => onRarityChange(event.target.value === "ALL" ? null : event.target.value)}
          >
            <option value="ALL">All</option>
            {(filterOptions?.rarities ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {`${option.label} (${option.count})`}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Source</span>
          <select
            className={styles.input}
            value={source ?? "ALL"}
            onChange={(event) => onSourceChange(event.target.value === "ALL" ? null : event.target.value)}
          >
            <option value="ALL">All</option>
            {(filterOptions?.sources ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {`${option.label} (${option.count})`}
              </option>
            ))}
          </select>
        </label>

        <label className={`${styles.field} ${styles.searchField}`}>
          <span>Search</span>
          <SearchField
            className={styles.input}
            value={query}
            onValueChange={onQueryChange}
            placeholder="Search by name, rarity, category, or source..."
          />
        </label>
      </div>
    </div>
  );
}

export default ItemBrowserFilters;
