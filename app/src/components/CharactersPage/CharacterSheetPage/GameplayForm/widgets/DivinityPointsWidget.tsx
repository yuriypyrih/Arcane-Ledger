import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendChannelDivinityUseForCharacter,
  getChannelDivinityUsesRemainingForCharacter,
  getChannelDivinityUsesTotalForCharacter,
  restoreAllChannelDivinityUsesForCharacter,
  restoreChannelDivinityUseForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import pyromancyIcon from "../../../../../assets/svg/pyromancy.svg";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./DivinityPointsWidget.module.css";

type DivinityPointsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function DivinityPointsWidget({ character, onPersistCharacter }: DivinityPointsWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const totalUses = getChannelDivinityUsesTotalForCharacter(character);
  const remainingUses = getChannelDivinityUsesRemainingForCharacter(character);

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
        <img src={pyromancyIcon} alt="" className={styles.icon} />
        <span>{remainingUses}/{totalUses} Channel Divinity</span>
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
            aria-labelledby="divinity-points-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>{character.className}</p>
                <h3 id="divinity-points-modal-title" className={sheetStyles.sheetPanelTitle}>
                  Channel Divinity {remainingUses}/{totalUses}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close Channel Divinity"
              >
                <X size={18} />
              </button>
            </div>

            <p className={styles.description}>
              Manage your current Channel Divinity uses and keep the gameplay tracker in sync.
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={shared.saveButton}
                disabled={remainingUses >= totalUses}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreChannelDivinityUseForCharacter(currentCharacter)
                  )
                }
              >
                Add 1
                <img src={pyromancyIcon} alt="" className={styles.actionIcon} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingUses <= 0}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    expendChannelDivinityUseForCharacter(currentCharacter)
                  )
                }
              >
                Use 1
                <img src={pyromancyIcon} alt="" className={styles.actionIcon} />
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                disabled={remainingUses >= totalUses}
                onClick={() =>
                  onPersistCharacter((currentCharacter) =>
                    restoreAllChannelDivinityUsesForCharacter(currentCharacter)
                  )
                }
              >
                Reset all
                <img src={pyromancyIcon} alt="" className={styles.actionIcon} />
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default DivinityPointsWidget;
