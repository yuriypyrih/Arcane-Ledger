import clsx from "clsx";
import { Hexagon, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendRogueSoulknifePsionicDieForCharacter,
  getRogueSoulknifePsionicDiceRemainingForCharacter,
  getRogueSoulknifePsionicDiceTotalForCharacter,
  getRogueSoulknifePsionicDieForCharacter,
  restoreAllRogueSoulknifePsionicDiceForCharacter,
  restoreRogueSoulknifePsionicDieForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./PsiEnergyDiceWidget.module.css";

type SoulknifePsionicDiceWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function SoulknifePsionicDiceWidget({
  character,
  onPersistCharacter
}: SoulknifePsionicDiceWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const totalDice = getRogueSoulknifePsionicDiceTotalForCharacter(character);
  const remainingDice = getRogueSoulknifePsionicDiceRemainingForCharacter(character);
  const psionicDie = getRogueSoulknifePsionicDieForCharacter(character);

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

  if (totalDice <= 0 || !psionicDie) {
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
          {remainingDice}/{totalDice} Psionic Dice
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
            aria-labelledby="soulknife-psionic-dice-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Soulknife</p>
                <h3 id="soulknife-psionic-dice-modal-title" className={sheetStyles.sheetPanelTitle}>
                  Psionic Dice {remainingDice}/{totalDice} {psionicDie.toUpperCase()}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close Psionic Dice"
              >
                <X size={18} />
              </button>
            </div>

            <p className={styles.description}>
              Manage your current Soulknife Psionic Dice. You regain one expended die on a Short
              Rest and all expended dice on a Long Rest.
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={shared.saveButton}
                disabled={remainingDice >= totalDice}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreRogueSoulknifePsionicDieForCharacter(currentCharacter)
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
                    expendRogueSoulknifePsionicDieForCharacter(currentCharacter)
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
                    restoreAllRogueSoulknifePsionicDiceForCharacter(currentCharacter)
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

export default SoulknifePsionicDiceWidget;
