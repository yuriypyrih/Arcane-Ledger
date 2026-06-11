import clsx from "clsx";
import { Skull } from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { RollMode } from "../../../../../types";
import d20Icon from "../../../../../assets/svg/d20.svg";
import {
  deathSaveDescription,
  isDeathSaveTrackResolved,
  type DeathSaveTrackState
} from "../../../../../pages/CharactersPage/deathSaves";
import type { SpellDescriptionEntry } from "../../../../../codex/entries";
import { orderDescriptionAdditionSections } from "../../../../../pages/CharactersPage/actionModalDescriptions";
import ActionButton from "../../../../ActionButton";
import DescriptionContent from "../../../../DescriptionContent/DescriptionContent";
import { useDiceRollerPopup } from "../../../../DicePage/DiceRollerPopup";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal,
  overlayClassNames
} from "../../../../Overlay";
import DiceRollerSettingsButton from "./DiceRollerSettingsButton";
import styles from "./DeathSavesWidget.module.css";

type DeathSaveTrack = "success" | "failure";

type DeathSavesTrackerProps = {
  deathSaves: DeathSaveTrackState;
  descriptionAdditions?: SpellDescriptionEntry[][];
  ignoreNextRollOverrides?: boolean;
  modalEyebrow?: string;
  rollDescription?: string;
  rollFormula?: string;
  rollFormulaDisplay?: string;
  rollMode?: RollMode;
  rollTitle?: string;
  readOnly?: boolean;
  showDiceSettings?: boolean;
  title?: string;
  onReset?: () => void;
  onUpdate?: (track: DeathSaveTrack) => void;
};

function DeathSavesTracker({
  deathSaves,
  descriptionAdditions = [],
  ignoreNextRollOverrides = false,
  modalEyebrow = "Gameplay",
  rollDescription = "Roll a death saving throw.",
  rollFormula = "1d20",
  rollFormulaDisplay = rollFormula,
  rollMode,
  rollTitle = "Death save",
  readOnly = false,
  showDiceSettings = true,
  title = "Death Saves",
  onReset,
  onUpdate
}: DeathSavesTrackerProps) {
  const titleId = useId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDiceRollerSettingsOpen, setIsDiceRollerSettingsOpen] = useState(false);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();
  const isDeathSaveResolved = isDeathSaveTrackResolved(deathSaves);
  const hasMarkedDeathSaves =
    deathSaves.successes > 0 ||
    deathSaves.failures > 0 ||
    deathSaves.resolution === "instant-death";
  const descriptionSections = orderDescriptionAdditionSections(descriptionAdditions);
  const canEdit = !readOnly && Boolean(onReset && onUpdate);

  useEffect(() => {
    if (!canEdit && isModalOpen) {
      setIsModalOpen(false);
    }
  }, [canEdit, isModalOpen]);

  function rollDeathSave() {
    if (!onUpdate) {
      return;
    }

    openDiceRoller({
      title: rollTitle,
      formula: rollFormula,
      formulaDisplay: rollFormulaDisplay,
      mode: rollMode,
      description: rollDescription,
      ignoreNextRollOverrides,
      onResolvedResult: ({ result }) => {
        onUpdate(result.total >= 10 ? "success" : "failure");
      }
    });
  }

  function renderDeathSaveDots(track: DeathSaveTrack) {
    const current = track === "success" ? deathSaves.successes : deathSaves.failures;
    const dotClassName = track === "success" ? styles.dotSuccess : styles.dotFailure;

    return (
      <span className={styles.dotsRow} aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
          <span
            key={`${track}-${index}`}
            className={clsx(styles.dot, dotClassName, index < current && styles.dotActive)}
          />
        ))}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        disabled={!canEdit}
        onClick={() => {
          if (canEdit) {
            setIsModalOpen(true);
          }
        }}
        aria-label={`Death saves: ${deathSaves.successes} successes and ${deathSaves.failures} failures`}
        title={canEdit ? "Manage death saves" : "Death saves"}
      >
        <Skull size={15} aria-hidden="true" />
        <span className={styles.triggerLabel}>{title}</span>
        <span className={styles.triggerDots}>
          {renderDeathSaveDots("success")}
          <span className={styles.dotDivider} aria-hidden="true">
            |
          </span>
          {renderDeathSaveDots("failure")}
        </span>
      </button>

      {isModalOpen && canEdit ? (
        <SheetModal titleId={titleId} onClose={() => setIsModalOpen(false)} size="small">
          <OverlayHeader>
            <OverlayHeaderContent>
              <OverlayEyebrow>{modalEyebrow}</OverlayEyebrow>
              <OverlayTitleRow>
                <OverlayTitle id={titleId}>{title}</OverlayTitle>
              </OverlayTitleRow>
            </OverlayHeaderContent>
            <OverlayCloseButton label="Close death saves" onClick={() => setIsModalOpen(false)} />
          </OverlayHeader>

          <OverlayBody className={styles.modalBody}>
            <div className={styles.descriptionStack}>
              <DescriptionContent
                description={deathSaveDescription}
                className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
                entryClassName={overlayClassNames.descriptionLine}
                strongClassName={overlayClassNames.descriptionStrong}
              />
              {descriptionSections.map((section, index) => (
                <div
                  key={`death-save-description-section-${index}`}
                  className={styles.descriptionSection}
                >
                  <hr className={styles.descriptionDivider} aria-hidden="true" />
                  <DescriptionContent
                    description={section}
                    className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
                    entryClassName={overlayClassNames.descriptionLine}
                    strongClassName={overlayClassNames.descriptionStrong}
                  />
                </div>
              ))}
            </div>

            <div className={styles.modalTracker} aria-label="Death save tracker">
              <div className={styles.trackRow}>
                <span>Successes</span>
                {renderDeathSaveDots("success")}
              </div>
              <div className={styles.trackRow}>
                <span>Failures</span>
                {renderDeathSaveDots("failure")}
              </div>
            </div>
          </OverlayBody>

          <OverlayFooter className={styles.footer}>
            <div className={styles.footerActions}>
              <div className={styles.incrementRow}>
                <ActionButton
                  actionType="SUCCESS"
                  variant="OUTLINE"
                  className={styles.incrementButton}
                  onClick={() => onUpdate?.("success")}
                  disabled={isDeathSaveResolved}
                >
                  + Success
                </ActionButton>
                <ActionButton
                  actionType="ERROR"
                  variant="OUTLINE"
                  className={styles.incrementButton}
                  onClick={() => onUpdate?.("failure")}
                  disabled={isDeathSaveResolved}
                >
                  + Failure
                </ActionButton>
                <ActionButton
                  variant="OUTLINE"
                  className={styles.incrementButton}
                  onClick={() => onReset?.()}
                  disabled={!hasMarkedDeathSaves}
                >
                  Reset All
                </ActionButton>
              </div>
              <div className={styles.rollRow}>
                <ActionButton
                  className={styles.rollButton}
                  onClick={rollDeathSave}
                  disabled={isDeathSaveResolved}
                  icon={<img src={d20Icon} alt="" className={styles.rollButtonIcon} />}
                >
                  Roll
                </ActionButton>
                {showDiceSettings ? (
                  <DiceRollerSettingsButton
                    actionName={rollTitle}
                    className={styles.settingsButton}
                    isOpen={isDiceRollerSettingsOpen}
                    ariaLabel="Open death save dice roller settings"
                    onOpenChange={setIsDiceRollerSettingsOpen}
                  />
                ) : null}
              </div>
            </div>
          </OverlayFooter>
        </SheetModal>
      ) : null}

      {diceRollerPopup}
    </>
  );
}

export default DeathSavesTracker;
