import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import type { Character } from "../../../../../../../types";
import type { SpellEntry } from "../../../../../../../codex/entries";
import {
  getClericDivineInterventionEnabledLevels,
  getClericDivineInterventionSpellEntries
} from "../../../../../../../pages/CharactersPage/classFeatures/cleric/cleric";
import { getSpellOutcomeSummaryForCharacter } from "../../../../../../../pages/CharactersPage/spellOutcome";
import { getSpellLevel } from "../../../../../../../pages/CharactersPage/spellcasting";
import SpellListRow from "../../../../../../SpellListRow";
import shared from "../../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sheetStyles from "../../../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "../DivineInterventionModal.module.css";

type DivineInterventionActionBodyProps = {
  character: Character;
  onSpellSelect: (spell: SpellEntry) => void;
};

function getDivineInterventionLevelGroups(spells: SpellEntry[]): Record<number, SpellEntry[]> {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce<Record<number, SpellEntry[]>>((groups, level) => {
    groups[level] = spells
      .filter((spell) => getSpellLevel(spell) === level)
      .sort((left, right) => left.name.localeCompare(right.name));

    return groups;
  }, {});
}

function DivineInterventionActionBody({
  character,
  onSpellSelect
}: DivineInterventionActionBodyProps) {
  const [activeLevel, setActiveLevel] = useState(0);
  const { abilities, classFeatureState, className, feats, level } = character;
  const enabledLevels = useMemo(
    () => getClericDivineInterventionEnabledLevels({ className, level }),
    [className, level]
  );
  const spellEntries = useMemo(
    () => getClericDivineInterventionSpellEntries({ className, level }),
    [className, level]
  );
  const spellGroups = useMemo(() => getDivineInterventionLevelGroups(spellEntries), [spellEntries]);
  const firstAvailableLevel = useMemo(
    () =>
      enabledLevels.find((level) => (spellGroups[level]?.length ?? 0) > 0) ?? enabledLevels[0] ?? 0,
    [enabledLevels, spellGroups]
  );
  const activeSpells = spellGroups[activeLevel] ?? [];
  const outcomeSummariesById = useMemo(
    () =>
      new Map(
        spellEntries.map((spell) => [
          spell.id,
          getSpellOutcomeSummaryForCharacter(
            {
              abilities,
              classFeatureState,
              className,
              feats,
              level
            },
            spell
          )
        ])
      ),
    [abilities, classFeatureState, className, feats, level, spellEntries]
  );

  useEffect(() => {
    setActiveLevel((currentLevel) => {
      if (enabledLevels.includes(currentLevel) && (spellGroups[currentLevel]?.length ?? 0) > 0) {
        return currentLevel;
      }

      return firstAvailableLevel;
    });
  }, [enabledLevels, spellGroups, firstAvailableLevel]);

  return (
    <>
      <div className={styles.divineInterventionTabRow}>
        <span className={styles.divineInterventionTabLabel}>Level</span>
        <div
          className={styles.divineInterventionTabList}
          role="tablist"
          aria-label="Divine Intervention spell levels"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
            const isDisabled = !enabledLevels.includes(level);

            return (
              <button
                key={`divine-intervention-level-${level}`}
                type="button"
                role="tab"
                aria-selected={activeLevel === level}
                className={clsx(
                  styles.divineInterventionTabButton,
                  activeLevel === level && styles.divineInterventionTabButtonActive
                )}
                onClick={() => setActiveLevel(level)}
                disabled={isDisabled}
              >
                {level === 0 ? "C" : level}
              </button>
            );
          })}
        </div>
      </div>

      <div className={clsx(sheetStyles.spellManagementList, styles.divineInterventionList)}>
        {activeSpells.length === 0 ? (
          <p className={shared.emptyText}>No spells are available at this level.</p>
        ) : (
          <ul className={styles.divineInterventionSelectionList}>
            {activeSpells.map((spell) => (
              <li key={spell.id}>
                <SpellListRow
                  spell={spell}
                  onClick={() => onSpellSelect(spell)}
                  valueSummary={outcomeSummariesById.get(spell.id) ?? ""}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default DivineInterventionActionBody;
