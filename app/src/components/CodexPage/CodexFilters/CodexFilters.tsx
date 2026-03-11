import type { CodexFilterCategory } from "../../../utils/codex";
import styles from "./CodexFilters.module.css";

type CodexFiltersProps = {
  query: string;
  category: CodexFilterCategory;
  categories: CodexFilterCategory[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: CodexFilterCategory) => void;
};

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function CodexFilters({
  query,
  category,
  categories,
  onQueryChange,
  onCategoryChange
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

      <label className={styles.field}>
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
