import { ACTION_TYPE, SPELL_LIST_CLASS, type SpellEntry } from "../../../../../../../codex/entries";
import { getSpellEntriesForSpellListClass } from "../../../../../../../codex/classes/spellAccess";
import SelectInput from "../../../../../FormInputs/SelectInput";
import styles from "../ActionsWidget.module.css";

const wishMagicSpellOptions = getSpellEntriesForSpellListClass(SPELL_LIST_CLASS.SORCERER)
  .filter((spell) => spell.spellLevel === 1 && spell.castingTime.includes(ACTION_TYPE.ACTION))
  .sort((left, right) => left.name.localeCompare(right.name));

const wishMagicSpellOptionsById = new Map(
  wishMagicSpellOptions.map((spell) => [spell.id, spell] as const)
);

type GenieMagicActionBodyProps = {
  selectedSpell: SpellEntry | null;
  onSpellSelect: (spell: SpellEntry | null) => void;
};

function GenieMagicActionBody({ selectedSpell, onSpellSelect }: GenieMagicActionBodyProps) {
  return (
    <div className={styles.genieMagicBody}>
      <label className={styles.genieMagicSelectField}>
        <span className={styles.genieMagicSelectLabel}>Wish Magic Spell</span>
        <SelectInput
          aria-label="Wish Magic spell"
          value={selectedSpell?.id ?? ""}
          className={styles.genieMagicSelect}
          onChange={(event) =>
            onSpellSelect(wishMagicSpellOptionsById.get(event.target.value) ?? null)
          }
        >
          <option value="">-</option>
          {wishMagicSpellOptions.map((spell) => (
            <option key={spell.id} value={spell.id}>
              {spell.name}
            </option>
          ))}
        </SelectInput>
      </label>
    </div>
  );
}

export default GenieMagicActionBody;
