import clsx from "clsx";
import { PawPrint, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendDruidWildShapeUseForCharacter,
  getDruidWildShapeUsesRemainingForCharacter,
  getDruidWildShapeUsesTotalForCharacter,
  restoreAllDruidWildShapeUsesForCharacter,
  restoreDruidWildShapeUseForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./WildShapeWidget.module.css";

type WildShapeWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function WildShapeWidget({ character, onPersistCharacter }: WildShapeWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const totalUses = getDruidWildShapeUsesTotalForCharacter(character);
  const remainingUses = getDruidWildShapeUsesRemainingForCharacter(character);

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

  if (totalUses <= 0) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={clsx(shared.editButton, styles.button)}
        onClick={() => setIsOpen(true)}
      >
        <PawPrint size={16} />
        <span>{remainingUses}/{totalUses} Wild Shape</span>
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
            aria-labelledby="wild-shape-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Druid</p>
                <h3 id="wild-shape-modal-title" className={sheetStyles.sheetPanelTitle}>
                  Wild Shape {remainingUses}/{totalUses}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close Wild Shape"
              >
                <X size={18} />
              </button>
            </div>

            <p className={styles.description}>
              Manage Wild Shape uses and keep the gameplay tracker in sync.
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={shared.saveButton}
                disabled={remainingUses >= totalUses}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreDruidWildShapeUseForCharacter(currentCharacter)
                  )
                }
              >
                Add 1
                <PawPrint size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingUses <= 0}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    expendDruidWildShapeUseForCharacter(currentCharacter)
                  )
                }
              >
                Use 1
                <PawPrint size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingUses >= totalUses}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreAllDruidWildShapeUsesForCharacter(currentCharacter)
                  )
                }
              >
                Reset all
                <PawPrint size={14} />
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default WildShapeWidget;
