import clsx from "clsx";
import { Hexagon, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendFighterPsiWarriorEnergyDieForCharacter,
  getFighterPsiWarriorEnergyDiceRemainingForCharacter,
  getFighterPsiWarriorEnergyDiceTotalForCharacter,
  getFighterPsiWarriorEnergyDieForCharacter,
  restoreAllFighterPsiWarriorEnergyDiceForCharacter,
  restoreFighterPsiWarriorEnergyDieForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./PsiEnergyDiceWidget.module.css";

type PsiEnergyDiceWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function PsiEnergyDiceWidget({ character, onPersistCharacter }: PsiEnergyDiceWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const totalDice = getFighterPsiWarriorEnergyDiceTotalForCharacter(character);
  const remainingDice = getFighterPsiWarriorEnergyDiceRemainingForCharacter(character);
  const energyDie = getFighterPsiWarriorEnergyDieForCharacter(character);

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

  if (totalDice <= 0 || !energyDie) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={clsx(shared.editButton, styles.button)}
        onClick={() => setIsOpen(true)}
      >
        <Hexagon size={16} />
        <span>
          {remainingDice}/{totalDice} Psi Energy Dice
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
            aria-labelledby="psi-energy-dice-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Psi Warrior</p>
                <h3 id="psi-energy-dice-modal-title" className={sheetStyles.sheetPanelTitle}>
                  Psi Energy Dice {remainingDice}/{totalDice} {energyDie.toUpperCase()}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close Psi Energy Dice"
              >
                <X size={18} />
              </button>
            </div>

            <p className={styles.description}>
              Manage your current Psi Warrior Energy Dice. You regain one expended die on a Short
              Rest and all expended dice on a Long Rest.
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={shared.saveButton}
                disabled={remainingDice >= totalDice}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreFighterPsiWarriorEnergyDieForCharacter(currentCharacter)
                  )
                }
              >
                Add 1
                <Hexagon size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingDice <= 0}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    expendFighterPsiWarriorEnergyDieForCharacter(currentCharacter)
                  )
                }
              >
                Use 1
                <Hexagon size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingDice >= totalDice}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreAllFighterPsiWarriorEnergyDiceForCharacter(currentCharacter)
                  )
                }
              >
                Reset all
                <Hexagon size={14} />
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default PsiEnergyDiceWidget;
