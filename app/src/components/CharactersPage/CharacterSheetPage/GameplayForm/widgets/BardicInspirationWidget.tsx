import clsx from "clsx";
import { Music, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendBardicInspirationUseForCharacter,
  getBardicInspirationUsesRemainingForCharacter,
  getBardicInspirationUsesTotalForCharacter,
  restoreAllBardicInspirationUsesForCharacter,
  restoreBardicInspirationUseForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./BardicInspirationWidget.module.css";

type BardicInspirationWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function BardicInspirationWidget({
  character,
  onPersistCharacter
}: BardicInspirationWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const totalUses = getBardicInspirationUsesTotalForCharacter(character);
  const remainingUses = getBardicInspirationUsesRemainingForCharacter(character);

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
        <Music size={16} />
        <span>{remainingUses}/{totalUses} Bardic Inspiration</span>
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
            aria-labelledby="bardic-inspiration-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Bard</p>
                <h3
                  id="bardic-inspiration-modal-title"
                  className={sheetStyles.sheetPanelTitle}
                >
                  Bardic Inspiration {remainingUses}/{totalUses}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close Bardic Inspiration"
              >
                <X size={18} />
              </button>
            </div>

            <p className={styles.description}>
              Manage your current Bardic Inspiration uses and keep the gameplay tracker in sync.
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={shared.saveButton}
                disabled={remainingUses >= totalUses}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreBardicInspirationUseForCharacter(currentCharacter)
                  )
                }
              >
                Add 1
                <Music size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingUses <= 0}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    expendBardicInspirationUseForCharacter(currentCharacter)
                  )
                }
              >
                Use 1
                <Music size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingUses >= totalUses}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreAllBardicInspirationUsesForCharacter(currentCharacter)
                  )
                }
              >
                Reset all
                <Music size={14} />
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default BardicInspirationWidget;
