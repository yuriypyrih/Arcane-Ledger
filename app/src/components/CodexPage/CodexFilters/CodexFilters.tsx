import styles from "./CodexFilters.module.css";

type CodexFiltersProps = {
  query: string;
  category: string;
  categories: string[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

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
        <span>Search</span>
        <input
          className={styles.input}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Find spells, armor, or rules"
        />
      </label>

      <label className={styles.field}>
        <span>Category</span>
        <select
          className={styles.input}
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default CodexFilters;
