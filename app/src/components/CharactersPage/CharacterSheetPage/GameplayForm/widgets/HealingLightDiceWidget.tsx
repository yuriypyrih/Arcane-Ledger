import clsx from "clsx";
import { Cross, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendWarlockHealingLightDieForCharacter,
  getWarlockHealingLightDiceRemainingForCharacter,
  getWarlockHealingLightDiceTotalForCharacter,
  restoreAllWarlockHealingLightDiceForCharacter,
  restoreWarlockHealingLightDieForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./HealingLightDiceWidget.module.css";

type HealingLightDiceWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function HealingLightDiceWidget({ character, onPersistCharacter }: HealingLightDiceWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const totalDice = getWarlockHealingLightDiceTotalForCharacter(character);
  const remainingDice = getWarlockHealingLightDiceRemainingForCharacter(character);

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

  if (totalDice <= 0) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={clsx(shared.editButton, styles.button)}
        onClick={() => setIsOpen(true)}
      >
        <Cross size={16} />
        <span>
          {remainingDice}/{totalDice} Healing d6
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
            aria-labelledby="healing-light-dice-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Celestial Patron</p>
                <h3 id="healing-light-dice-modal-title" className={sheetStyles.sheetPanelTitle}>
                  Healing d6 {remainingDice}/{totalDice}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close Healing d6"
              >
                <X size={18} />
              </button>
            </div>

            <p className={styles.description}>
              Manage your Healing Light dice and keep the gameplay tracker in sync.
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={shared.saveButton}
                disabled={remainingDice >= totalDice}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreWarlockHealingLightDieForCharacter(currentCharacter)
                  )
                }
              >
                Add 1
                <Cross size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingDice <= 0}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    expendWarlockHealingLightDieForCharacter(currentCharacter)
                  )
                }
              >
                Use 1
                <Cross size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingDice >= totalDice}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreAllWarlockHealingLightDiceForCharacter(currentCharacter)
                  )
                }
              >
                Reset all
                <Cross size={14} />
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default HealingLightDiceWidget;
