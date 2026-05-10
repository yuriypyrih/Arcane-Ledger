import clsx from "clsx";
import { Shield } from "lucide-react";
import { useEffect, useState } from "react";
import type { MagicTemporaryHitPointsFeature } from "../../../../pages/CharactersPage/classFeatures/types";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { normalizeMagicTemporaryHitPoints } from "../../../../pages/CharactersPage/shared";
import { assignMagicTemporaryHitPointsForCharacter } from "../GameplayForm/hitPointState";
import TemporaryHitPointsEditorModal from "../TemporaryHitPoints/TemporaryHitPointsEditorModal";
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
  const normalizedMagicTemporaryHitPoints =
    normalizeMagicTemporaryHitPoints(magicTemporaryHitPoints);
  const sourceLabel = magicTemporaryHitPointsSource ?? feature.label;
  const hasUnsavedChanges = magicTemporaryHitPointsDraft !== normalizedMagicTemporaryHitPoints;

  useEffect(() => {
    if (!isModalOpen) {
      setMagicTemporaryHitPointsDraft(normalizedMagicTemporaryHitPoints);
    }
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
        <TemporaryHitPointsEditorModal
          titleId="magic-temp-hp-modal-title"
          title={feature.modalTitle}
          closeLabel="Close magical temporary hit points modal"
          description={feature.description}
          sourceLabel={sourceLabel}
          fieldLabel="Current Magical Temporary HP"
          value={magicTemporaryHitPointsDraft}
          maxValue={feature.maxHitPoints}
          hasUnsavedChanges={hasUnsavedChanges}
          onChange={(value) =>
            setMagicTemporaryHitPointsDraft(normalizeMagicTemporaryHitPoints(value))
          }
          onClose={closeModal}
          onSave={saveMagicTemporaryHitPoints}
        />
      ) : null}
    </>
  );
}

export default MagicTemporaryHitPoints;
