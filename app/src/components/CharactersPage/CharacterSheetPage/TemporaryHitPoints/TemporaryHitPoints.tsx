import clsx from "clsx";
import { Shield } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./TemporaryHitPoints.module.css";
import {
  normalizeTemporaryHitPoints,
  normalizeTemporaryHitPointsSource
} from "../GameplayForm/gameplayStateUtils";
import TemporaryHitPointsEditorModal from "./TemporaryHitPointsEditorModal";

type TemporaryHitPointsProps = {
  temporaryHitPoints: number;
  temporaryHitPointsSource?: string;
  modalTitle?: string;
  description?: string;
  onSaveTemporaryHitPoints: (value: number) => void;
};

function TemporaryHitPoints({
  temporaryHitPoints,
  temporaryHitPointsSource,
  modalTitle = "Temporary Hit Points",
  description = "When taking damage the temporary hit points are consumed first. They do not stack and they vanish after resting at a camp.",
  onSaveTemporaryHitPoints
}: TemporaryHitPointsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [temporaryHitPointsDraft, setTemporaryHitPointsDraft] = useState(() =>
    normalizeTemporaryHitPoints(temporaryHitPoints)
  );
  const normalizedTemporaryHitPoints = normalizeTemporaryHitPoints(temporaryHitPoints);
  const normalizedTemporaryHitPointsSource =
    normalizeTemporaryHitPointsSource(temporaryHitPointsSource);
  const hasUnsavedChanges = temporaryHitPointsDraft !== normalizedTemporaryHitPoints;

  useEffect(() => {
    if (!isModalOpen) {
      setTemporaryHitPointsDraft(normalizedTemporaryHitPoints);
    }
  }, [normalizedTemporaryHitPoints, isModalOpen]);

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

    onSaveTemporaryHitPoints(nextTemporaryHitPoints);

    setTemporaryHitPointsDraft(nextTemporaryHitPoints);
    setIsModalOpen(false);
  }

  function clearTemporaryHitPoints() {
    onSaveTemporaryHitPoints(0);

    setTemporaryHitPointsDraft(0);
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
        <TemporaryHitPointsEditorModal
          titleId="temp-hp-modal-title"
          title={modalTitle}
          closeLabel="Close temporary hit points modal"
          description={description}
          sourceLabel={
            normalizedTemporaryHitPoints > 0 ? normalizedTemporaryHitPointsSource : undefined
          }
          fieldLabel="Current Temporary HP"
          value={temporaryHitPointsDraft}
          hasUnsavedChanges={hasUnsavedChanges}
          onChange={(value) => setTemporaryHitPointsDraft(normalizeTemporaryHitPoints(value))}
          onClear={clearTemporaryHitPoints}
          onClose={closeModal}
          onSave={saveTemporaryHitPoints}
        />
      ) : null}
    </>
  );
}

export default TemporaryHitPoints;
