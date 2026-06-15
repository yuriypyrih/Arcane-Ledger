import clsx from "clsx";
import { useEffect, useId, useState } from "react";
import ActionButton from "../../../ActionButton";
import CellContainer from "../../../CellContainer/CellContainer";
import NumberInput from "../../FormInputs/NumberInput";
import {
  DestructiveConfirmationModal,
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../Overlay";
import type { Character } from "../../../../types";
import {
  MAX_CHARACTER_LEVEL,
  getLevelForXp,
  getMinimumXpForLevel,
  getNextLevelThreshold,
  getXpProgressPercent
} from "../../../../pages/CharactersPage/experience";
import { restoreHeroicInspirationForCharacter } from "../../../../pages/CharactersPage/heroicInspiration";
import { reconcileCharacterAfterLevelDecrease } from "../../../../pages/CharactersPage/levelReconciliation";
import { clampNumber, formatCount } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import SheetActionButton from "../SheetActionButton";
import styles from "./CharacterProgressModal.module.css";

type ProgressEditMode = "idle" | "add-xp" | "edit-xp" | "edit-level";

type ProgressDraft = {
  level: number;
  xp: number;
};

const STANDARD_LEVEL_UP_CAP = 20;

type LevelValidationResult =
  | {
      isValid: true;
      level: number;
    }
  | {
      isValid: false;
      message: string;
    };

type CharacterProgressModalProps = {
  character: Character;
  onClose: () => void;
  onPersistCharacter: PersistCharacterUpdater;
};

function createProgressDraft(character: Character): ProgressDraft {
  return {
    level: character.level,
    xp: character.xp
  };
}

function deriveDraftFromXp(xp: number): ProgressDraft {
  const normalizedXp = clampNumber(xp, 0, 99999999, 0);

  return {
    xp: normalizedXp,
    level: getLevelForXp(normalizedXp)
  };
}

function deriveDraftFromLevel(level: number): ProgressDraft {
  const normalizedLevel = clampNumber(level, 1, MAX_CHARACTER_LEVEL, 1);

  return {
    level: normalizedLevel,
    xp: getMinimumXpForLevel(normalizedLevel)
  };
}

function validateLevelInput(value: string): LevelValidationResult {
  const trimmedValue = value.trim();
  const parsedLevel = Number(trimmedValue);

  if (
    trimmedValue.length === 0 ||
    !Number.isFinite(parsedLevel) ||
    !Number.isInteger(parsedLevel) ||
    parsedLevel < 1 ||
    parsedLevel > MAX_CHARACTER_LEVEL
  ) {
    return {
      isValid: false,
      message: `Enter a whole level from 1 to ${MAX_CHARACTER_LEVEL}.`
    };
  }

  return {
    isValid: true,
    level: parsedLevel
  };
}

function CharacterProgressModal({
  character,
  onClose,
  onPersistCharacter
}: CharacterProgressModalProps) {
  const levelDecreaseConfirmationTitleId = useId();
  const [draft, setDraft] = useState<ProgressDraft>(() => createProgressDraft(character));
  const [activeModeBaseDraft, setActiveModeBaseDraft] = useState<ProgressDraft>(() =>
    createProgressDraft(character)
  );
  const [activeMode, setActiveMode] = useState<ProgressEditMode>("idle");
  const [activeModeValue, setActiveModeValue] = useState("0");
  const [levelInputError, setLevelInputError] = useState<string | null>(null);
  const [isLevelDecreaseConfirmationOpen, setIsLevelDecreaseConfirmationOpen] = useState(false);

  useEffect(() => {
    setDraft(createProgressDraft(character));
    setActiveModeBaseDraft(createProgressDraft(character));
    setActiveMode("idle");
    setActiveModeValue("0");
    setLevelInputError(null);
    setIsLevelDecreaseConfirmationOpen(false);
  }, [character]);

  const currentNextLevelThreshold = getNextLevelThreshold(character.level);
  const currentXpProgressPercent = getXpProgressPercent(character.level, character.xp);
  const hasChanges = draft.level !== character.level || draft.xp !== character.xp;
  const isLevelDecreased = draft.level < character.level;
  const isXpMode = activeMode === "add-xp" || activeMode === "edit-xp";
  const isLevelMode = activeMode === "edit-level";
  const canLevelUp = !isXpMode && draft.level < MAX_CHARACTER_LEVEL;
  const isBeyondStandardLevelUpAvailable = draft.level >= STANDARD_LEVEL_UP_CAP;
  const saveDisabled = activeMode !== "idle" || !hasChanges;

  let modeFieldLabel = "";

  if (activeMode === "add-xp") {
    modeFieldLabel = "XP To Add";
  } else if (activeMode === "edit-xp") {
    modeFieldLabel = "Current XP";
  } else if (activeMode === "edit-level") {
    modeFieldLabel = "Current Level";
  }

  function closeModal() {
    onClose();
  }

  function startAddXp() {
    setActiveMode("add-xp");
    setActiveModeBaseDraft(draft);
    setActiveModeValue("0");
    setLevelInputError(null);
  }

  function startEditXp() {
    setActiveMode("edit-xp");
    setActiveModeBaseDraft(draft);
    setActiveModeValue(String(draft.xp));
    setLevelInputError(null);
  }

  function startEditLevel() {
    setActiveMode("edit-level");
    setActiveModeBaseDraft(draft);
    setActiveModeValue(String(draft.level));
    setLevelInputError(null);
  }

  function handleActiveModeValueChange(value: unknown) {
    const rawValue = typeof value === "string" ? value : String(value ?? "");

    if (activeMode === "add-xp") {
      const nextValue = clampNumber(rawValue, 0, 99999999, 0);
      setActiveModeValue(String(nextValue));
      setDraft(deriveDraftFromXp(activeModeBaseDraft.xp + nextValue));
      return;
    }

    if (activeMode === "edit-xp") {
      const nextValue = clampNumber(rawValue, 0, 99999999, activeModeBaseDraft.xp);
      setActiveModeValue(String(nextValue));
      setDraft(deriveDraftFromXp(nextValue));
      return;
    }

    if (activeMode === "edit-level") {
      setActiveModeValue(rawValue);
      setLevelInputError(null);
    }
  }

  function confirmActiveMode() {
    if (activeMode === "idle") {
      return;
    }

    if (activeMode === "edit-level") {
      const levelValidation = validateLevelInput(activeModeValue);

      if (!levelValidation.isValid) {
        setLevelInputError(levelValidation.message);
        return;
      }

      const nextDraft = deriveDraftFromLevel(levelValidation.level);

      setDraft(nextDraft);
      setActiveModeBaseDraft(nextDraft);
      setActiveMode("idle");
      setActiveModeValue("0");
      setLevelInputError(null);
      return;
    }

    setActiveModeBaseDraft(draft);
    setActiveMode("idle");
    setActiveModeValue("0");
    setLevelInputError(null);
  }

  function cancelActiveMode() {
    if (activeMode === "idle") {
      return;
    }

    setDraft(activeModeBaseDraft);
    setActiveMode("idle");
    setActiveModeValue("0");
    setLevelInputError(null);
  }

  function levelUp() {
    if (draft.level >= MAX_CHARACTER_LEVEL || isXpMode) {
      return;
    }

    setDraft((current) => deriveDraftFromLevel(current.level + 1));
  }

  function persistDraftChanges(shouldPruneLevelDecrease: boolean) {
    if (saveDisabled) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = {
        ...currentCharacter,
        level: draft.level,
        xp: draft.xp
      };

      if (draft.level > currentCharacter.level) {
        return restoreHeroicInspirationForCharacter(nextCharacter);
      }

      if (shouldPruneLevelDecrease && draft.level < currentCharacter.level) {
        return reconcileCharacterAfterLevelDecrease(nextCharacter);
      }

      return nextCharacter;
    });

    onClose();
  }

  function saveChanges() {
    if (saveDisabled) {
      return;
    }

    if (isLevelDecreased) {
      setIsLevelDecreaseConfirmationOpen(true);
      return;
    }

    persistDraftChanges(false);
  }

  function confirmLevelDecrease() {
    setIsLevelDecreaseConfirmationOpen(false);
    persistDraftChanges(true);
  }

  return (
    <>
      <SheetModal titleId="character-progress-modal-title" onClose={closeModal}>
        <OverlayHeader>
          <OverlayHeaderContent>
            <OverlayEyebrow>Character Progress</OverlayEyebrow>
            <OverlayTitleRow>
              <OverlayTitle id="character-progress-modal-title">Experience</OverlayTitle>
            </OverlayTitleRow>
            <OverlaySummary className={shared.helperText}>
              Review XP and level changes before saving them to the sheet.
            </OverlaySummary>
          </OverlayHeaderContent>
          <OverlayCloseButton label="Close character progress" onClick={closeModal} />
        </OverlayHeader>

        <OverlayBody className={styles.body}>
          <div className={styles.progressMetaRow}>
            <CellContainer
              className={styles.progressMetaItem}
              label="Current XP"
              content={formatCount(character.xp)}
            />
            <CellContainer
              className={clsx(styles.progressMetaItem, styles.progressMetaItemRight)}
              labelClassName={styles.progressMetaLabelRight}
              contentClassName={styles.progressMetaContentRight}
              label="Next Level XP"
              content={
                currentNextLevelThreshold === null
                  ? "MAX"
                  : `${formatCount(currentNextLevelThreshold)} XP`
              }
            />
          </div>

          <div className={styles.progressTrack} aria-hidden="true">
            <div
              className={styles.progressFill}
              style={{ width: `${currentXpProgressPercent}%` }}
            />
          </div>

          <div className={styles.progressRows}>
            <section className={styles.progressRowCard}>
              <div className={styles.progressRow}>
                <div className={styles.progressValueBlock}>
                  <span className={styles.progressLabel}>Current XP</span>
                  <strong className={styles.progressValue}>
                    {`${formatCount(character.xp)} -> ${formatCount(draft.xp)}`}
                  </strong>
                </div>
                <div className={styles.progressActions}>
                  {isXpMode ? (
                    <>
                      <SheetActionButton
                        className={styles.actionButton}
                        onClick={confirmActiveMode}
                      >
                        {activeMode === "add-xp" ? "Add" : "Confirm"}
                      </SheetActionButton>
                      <SheetActionButton
                        className={styles.actionButton}
                        onClick={cancelActiveMode}
                      >
                        Cancel
                      </SheetActionButton>
                    </>
                  ) : (
                    <>
                      <SheetActionButton
                        className={styles.actionButton}
                        onClick={startAddXp}
                        disabled={isLevelMode}
                      >
                        Add XP
                      </SheetActionButton>
                      <SheetActionButton
                        className={styles.actionButton}
                        onClick={startEditXp}
                        disabled={isLevelMode}
                      >
                        Edit
                      </SheetActionButton>
                    </>
                  )}
                </div>
              </div>

              {isXpMode ? (
                <label className={styles.inputField}>
                  <span className={styles.inputLabel}>{modeFieldLabel}</span>
                  <NumberInput
                    min={0}
                    value={activeModeValue}
                    onChange={(event) => handleActiveModeValueChange(event.target.value)}
                  />
                </label>
              ) : null}
            </section>

            <section className={styles.progressRowCard}>
              <div className={styles.progressRow}>
                <div className={styles.progressValueBlock}>
                  <span className={styles.progressLabel}>Current Level</span>
                  <strong className={styles.progressValue}>
                    {`${character.level} -> ${draft.level}`}
                  </strong>
                </div>
                <div className={styles.progressActions}>
                  {isLevelMode ? (
                    <>
                      <SheetActionButton
                        className={styles.actionButton}
                        onClick={confirmActiveMode}
                      >
                        Confirm
                      </SheetActionButton>
                      <SheetActionButton
                        className={styles.actionButton}
                        onClick={cancelActiveMode}
                      >
                        Cancel
                      </SheetActionButton>
                    </>
                  ) : (
                    <>
                      {isBeyondStandardLevelUpAvailable ? (
                        <SheetActionButton
                          className={styles.actionButton}
                          onClick={levelUp}
                          disabled={!canLevelUp}
                        >
                          Level up beyond 20
                        </SheetActionButton>
                      ) : null}
                      <SheetActionButton
                        className={styles.actionButton}
                        onClick={levelUp}
                        disabled={isXpMode || draft.level >= STANDARD_LEVEL_UP_CAP}
                      >
                        Level Up
                      </SheetActionButton>
                      <SheetActionButton
                        className={styles.actionButton}
                        onClick={startEditLevel}
                        disabled={isXpMode}
                      >
                        Edit
                      </SheetActionButton>
                    </>
                  )}
                </div>
              </div>

              {isLevelMode ? (
                <label className={styles.inputField}>
                  <span className={styles.inputLabel}>{modeFieldLabel}</span>
                  <NumberInput
                    step={1}
                    value={activeModeValue}
                    invalid={Boolean(levelInputError)}
                    aria-describedby={
                      levelInputError ? "character-progress-level-input-error" : undefined
                    }
                    onChange={(event) => handleActiveModeValueChange(event.target.value)}
                  />
                  {levelInputError ? (
                    <span id="character-progress-level-input-error" className={styles.errorText}>
                      {levelInputError}
                    </span>
                  ) : null}
                </label>
              ) : null}
            </section>

            {isLevelDecreased ? (
              <p className={styles.warningText}>
                Saving a lower level will remove class-feature grants and active feature effects
                that no longer belong to the character&apos;s current level.
              </p>
            ) : null}
          </div>
        </OverlayBody>

        <OverlayFooter className={styles.footer}>
          <ActionButton variant="OUTLINE" onClick={closeModal}>
            Cancel
          </ActionButton>
          <ActionButton onClick={saveChanges} disabled={saveDisabled}>
            Save
          </ActionButton>
        </OverlayFooter>
      </SheetModal>

      {isLevelDecreaseConfirmationOpen ? (
        <DestructiveConfirmationModal
          titleId={levelDecreaseConfirmationTitleId}
          title="Save lower level?"
          message={
            <>
              This will save <strong>level {draft.level}</strong> and prune class-feature feats,
              active feature effects, and conjured feature items that no longer apply.
            </>
          }
          confirmLabel="Save Lower Level"
          closeLabel="Close lower level confirmation"
          onCancel={() => setIsLevelDecreaseConfirmationOpen(false)}
          onConfirm={confirmLevelDecrease}
        />
      ) : null}
    </>
  );
}

export default CharacterProgressModal;
