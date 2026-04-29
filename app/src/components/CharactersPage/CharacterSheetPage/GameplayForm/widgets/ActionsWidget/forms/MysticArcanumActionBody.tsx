import clsx from "clsx";
import { useMemo } from "react";
import type { Character } from "../../../../../../../types";
import type { SpellEntry } from "../../../../../../../codex/entries";
import { getWarlockMysticArcanumSelectionsForCharacter } from "../../../../../../../pages/CharactersPage/classFeatures";
import SpellListRow from "../../../../../../SpellListRow";
import shared from "../../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sheetStyles from "../../../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "../DivineInterventionModal.module.css";

type MysticArcanumActionBodyProps = {
  character: Character;
  onSpellSelect: (spellLevel: number, spell: SpellEntry) => void;
};

function MysticArcanumActionBody({ character, onSpellSelect }: MysticArcanumActionBodyProps) {
  const { cantripIds, classFeatureState, className, feats, level } = character;
  const selections = useMemo(
    () =>
      getWarlockMysticArcanumSelectionsForCharacter({
        cantripIds,
        classFeatureState,
        className,
        feats,
        level
      }),
    [cantripIds, classFeatureState, className, feats, level]
  );
  const spells = useMemo(
    () =>
      selections.flatMap((selection) =>
        selection.spell
          ? [
              {
                spellLevel: selection.spellLevel,
                spell: selection.spell,
                expended: selection.expended
              }
            ]
          : []
      ),
    [selections]
  );

  return (
    <div className={clsx(sheetStyles.spellManagementList, styles.divineInterventionList)}>
      {spells.length === 0 ? (
        <p className={shared.emptyText}>
          No Mystic Arcanum spells are selected yet. Choose them in Class Features & Feats.
        </p>
      ) : (
        <ul className={styles.divineInterventionSelectionList}>
          {spells.map(({ spellLevel, spell, expended }) => (
            <li key={`${spell.id}-${spellLevel}`}>
              <SpellListRow
                spell={spell}
                onClick={() => onSpellSelect(spellLevel, spell)}
                disabled={expended}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MysticArcanumActionBody;
