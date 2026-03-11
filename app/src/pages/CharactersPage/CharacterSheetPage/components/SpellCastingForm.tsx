import clsx from "clsx";
import { Pencil } from "lucide-react";
import type { SpellEntry } from "../../../../codex/entries";
import { formatCodexList } from "../../../../utils/codex";
import { formatSpellGroupTitle } from "../utils";
import shared from "./CharacterSheetSectionShared.module.css";
import styles from "./SpellCastingForm.module.css";

type KnownSpellGroup = {
  level: number;
  spells: SpellEntry[];
};

type SpellCastingFormProps = {
  canCastSpells: boolean;
  className?: string;
  knownSpellGroups: KnownSpellGroup[];
  onOpenSpellDetails: (spell: SpellEntry) => void;
  onOpenSpellManagementMenu: () => void;
  spellSlotLevels: readonly number[];
  spellSlotTotals: number[];
  spellSlotsRemaining: number[];
};

function SpellCastingForm({
  canCastSpells,
  className,
  knownSpellGroups,
  onOpenSpellDetails,
  onOpenSpellManagementMenu,
  spellSlotLevels,
  spellSlotTotals,
  spellSlotsRemaining
}: SpellCastingFormProps) {
  return (
    <article className={clsx(shared.sectionCard, className, !canCastSpells && styles.spellcastingSectionDisabled)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Spellcasting</p>
          <h3 className={shared.subtitle}>Known spells and spell slots</h3>
        </div>
        <button
          type="button"
          className={shared.editButton}
          onClick={onOpenSpellManagementMenu}
          disabled={!canCastSpells}
        >
          <Pencil size={16} />
          Edit
        </button>
      </div>

      <div className={styles.spellSlotHeader}>
        <p className={styles.spellGroupTitle}>Spell slots</p>
      </div>
      <div className={styles.spellSlotGrid} aria-disabled={!canCastSpells}>
        {spellSlotLevels.map((slotLevel) => {
          const totalSlots = spellSlotTotals[slotLevel - 1] ?? 0;
          const remainingSlots = spellSlotsRemaining[slotLevel - 1] ?? 0;

          return (
            <div
              key={slotLevel}
              className={clsx(styles.spellSlotCard, totalSlots === 0 && styles.spellSlotCardEmpty)}
            >
              <span>L{slotLevel}</span>
              {totalSlots === 0 ? (
                <small className={styles.spellSlotDash}>-</small>
              ) : (
                <div className={styles.spellSlotSquares}>
                  {Array.from({ length: totalSlots }, (_, index) => (
                    <span
                      key={`${slotLevel}-${index}`}
                      className={clsx(styles.spellSlotSquare, index < remainingSlots && styles.spellSlotSquareFilled)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.spellListStack}>
        {!canCastSpells ? (
          <p className={shared.emptyText}>This class does not use spellcasting.</p>
        ) : knownSpellGroups.length === 0 ? (
          <p className={shared.emptyText}>No known spells available for this character yet.</p>
        ) : (
          knownSpellGroups.map((group) => (
            <div key={group.level} className={styles.spellGroup}>
              <p className={styles.spellGroupTitle}>{formatSpellGroupTitle(group.level)}</p>
              <ul className={styles.spellList}>
                {group.spells.map((spell) => (
                  <li key={spell.id}>
                    <button
                      type="button"
                      className={styles.spellButton}
                      onClick={() => onOpenSpellDetails(spell)}
                    >
                      <span>{spell.name}</span>
                      <small>{formatCodexList(spell.tags)}</small>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </article>
  );
}

export default SpellCastingForm;
