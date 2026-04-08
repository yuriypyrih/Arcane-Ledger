import clsx from "clsx";
import { Pentagon, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendFighterBattleMasterSuperiorityDieForCharacter,
  getFighterBattleMasterSuperiorityDiceRemainingForCharacter,
  getFighterBattleMasterSuperiorityDiceTotalForCharacter,
  getFighterBattleMasterSuperiorityDieForCharacter,
  restoreAllFighterBattleMasterSuperiorityDiceForCharacter,
  restoreFighterBattleMasterSuperiorityDieForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./SuperiorityDiceWidget.module.css";

type SuperiorityDiceWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function SuperiorityDiceWidget({ character, onPersistCharacter }: SuperiorityDiceWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const totalDice = getFighterBattleMasterSuperiorityDiceTotalForCharacter(character);
  const remainingDice = getFighterBattleMasterSuperiorityDiceRemainingForCharacter(character);
  const superiorityDie = getFighterBattleMasterSuperiorityDieForCharacter(character);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (totalDice <= 0 || !superiorityDie) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={clsx(shared.editButton, styles.button)}
        onClick={() => setIsOpen(true)}
      >
        <Pentagon size={16} />
        <span>
          {remainingDice}/{totalDice} Superiority Dice
        </span>
      </button>

      {isOpen ? (
        <div
          className={sheetStyles.restPopupBackdrop}
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <section
            className={clsx(sheetStyles.restPopupCard, styles.modal)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="superiority-dice-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Battle Master</p>
                <h3 id="superiority-dice-modal-title" className={sheetStyles.sheetPanelTitle}>
                  Superiority Dice {remainingDice}/{totalDice} {superiorityDie.toUpperCase()}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close Superiority Dice"
              >
                <X size={18} />
              </button>
            </div>

            <p className={styles.description}>
              Manage your current Superiority Dice and keep your Battle Master maneuver pool in
              sync.
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={shared.saveButton}
                disabled={remainingDice >= totalDice}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreFighterBattleMasterSuperiorityDieForCharacter(currentCharacter)
                  )
                }
              >
                Add 1
                <Pentagon size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingDice <= 0}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    expendFighterBattleMasterSuperiorityDieForCharacter(currentCharacter)
                  )
                }
              >
                Use 1
                <Pentagon size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingDice >= totalDice}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreAllFighterBattleMasterSuperiorityDiceForCharacter(currentCharacter)
                  )
                }
              >
                Reset all
                <Pentagon size={14} />
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default SuperiorityDiceWidget;
