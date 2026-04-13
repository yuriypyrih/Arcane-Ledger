import clsx from "clsx";
import { Shield, X } from "lucide-react";
import { useEffect, useState } from "react";
import NumberInput from "../../FormInputs/NumberInput";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./TemporaryHitPoints.module.css";
import { assignManualTemporaryHitPointsForCharacter } from "../GameplayForm/hitPointState";
import {
  normalizeTemporaryHitPoints,
  normalizeTemporaryHitPointsSource
} from "../GameplayForm/gameplayStateUtils";

type TemporaryHitPointsProps = {
  temporaryHitPoints: number;
  temporaryHitPointsSource?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

function TemporaryHitPoints({
  temporaryHitPoints,
  temporaryHitPointsSource,
  onPersistCharacter
}: TemporaryHitPointsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [temporaryHitPointsDraft, setTemporaryHitPointsDraft] = useState(() =>
    normalizeTemporaryHitPoints(temporaryHitPoints)
  );
  const normalizedTemporaryHitPoints = normalizeTemporaryHitPoints(temporaryHitPoints);
  const normalizedTemporaryHitPointsSource = normalizeTemporaryHitPointsSource(
    temporaryHitPointsSource
  );
  const hasUnsavedChanges = temporaryHitPointsDraft !== normalizedTemporaryHitPoints;

  useBodyScrollLock(isModalOpen);

  useEffect(() => {
    if (!isModalOpen) {
      setTemporaryHitPointsDraft(normalizedTemporaryHitPoints);
    }
  }, [normalizedTemporaryHitPoints, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setTemporaryHitPointsDraft(normalizedTemporaryHitPoints);
        setIsModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, normalizedTemporaryHitPoints]);

  const hasTemporaryHitPoints = normalizedTemporaryHitPoints > 0;

  function openModal() {
    setTemporaryHitPointsDraft(normalizedTemporaryHitPoints);
    setIsModalOpen(true);
  }

  function closeModal() {
    setTemporaryHitPointsDraft(normalizedTemporaryHitPoints);
    setIsModalOpen(false);
  }

  function saveTemporaryHitPoints() {
    const nextTemporaryHitPoints = normalizeTemporaryHitPoints(temporaryHitPointsDraft);

    onPersistCharacter((currentCharacter) =>
      assignManualTemporaryHitPointsForCharacter(currentCharacter, nextTemporaryHitPoints)
    );

    setTemporaryHitPointsDraft(nextTemporaryHitPoints);
    setIsModalOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className={clsx(
          styles.tempHpTrigger,
          hasTemporaryHitPoints ? styles.tempHpTriggerActive : styles.tempHpTriggerInactive
        )}
        onClick={openModal}
        aria-label={`Temporary hit points: ${temporaryHitPoints}. Edit temporary hit points`}
        title="Edit temporary hit points"
      >
        <Shield size={18} />
        {hasTemporaryHitPoints ? (
          <strong className={styles.tempHpTriggerCount}>{normalizedTemporaryHitPoints}</strong>
        ) : null}
      </button>

      {isModalOpen ? (
        <div className={sheetStyles.xpPopupBackdrop} role="presentation" onClick={closeModal}>
          <section
            className={clsx(sheetStyles.xpPopupCard, styles.tempHpModalCard)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="temp-hp-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <h3 id="temp-hp-modal-title" className={sheetStyles.sheetPanelTitle}>
                  Temporary Hit Points
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={closeModal}
                aria-label="Close temporary hit points modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.tempHpModalContent}>
              <p className={styles.tempHpDescription}>
                When taking damage the temporary hit points are consumed first. They do not stack
                and they vanish after resting at a camp.
              </p>
              {normalizedTemporaryHitPoints > 0 && normalizedTemporaryHitPointsSource ? (
                <p className={styles.tempHpSource}>
                  Source: <strong>{normalizedTemporaryHitPointsSource}</strong>
                </p>
              ) : null}

              <div className={styles.tempHpFieldBlock}>
                <span className={styles.tempHpFieldLabel}>Current Temporary HP</span>
                <div className={styles.tempHpInputRow}>
                  <NumberInput
                    min={0}
                    className={styles.tempHpInput}
                    value={temporaryHitPointsDraft}
                    onChange={(event) =>
                      setTemporaryHitPointsDraft(
                        normalizeTemporaryHitPoints(event.target.value.replace(/^0+(?=\d)/, ""))
                      )
                    }
                  />
                  <button
                    type="button"
                    className={clsx(shared.saveButton, styles.tempHpSaveButton)}
                    disabled={!hasUnsavedChanges}
                    onClick={saveTemporaryHitPoints}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default TemporaryHitPoints;
