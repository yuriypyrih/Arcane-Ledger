import clsx from "clsx";
import { Brain, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendMonkFocusPointForCharacter,
  getMonkFocusPointsRemainingForCharacter,
  getMonkFocusPointsTotalForCharacter,
  restoreAllMonkFocusPointsForCharacter,
  restoreMonkFocusPointForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./FocusPointsWidget.module.css";

type FocusPointsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function FocusPointsWidget({ character, onPersistCharacter }: FocusPointsWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const totalFocusPoints = getMonkFocusPointsTotalForCharacter(character);
  const remainingFocusPoints = getMonkFocusPointsRemainingForCharacter(character);

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

  if (totalFocusPoints <= 0) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={clsx(shared.editButton, styles.button)}
        onClick={() => setIsOpen(true)}
      >
        <Brain size={16} />
        <span>{remainingFocusPoints}/{totalFocusPoints} Focus Points</span>
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
            aria-labelledby="focus-points-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Monk</p>
                <h3 id="focus-points-modal-title" className={sheetStyles.sheetPanelTitle}>
                  Focus Points {remainingFocusPoints}/{totalFocusPoints}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close Focus Points"
              >
                <X size={18} />
              </button>
            </div>

            <p className={styles.description}>
              Manage your current Focus Points and keep the gameplay tracker in sync.
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={shared.saveButton}
                disabled={remainingFocusPoints >= totalFocusPoints}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreMonkFocusPointForCharacter(currentCharacter)
                  )
                }
              >
                Add 1
                <Brain size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingFocusPoints <= 0}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    expendMonkFocusPointForCharacter(currentCharacter)
                  )
                }
              >
                Use 1
                <Brain size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingFocusPoints >= totalFocusPoints}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreAllMonkFocusPointsForCharacter(currentCharacter)
                  )
                }
              >
                Reset all
                <Brain size={14} />
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default FocusPointsWidget;
