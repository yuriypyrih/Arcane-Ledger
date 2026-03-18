import type { CodexFilterCategory } from "../../../utils/codex";
import { ENTRY_CATEGORIES, SPELL_LIST_CLASS } from "../../../codex/entries";
import styles from "./CodexFilters.module.css";

type CodexFiltersProps = {
  query: string;
  category: CodexFilterCategory;
  categories: CodexFilterCategory[];
  spellLevelFilter: number | null;
  spellClassFilter: SPELL_LIST_CLASS | null;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: CodexFilterCategory) => void;
  onSpellLevelFilterChange: (value: number | null) => void;
  onSpellClassFilterChange: (value: SPELL_LIST_CLASS | null) => void;
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
  onQueryChange,
  onCategoryChange,
  onSpellLevelFilterChange,
  onSpellClassFilterChange
}: CodexFiltersProps) {
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
            <span>Spell Type</span>
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

      <label className={`${styles.field} ${styles.searchField}`}>
        <span>Search</span>
        <input
          className={styles.input}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search based on name, rarity, type.."
        />
      </label>
    </div>
  );
}

export default CodexFilters;
