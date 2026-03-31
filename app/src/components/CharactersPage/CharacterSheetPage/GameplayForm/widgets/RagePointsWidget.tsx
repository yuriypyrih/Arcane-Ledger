import clsx from "clsx";
import { Flame, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendBarbarianRageUseForCharacter,
  getBarbarianRageUsesRemainingForCharacter,
  getBarbarianRageUsesTotalForCharacter,
  restoreAllBarbarianRageUsesForCharacter,
  restoreBarbarianRageUseForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./RagePointsWidget.module.css";

type RagePointsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function RagePointsWidget({ character, onPersistCharacter }: RagePointsWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const totalRageUses = getBarbarianRageUsesTotalForCharacter(character);
  const remainingRageUses = getBarbarianRageUsesRemainingForCharacter(character);

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

  if (totalRageUses <= 0) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={clsx(shared.editButton, styles.button)}
        onClick={() => setIsOpen(true)}
      >
        <Flame size={16} />
        <span>{remainingRageUses}/{totalRageUses} Rage</span>
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
            aria-labelledby="rage-points-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Barbarian</p>
                <h3 id="rage-points-modal-title">
                  Rage {remainingRageUses}/{totalRageUses}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close Rage"
              >
                <X size={18} />
              </button>
            </div>

            <p className={styles.description}>
              Manage your current Rage uses and keep the gameplay tracker in sync.
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={shared.saveButton}
                disabled={remainingRageUses >= totalRageUses}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreBarbarianRageUseForCharacter(currentCharacter)
                  )
                }
              >
                Add 1
                <Flame size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingRageUses <= 0}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    expendBarbarianRageUseForCharacter(currentCharacter)
                  )
                }
              >
                Use 1
                <Flame size={14} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingRageUses >= totalRageUses}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreAllBarbarianRageUsesForCharacter(currentCharacter)
                  )
                }
              >
                Reset all
                <Flame size={14} />
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default RagePointsWidget;
