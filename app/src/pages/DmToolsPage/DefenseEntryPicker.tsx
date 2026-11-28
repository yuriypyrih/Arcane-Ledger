import type { DefenseOption } from "./creatureDefenses";
import styles from "./DefenseEntryPicker.module.css";

type DefenseEntryPickerProps = {
  label: string;
  options: DefenseOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

/** Pick any number of predefined entries; saved entries outside the list stay visible so they are not lost. */
function DefenseEntryPicker({ label, options, selected, onChange }: DefenseEntryPickerProps) {
  const known = new Set(options.map((option) => option.value));
  const extras = selected.filter((entry) => !known.has(entry));
  const allOptions = [...options, ...extras.map((entry) => ({ label: entry, value: entry }))];

  function toggle(value: string) {
    onChange(
      selected.includes(value) ? selected.filter((entry) => entry !== value) : [...selected, value]
    );
  }

  return (
    <details className={styles.picker}>
      <summary className={styles.summary}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{selected.length > 0 ? selected.join(", ") : "None"}</span>
      </summary>
      <div className={styles.options} role="group" aria-label={label}>
        {allOptions.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => toggle(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </details>
  );
}

export default DefenseEntryPicker;
