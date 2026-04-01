import clsx from "clsx";
import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendSorceryPointForCharacter,
  getSorceryPointsRemainingForCharacter,
  getSorceryPointsTotalForCharacter,
  restoreAllSorceryPointsForCharacter,
  restoreSorceryPointForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./SorceryPointsWidget.module.css";

type SorceryPointsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function SorceryPointsWidget({ character, onPersistCharacter }: SorceryPointsWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const totalSorceryPoints = getSorceryPointsTotalForCharacter(character);
  const remainingSorceryPoints = getSorceryPointsRemainingForCharacter(character);

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

  if (totalSorceryPoints <= 0) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={clsx(shared.editButton, styles.button)}
        onClick={() => setIsOpen(true)}
      >
        <Sparkles size={16} />
        <span>{remainingSorceryPoints}/{totalSorceryPoints} Sorcery Points</span>
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
            aria-labelledby="sorcery-points-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Sorcerer</p>
                <h3 id="sorcery-points-modal-title" className={sheetStyles.sheetPanelTitle}>
                  Sorcery Points {remainingSorceryPoints}/{totalSorceryPoints}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close Sorcery Points"
              >
                <X size={18} />
              </button>
            </div>

            <p className={styles.description}>
              Manage your current Sorcery Points and keep the gameplay tracker in sync.
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={shared.saveButton}
                disabled={remainingSorceryPoints >= totalSorceryPoints}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreSorceryPointForCharacter(currentCharacter)
                  )
                }
              >
                Add 1
                <Sparkles size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingSorceryPoints <= 0}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    expendSorceryPointForCharacter(currentCharacter)
                  )
                }
              >
                Use 1
                <Sparkles size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingSorceryPoints >= totalSorceryPoints}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreAllSorceryPointsForCharacter(currentCharacter)
                  )
                }
              >
                Reset all
                <Sparkles size={14} />
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default SorceryPointsWidget;
