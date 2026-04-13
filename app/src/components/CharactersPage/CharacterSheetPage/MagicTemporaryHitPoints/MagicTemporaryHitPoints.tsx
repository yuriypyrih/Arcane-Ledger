import clsx from "clsx";
import { Shield, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { MagicTemporaryHitPointsFeature } from "../../../../pages/CharactersPage/classFeatures/types";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { normalizeMagicTemporaryHitPoints } from "../../../../pages/CharactersPage/shared";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import NumberInput from "../../FormInputs/NumberInput";
import { assignMagicTemporaryHitPointsForCharacter } from "../GameplayForm/hitPointState";
import styles from "./MagicTemporaryHitPoints.module.css";

type MagicTemporaryHitPointsProps = {
  feature: MagicTemporaryHitPointsFeature;
  magicTemporaryHitPoints: number;
  magicTemporaryHitPointsSource?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

function MagicTemporaryHitPoints({
  feature,
  magicTemporaryHitPoints,
  magicTemporaryHitPointsSource,
  onPersistCharacter
}: MagicTemporaryHitPointsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [magicTemporaryHitPointsDraft, setMagicTemporaryHitPointsDraft] = useState(() =>
    normalizeMagicTemporaryHitPoints(magicTemporaryHitPoints)
  );
  const normalizedMagicTemporaryHitPoints = normalizeMagicTemporaryHitPoints(magicTemporaryHitPoints);
  const sourceLabel = magicTemporaryHitPointsSource ?? feature.label;
  const hasUnsavedChanges = magicTemporaryHitPointsDraft !== normalizedMagicTemporaryHitPoints;

  useBodyScrollLock(isModalOpen);

  useEffect(() => {
    if (!isModalOpen) {
      setMagicTemporaryHitPointsDraft(normalizedMagicTemporaryHitPoints);
    }
  }, [isModalOpen, normalizedMagicTemporaryHitPoints]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setMagicTemporaryHitPointsDraft(normalizedMagicTemporaryHitPoints);
        setIsModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, normalizedMagicTemporaryHitPoints]);

  function openModal() {
    setMagicTemporaryHitPointsDraft(normalizedMagicTemporaryHitPoints);
    setIsModalOpen(true);
  }

  function closeModal() {
    setMagicTemporaryHitPointsDraft(normalizedMagicTemporaryHitPoints);
    setIsModalOpen(false);
  }

  function saveMagicTemporaryHitPoints() {
    onPersistCharacter((currentCharacter) =>
      assignMagicTemporaryHitPointsForCharacter(
        currentCharacter,
        magicTemporaryHitPointsDraft,
        feature.maxHitPoints,
        sourceLabel
      )
    );

    setIsModalOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className={clsx(styles.tempHpTrigger, styles.tempHpTriggerActive)}
        onClick={openModal}
        aria-label={`${feature.modalTitle}: ${normalizedMagicTemporaryHitPoints} out of ${feature.maxHitPoints}`}
        title={feature.modalTitle}
      >
        <Shield size={18} />
        <strong className={styles.tempHpTriggerCount}>{normalizedMagicTemporaryHitPoints}</strong>
      </button>

      {isModalOpen ? (
        <div
          className={sheetStyles.xpPopupBackdrop}
          role="presentation"
          onClick={closeModal}
        >
          <section
            className={clsx(sheetStyles.xpPopupCard, styles.tempHpModalCard)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="magic-temp-hp-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <h3 id="magic-temp-hp-modal-title" className={sheetStyles.sheetPanelTitle}>
                  {feature.modalTitle}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={closeModal}
                aria-label="Close magical temporary hit points modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.tempHpModalContent}>
              <p className={styles.tempHpDescription}>{feature.description}</p>
              <p className={styles.tempHpSource}>
                Source: <strong>{sourceLabel}</strong>
              </p>

              <div className={styles.tempHpFieldBlock}>
                <span className={styles.tempHpFieldLabel}>Current Magical Temporary HP</span>
                <div className={styles.tempHpInputRow}>
                  <NumberInput
                    min={0}
                    max={feature.maxHitPoints}
                    className={styles.tempHpInput}
                    value={magicTemporaryHitPointsDraft}
                    onChange={(event) =>
                      setMagicTemporaryHitPointsDraft(
                        Math.min(
                          feature.maxHitPoints,
                          normalizeMagicTemporaryHitPoints(
                            event.target.value.replace(/^0+(?=\d)/, "")
                          )
                        )
                      )
                    }
                  />
                  <button
                    type="button"
                    className={clsx(shared.saveButton, styles.tempHpSaveButton)}
                    disabled={!hasUnsavedChanges}
                    onClick={saveMagicTemporaryHitPoints}
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className={styles.statGrid}>
                <article className={styles.statCard}>
                  <span className={styles.statLabel}>Maximum</span>
                  <strong className={styles.statValue}>{feature.maxHitPoints}</strong>
                </article>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default MagicTemporaryHitPoints;
