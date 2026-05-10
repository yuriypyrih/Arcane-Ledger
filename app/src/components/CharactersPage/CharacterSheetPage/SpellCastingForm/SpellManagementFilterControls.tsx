import type { ChangeEvent } from "react";
import type { MAGIC_SCHOOL, SPELL_LIST_CLASS } from "../../../../codex/entries";
import { formatCodexLabel } from "../../../../utils/codex";
import SelectInput from "../../FormInputs/SelectInput";
import SearchField from "../../../SearchField";
import styles from "./SpellCastingForm.module.css";
import {
  getSpellManagementSpecialFilterLabel,
  type SpellManagementFilterOptions,
  type SpellManagementFilters as SpellManagementFilterState,
  type SpellManagementSpecialFilter
} from "./spellManagementFilters";

type SpellManagementFilterControlsProps = {
  filters: SpellManagementFilterState;
  options: SpellManagementFilterOptions;
  onFiltersChange: (filters: SpellManagementFilterState) => void;
};

const allFilterValue = "ALL";

function SpellManagementFilterControls({
  filters,
  options,
  onFiltersChange
}: SpellManagementFilterControlsProps) {
  const updateFilters = (updates: Partial<SpellManagementFilterState>) => {
    onFiltersChange({
      ...filters,
      ...updates
    });
  };

  const handleMagicSchoolChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilters({
      magicSchool:
        event.target.value === allFilterValue ? null : (event.target.value as MAGIC_SCHOOL)
    });
  };

  const handleSpellListClassChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilters({
      spellListClass:
        event.target.value === allFilterValue ? null : (event.target.value as SPELL_LIST_CLASS)
    });
  };

  const handleSpecialFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilters({
      special:
        event.target.value === allFilterValue
          ? null
          : (event.target.value as SpellManagementSpecialFilter)
    });
  };

  return (
    <div className={styles.spellManagementFilterPanel}>
      <label className={styles.spellManagementFilterField}>
        <span>Search</span>
        <SearchField
          value={filters.query}
          onValueChange={(query) => updateFilters({ query })}
          placeholder="Search spell names..."
        />
      </label>

      <label className={styles.spellManagementFilterField}>
        <span>School</span>
        <SelectInput
          value={filters.magicSchool ?? allFilterValue}
          onChange={handleMagicSchoolChange}
        >
          <option value={allFilterValue}>All</option>
          {options.magicSchools.map((magicSchool) => (
            <option key={magicSchool} value={magicSchool}>
              {formatCodexLabel(magicSchool)}
            </option>
          ))}
        </SelectInput>
      </label>

      <label className={styles.spellManagementFilterField}>
        <span>Class list</span>
        <SelectInput
          value={filters.spellListClass ?? allFilterValue}
          onChange={handleSpellListClassChange}
        >
          <option value={allFilterValue}>All</option>
          {options.spellListClasses.map((spellListClass) => (
            <option key={spellListClass} value={spellListClass}>
              {formatCodexLabel(spellListClass)}
            </option>
          ))}
        </SelectInput>
      </label>

      <label className={styles.spellManagementFilterField}>
        <span>Special</span>
        <SelectInput value={filters.special ?? allFilterValue} onChange={handleSpecialFilterChange}>
          <option value={allFilterValue}>All</option>
          {options.specialFilters.map((filter) => (
            <option key={filter} value={filter}>
              {getSpellManagementSpecialFilterLabel(filter)}
            </option>
          ))}
        </SelectInput>
      </label>
    </div>
  );
}

export default SpellManagementFilterControls;
