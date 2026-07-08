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
import type { FeatureIndicator } from "../../../../../pages/CharactersPage/classFeatures";
import ActionButton from "../../../../ActionButton";
import DescriptionContent from "../../../../DescriptionContent/DescriptionContent";
import { useDiceRollerPopup } from "../../../../DicePage/DiceRollerPopup";
import type { DiceRollerResolvedResult } from "../../../../DicePage/DiceRollerPopup/types";
import RollStatePill from "../../../../RollStatePill/RollStatePill";
import {
  formatResolvedRollStateDetailText,
  resolveFeatureIndicators
} from "../../../../RollStatePill/rollState";
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
import { DeathSaveDots, DeathSavesIndicatorContent } from "./DeathSavesIndicator";
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
  rollIndicators?: FeatureIndicator[];
  rollMode?: RollMode;
  rollTitle?: string;
  naturalTwentyBenefitMinimum?: number | null;
  readOnly?: boolean;
  showDiceSettings?: boolean;
  title?: string;
  onNaturalTwentyBenefit?: () => void;
  onReset?: () => void;
  onUpdate?: (track: DeathSaveTrack) => void;
};

function formatDeathSavesAriaLabel(deathSaves: DeathSaveTrackState) {
  return `Death saves: ${deathSaves.successes} successes and ${deathSaves.failures} failures`;
}

function normalizeNaturalTwentyBenefitMinimum(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(1, Math.min(20, Math.floor(value)));
}

function getResolvedDeathSaveD20Roll(resolvedResult: DiceRollerResolvedResult): number | null {
  const primaryDice = resolvedResult.results[0]?.dice ?? resolvedResult.dice;
  const countedD20 = primaryDice.find((die) => die.sides === 20 && die.counted !== false);

  return typeof countedD20?.value === "number" && Number.isFinite(countedD20.value)
    ? countedD20.value
    : null;
}

function DeathSavesTracker({
  deathSaves,
  descriptionAdditions = [],
  ignoreNextRollOverrides = false,
  modalEyebrow = "Gameplay",
  rollDescription = "Roll a death saving throw.",
  rollFormula = "1d20",
  rollFormulaDisplay = rollFormula,
  rollIndicators,
  rollMode,
  rollTitle = "Death save",
  naturalTwentyBenefitMinimum = null,
  readOnly = false,
  showDiceSettings = true,
  title = "Death Saves",
  onNaturalTwentyBenefit,
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
  const rollState = resolveFeatureIndicators(rollIndicators);
  const descriptionSections = orderDescriptionAdditionSections(descriptionAdditions);
  const canEdit = !readOnly && Boolean(onReset && onUpdate);
  const normalizedNaturalTwentyBenefitMinimum =
    normalizeNaturalTwentyBenefitMinimum(naturalTwentyBenefitMinimum);

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
      onResolvedResult: (resolvedResult) => {
        const deathSaveD20Roll = getResolvedDeathSaveD20Roll(resolvedResult);

        if (
          normalizedNaturalTwentyBenefitMinimum !== null &&
          deathSaveD20Roll !== null &&
          deathSaveD20Roll >= normalizedNaturalTwentyBenefitMinimum &&
          onNaturalTwentyBenefit
        ) {
          onNaturalTwentyBenefit();
          return;
        }

        const { result } = resolvedResult;

        onUpdate(result.total >= 10 ? "success" : "failure");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.trigger} ${!canEdit ? styles.triggerReadOnly : ""}`}
        disabled={!canEdit}
        onClick={() => {
          if (canEdit) {
            setIsModalOpen(true);
          }
        }}
        aria-label={formatDeathSavesAriaLabel(deathSaves)}
        title={canEdit ? "Manage death saves" : undefined}
      >
        <DeathSavesIndicatorContent deathSaves={deathSaves} title={title} />
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
            {rollState ? (
              <div className={styles.headerIndicatorStack}>
                <RollStatePill
                  tone={rollState.tone}
                  label={rollState.label}
                  detailText={formatResolvedRollStateDetailText(rollState)}
                />
              </div>
            ) : null}
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
                <DeathSaveDots deathSaves={deathSaves} track="success" />
              </div>
              <div className={styles.trackRow}>
                <span>Failures</span>
                <DeathSaveDots deathSaves={deathSaves} track="failure" />
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
