import clsx from "clsx";
import { useEffect, useState } from "react";
import CellContainer from "../../../CellContainer/CellContainer";
import NumberInput from "../../FormInputs/NumberInput";
import {
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
import { clampNumber, formatCount } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./CharacterProgressModal.module.css";

type ProgressEditMode = "idle" | "add-xp" | "edit-xp" | "edit-level";

type ProgressDraft = {
  level: number;
  xp: number;
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

function CharacterProgressModal({
  character,
  onClose,
  onPersistCharacter
}: CharacterProgressModalProps) {
  const [draft, setDraft] = useState<ProgressDraft>(() => createProgressDraft(character));
  const [activeModeBaseDraft, setActiveModeBaseDraft] = useState<ProgressDraft>(() =>
    createProgressDraft(character)
  );
  const [activeMode, setActiveMode] = useState<ProgressEditMode>("idle");
  const [activeModeValue, setActiveModeValue] = useState(0);

  useEffect(() => {
    setDraft(createProgressDraft(character));
    setActiveModeBaseDraft(createProgressDraft(character));
    setActiveMode("idle");
    setActiveModeValue(0);
  }, [character]);

  const currentNextLevelThreshold = getNextLevelThreshold(character.level);
  const currentXpProgressPercent = getXpProgressPercent(character.level, character.xp);
  const hasChanges = draft.level !== character.level || draft.xp !== character.xp;
  const isLevelDecreased = draft.level < character.level;
  const isXpMode = activeMode === "add-xp" || activeMode === "edit-xp";
  const isLevelMode = activeMode === "edit-level";
  const saveDisabled = isLevelDecreased || activeMode !== "idle" || !hasChanges;

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
    setActiveModeValue(0);
  }

  function startEditXp() {
    setActiveMode("edit-xp");
    setActiveModeBaseDraft(draft);
    setActiveModeValue(draft.xp);
  }

  function startEditLevel() {
    setActiveMode("edit-level");
    setActiveModeBaseDraft(draft);
    setActiveModeValue(draft.level);
  }

  function handleActiveModeValueChange(value: unknown) {
    if (activeMode === "add-xp") {
      const nextValue = clampNumber(value, 0, 99999999, 0);
      setActiveModeValue(nextValue);
      setDraft(deriveDraftFromXp(activeModeBaseDraft.xp + nextValue));
      return;
    }

    if (activeMode === "edit-xp") {
      const nextValue = clampNumber(value, 0, 99999999, activeModeBaseDraft.xp);
      setActiveModeValue(nextValue);
      setDraft(deriveDraftFromXp(nextValue));
      return;
    }

    if (activeMode === "edit-level") {
      const nextValue = clampNumber(value, 1, MAX_CHARACTER_LEVEL, activeModeBaseDraft.level);
      setActiveModeValue(nextValue);
      setDraft(deriveDraftFromLevel(nextValue));
    }
  }

  function confirmActiveMode() {
    if (activeMode === "idle") {
      return;
    }

    setActiveModeBaseDraft(draft);
    setActiveMode("idle");
    setActiveModeValue(0);
  }

  function cancelActiveMode() {
    if (activeMode === "idle") {
      return;
    }

    setDraft(activeModeBaseDraft);
    setActiveMode("idle");
    setActiveModeValue(0);
  }

  function levelUp() {
    if (draft.level >= MAX_CHARACTER_LEVEL || isXpMode) {
      return;
    }

    setDraft((current) => deriveDraftFromLevel(current.level + 1));
  }

  function saveChanges() {
    if (saveDisabled) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = {
        ...currentCharacter,
        level: draft.level,
        xp: draft.xp
      };

      return draft.level > currentCharacter.level
        ? restoreHeroicInspirationForCharacter(nextCharacter)
        : nextCharacter;
    });

    onClose();
  }

  return (
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
          <div className={styles.progressFill} style={{ width: `${currentXpProgressPercent}%` }} />
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
                    <button
                      type="button"
                      className={clsx(shared.editButton, styles.actionButton)}
                      onClick={confirmActiveMode}
                    >
                      {activeMode === "add-xp" ? "Add" : "Confirm"}
                    </button>
                    <button
                      type="button"
                      className={clsx(shared.editButton, styles.actionButton)}
                      onClick={cancelActiveMode}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={clsx(shared.editButton, styles.actionButton)}
                      onClick={startAddXp}
                      disabled={isLevelMode}
                    >
                      Add XP
                    </button>
                    <button
                      type="button"
                      className={clsx(shared.editButton, styles.actionButton)}
                      onClick={startEditXp}
                      disabled={isLevelMode}
                    >
                      Edit
                    </button>
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
                    <button
                      type="button"
                      className={clsx(shared.editButton, styles.actionButton)}
                      onClick={confirmActiveMode}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      className={clsx(shared.editButton, styles.actionButton)}
                      onClick={cancelActiveMode}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={clsx(shared.editButton, styles.actionButton)}
                      onClick={levelUp}
                      disabled={isXpMode || draft.level >= MAX_CHARACTER_LEVEL}
                    >
                      Level Up
                    </button>
                    <button
                      type="button"
                      className={clsx(shared.editButton, styles.actionButton)}
                      onClick={startEditLevel}
                      disabled={isXpMode}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>

            {isLevelMode ? (
              <label className={styles.inputField}>
                <span className={styles.inputLabel}>{modeFieldLabel}</span>
                <NumberInput
                  min={1}
                  max={MAX_CHARACTER_LEVEL}
                  value={activeModeValue}
                  onChange={(event) => handleActiveModeValueChange(event.target.value)}
                />
              </label>
            ) : null}
          </section>

          {isLevelDecreased ? (
            <p className={styles.errorText}>
              You can&apos;t save a lower level than the character&apos;s current level.
            </p>
          ) : null}
        </div>
      </OverlayBody>

      <OverlayFooter className={styles.footer}>
        <button type="button" className={shared.cancelButton} onClick={closeModal}>
          Cancel
        </button>
        <button
          type="button"
          className={shared.saveButton}
          onClick={saveChanges}
          disabled={saveDisabled}
        >
          Save
        </button>
      </OverlayFooter>
    </SheetModal>
  );
}

export default CharacterProgressModal;
