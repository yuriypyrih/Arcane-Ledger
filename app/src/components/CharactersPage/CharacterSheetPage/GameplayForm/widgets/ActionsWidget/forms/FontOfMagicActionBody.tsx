import clsx from "clsx";
import { Sparkles } from "lucide-react";
import type { Character } from "../../../../../../../types";
import { getSorceryPointsRemainingForCharacter } from "../../../../../../../pages/CharactersPage/classFeatures";
import {
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended
} from "../../../../../../../pages/CharactersPage/spellcasting";
import shared from "../../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import type { FontOfMagicSelection } from "../types";
import styles from "../FontOfMagicModal.module.css";

type FontOfMagicActionBodyProps = {
  actionWarning: string | null;
  character: Character;
  selectedSelection: FontOfMagicSelection | null;
  onSelectSelection: (selection: FontOfMagicSelection) => void;
};

function FontOfMagicActionBody({
  actionWarning,
  character,
  selectedSelection,
  onSelectSelection
}: FontOfMagicActionBodyProps) {
  const sorceryPointsRemaining = getSorceryPointsRemainingForCharacter(character);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const spellSlotsRemaining = spellSlotTotals.map((total, index) =>
    Math.max(0, total - (spellSlotsExpended[index] ?? 0))
  );
  const spellSlotCreationRules = [
    { spellSlotLevel: 1, sorceryPointCost: 2, minimumSorcererLevel: 2 },
    { spellSlotLevel: 2, sorceryPointCost: 3, minimumSorcererLevel: 3 },
    { spellSlotLevel: 3, sorceryPointCost: 5, minimumSorcererLevel: 5 },
    { spellSlotLevel: 4, sorceryPointCost: 6, minimumSorcererLevel: 7 },
    { spellSlotLevel: 5, sorceryPointCost: 7, minimumSorcererLevel: 9 }
  ].filter((rule) => character.level >= rule.minimumSorcererLevel);
  const spellSlotToPointOptions = spellSlotTotals
    .map((total, index) => {
      const spellSlotLevel = index + 1;
      const remainingSlots = spellSlotsRemaining[index] ?? 0;
      const disabledReason =
        total <= 0
          ? "You don't have spell slots of this level."
          : remainingSlots <= 0
            ? "No spell slots of this level remain."
            : null;

      return {
        spellSlotLevel,
        total,
        remainingSlots,
        disabledReason
      };
    })
    .filter((option) => option.total > 0);

  return (
    <div className={styles.fontOfMagicSections}>
      <section className={styles.fontOfMagicSection}>
        <div className={styles.fontOfMagicSectionHeader}>
          <div>
            <h4>Spell Slot to Sorcery Points</h4>
            <p className={shared.helperText}>No action required.</p>
          </div>
        </div>

        {spellSlotToPointOptions.length > 0 ? (
          <div className={styles.fontOfMagicOptionGrid}>
            {spellSlotToPointOptions.map((option) => (
              <button
                key={`font-of-magic-slot-to-points-${option.spellSlotLevel}`}
                type="button"
                className={clsx(
                  styles.fontOfMagicOptionButton,
                  selectedSelection?.kind === "slot-to-points" &&
                    selectedSelection.spellSlotLevel === option.spellSlotLevel &&
                    styles.fontOfMagicOptionButtonSelected
                )}
                disabled={option.disabledReason !== null}
                onClick={() =>
                  onSelectSelection({
                    kind: "slot-to-points",
                    spellSlotLevel: option.spellSlotLevel
                  })
                }
              >
                <strong className={styles.fontOfMagicCompactLabel}>
                  <span>Level {option.spellSlotLevel} Slot</span>
                  <span aria-hidden="true">-&gt;</span>
                  <span className={styles.fontOfMagicSparkleValue}>
                    <span>{option.spellSlotLevel}</span>
                    <Sparkles size={14} />
                  </span>
                </strong>
              </button>
            ))}
          </div>
        ) : (
          <p className={shared.emptyText}>No spell slots are available to convert right now.</p>
        )}
      </section>

      <section className={styles.fontOfMagicSection}>
        <div className={styles.fontOfMagicSectionHeader}>
          <div>
            <h4>Sorcery Points to Spell Slot</h4>
            <p className={shared.helperText}>Uses your Bonus Action.</p>
          </div>
          {actionWarning ? <span className={styles.fontOfMagicWarning}>{actionWarning}</span> : null}
        </div>

        <div className={styles.fontOfMagicOptionGrid}>
          {spellSlotCreationRules.map((rule) => {
            const slotIndex = rule.spellSlotLevel - 1;
            const expendedSlots = spellSlotsExpended[slotIndex] ?? 0;
            const disabledReason =
              actionWarning ??
              (expendedSlots <= 0
                ? "You already have all of those spell slots."
                : sorceryPointsRemaining < rule.sorceryPointCost
                  ? `You need ${rule.sorceryPointCost} Sorcery Points.`
                  : null);

            return (
              <button
                key={`font-of-magic-points-to-slot-${rule.spellSlotLevel}`}
                type="button"
                className={clsx(
                  styles.fontOfMagicOptionButton,
                  selectedSelection?.kind === "points-to-slot" &&
                    selectedSelection.spellSlotLevel === rule.spellSlotLevel &&
                    styles.fontOfMagicOptionButtonSelected
                )}
                disabled={disabledReason !== null}
                onClick={() =>
                  onSelectSelection({
                    kind: "points-to-slot",
                    spellSlotLevel: rule.spellSlotLevel
                  })
                }
              >
                <strong className={styles.fontOfMagicCompactLabel}>
                  <span className={styles.fontOfMagicSparkleValue}>
                    <span>{rule.sorceryPointCost}</span>
                    <Sparkles size={14} />
                  </span>
                  <span aria-hidden="true">-&gt;</span>
                  <span>Level {rule.spellSlotLevel} Slot</span>
                </strong>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default FontOfMagicActionBody;
