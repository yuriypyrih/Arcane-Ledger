import clsx from "clsx";
import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Character, CharacterMulticlass } from "../../../../types";
import {
  createMulticlassDraft,
  preservePreMulticlassCharacter
} from "../../../../pages/CharactersPage/multiclassProgression";
import {
  MAX_CHARACTER_LEVEL,
  getLevelForXp,
  getMinimumXpForLevel,
  getNextLevelThreshold,
  getXpProgressPercent
} from "../../../../pages/CharactersPage/experience";
import {
  allocateSingleClass,
  applyClassLevelAllocation
} from "../../../../pages/CharactersPage/classLevelAllocation";
import { formatCount } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import ActionButton from "../../../ActionButton";
import CellContainer from "../../../CellContainer/CellContainer";
import NumberInput from "../../FormInputs/NumberInput";
import {
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayEyebrow,
  OverlayTitleRow,
  OverlayTitle,
  OverlayCloseButton,
  SheetModal
} from "../../../Overlay";
import SheetActionButton from "../SheetActionButton";
import ClassProgressionEditor from "./ClassProgressionEditor";
import progressStyles from "./CharacterProgressModal.module.css";
import styles from "./MulticlassProgressModal.module.css";

type Props = {
  character: Character;
  onClose: () => void;
  onPersistCharacter: PersistCharacterUpdater;
};

export default function MulticlassProgressModal({ character, onClose, onPersistCharacter }: Props) {
  const [draft, setDraft] = useState(() => createMulticlassDraft(character));
  const [total, setTotal] = useState(character.level);
  const [allowBeyond20, setAllowBeyond20] = useState(character.level > 20);
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  const [levelInput, setLevelInput] = useState("");
  const [xp, setXp] = useState(character.xp);
  const [xpMode, setXpMode] = useState<"add" | "edit" | null>(null);
  const [xpInput, setXpInput] = useState(0);
  const [error, setError] = useState("");
  const allocated = draft.classes.reduce((sum, entry) => sum + entry.level, 0);
  const available = total - allocated;
  const originalDraft = useMemo(
    () => JSON.stringify(createMulticlassDraft(character)),
    [character]
  );
  const hasChanges =
    total !== character.level || xp !== character.xp || JSON.stringify(draft) !== originalDraft;
  const preview = useMemo(() => {
    try {
      return applyClassLevelAllocation(character, draft, total, xp);
    } catch {
      return null;
    }
  }, [character, draft, total, xp]);
  const nextLevelXp = getNextLevelThreshold(total);
  const pendingXp = Math.min(99999999, xpMode === "add" ? xp + xpInput : xpInput);
  const showBeyond20 =
    !isEditingLevel && (total >= 20 || (xpMode !== null && getLevelForXp(pendingXp) > 20));

  function canSetLevel(next: number) {
    if (next > 20 && !allowBeyond20) {
      setError("Press “Level beyond 20” to enable homebrew progression.");
      return false;
    }
    return true;
  }

  function changeDraft(next: CharacterMulticlass) {
    setDraft(allocateSingleClass(next, total));
    setError("");
  }
  function changeTotal(next: number, nextXp = getMinimumXpForLevel(next)) {
    setTotal(next);
    setXp(nextXp);
    setDraft((current) => allocateSingleClass(current, next));
    setError("");
  }
  function confirmLevel() {
    const value = Number(levelInput);
    if (
      !levelInput.trim() ||
      !Number.isInteger(value) ||
      value < 1 ||
      value > MAX_CHARACTER_LEVEL
    ) {
      setError(`Enter a whole level from 1 to ${MAX_CHARACTER_LEVEL}.`);
      return;
    }
    if (value > 20) setAllowBeyond20(true);
    changeTotal(value);
    setIsEditingLevel(false);
  }
  function save() {
    try {
      if (!preview || available !== 0 || xpMode || isEditingLevel)
        throw new Error("Finish allocating levels and confirm XP before saving.");
      if (draft.classes.length > 1) preservePreMulticlassCharacter(character);
      onPersistCharacter((current) => applyClassLevelAllocation(current, draft, total, xp), {
        flush: true
      });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save class changes.");
    }
  }

  return (
    <SheetModal titleId="multiclass-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Character Progress</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id="multiclass-title">Experience &amp; classes</OverlayTitle>
          </OverlayTitleRow>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close character progress" onClick={onClose} />
      </OverlayHeader>
      <OverlayBody className={styles.body}>
        <div className={progressStyles.progressMetaRow}>
          <CellContainer
            className={progressStyles.progressMetaItem}
            label="Current XP"
            content={formatCount(xp)}
          />
          <CellContainer
            className={clsx(progressStyles.progressMetaItem, progressStyles.progressMetaItemRight)}
            labelClassName={progressStyles.progressMetaLabelRight}
            contentClassName={progressStyles.progressMetaContentRight}
            label="Next Level XP"
            content={nextLevelXp === null ? "MAX" : `${formatCount(nextLevelXp)} XP`}
          />
        </div>
        <div
          className={progressStyles.progressTrack}
          role="progressbar"
          aria-label="Experience progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={getXpProgressPercent(total, xp)}
        >
          <div
            className={progressStyles.progressFill}
            style={{ width: `${getXpProgressPercent(total, xp)}%` }}
          />
        </div>
        <section className={progressStyles.progressRowCard}>
          <div className={progressStyles.progressRow}>
            <div className={progressStyles.progressValueBlock}>
              <span className={progressStyles.progressLabel}>Experience points</span>
              <strong className={progressStyles.progressValue}>
                {formatCount(character.xp)} → {formatCount(xp)}
              </strong>
            </div>
            <div className={progressStyles.progressActions}>
              {xpMode ? (
                <>
                  <SheetActionButton
                    onClick={() => {
                      const nextLevel = getLevelForXp(pendingXp);
                      if (!canSetLevel(nextLevel)) return;
                      changeTotal(nextLevel, pendingXp);
                      setXpMode(null);
                    }}
                  >
                    Confirm XP
                  </SheetActionButton>
                  <SheetActionButton
                    onClick={() => {
                      setXpMode(null);
                      setError("");
                    }}
                  >
                    Cancel XP
                  </SheetActionButton>
                </>
              ) : (
                <>
                  <SheetActionButton
                    disabled={isEditingLevel}
                    onClick={() => {
                      setXpMode("add");
                      setXpInput(0);
                    }}
                  >
                    Add XP
                  </SheetActionButton>
                  <SheetActionButton
                    disabled={isEditingLevel}
                    onClick={() => {
                      setXpMode("edit");
                      setXpInput(xp);
                    }}
                  >
                    Edit XP
                  </SheetActionButton>
                </>
              )}
            </div>
          </div>
          {xpMode ? (
            <label className={styles.field}>
              <span>{xpMode === "add" ? "XP to add" : "Experience points"}</span>
              <NumberInput
                min={0}
                max={99999999}
                value={xpInput}
                onChange={(event) =>
                  setXpInput(Math.max(0, Math.floor(event.currentTarget.valueAsNumber || 0)))
                }
              />
            </label>
          ) : null}
        </section>
        <section className={progressStyles.progressRowCard} aria-label="Total character level">
          <div className={progressStyles.progressRow}>
            <div className={progressStyles.progressValueBlock}>
              <span className={progressStyles.progressLabel}>Total character level</span>
              <strong className={progressStyles.progressValue}>
                {character.level} → {total}
              </strong>
            </div>
            <div className={progressStyles.progressActions}>
              {showBeyond20 ? (
                <SheetActionButton
                  disabled={total >= MAX_CHARACTER_LEVEL && !isEditingLevel && !xpMode}
                  onClick={() => {
                    setAllowBeyond20(true);
                    setError("");
                    if (!isEditingLevel && !xpMode) changeTotal(total + 1);
                  }}
                >
                  Level beyond 20
                </SheetActionButton>
              ) : null}
              {isEditingLevel ? (
                <>
                  <SheetActionButton onClick={confirmLevel}>Confirm level</SheetActionButton>
                  <SheetActionButton
                    onClick={() => {
                      setIsEditingLevel(false);
                      setError("");
                    }}
                  >
                    Cancel level
                  </SheetActionButton>
                </>
              ) : (
                <>
                  <SheetActionButton
                    disabled={Boolean(xpMode) || total >= 20}
                    onClick={() => changeTotal(total + 1)}
                  >
                    Level Up
                  </SheetActionButton>
                  <SheetActionButton
                    disabled={Boolean(xpMode)}
                    onClick={() => {
                      setLevelInput(String(total));
                      setIsEditingLevel(true);
                      setError("");
                    }}
                  >
                    Edit level
                  </SheetActionButton>
                </>
              )}
            </div>
          </div>
          {isEditingLevel ? (
            <label className={styles.field}>
              <span>Total character level</span>
              <NumberInput
                min={1}
                max={MAX_CHARACTER_LEVEL}
                step={1}
                value={levelInput}
                onChange={(event) => {
                  setLevelInput(event.target.value);
                  setError("");
                }}
              />
            </label>
          ) : null}
        </section>
        <div className={styles.summaryRow}>
          <h3>Class levels</h3>
          <p
            className={clsx(available !== 0 && styles.error)}
            role="status"
            aria-label="Level allocation"
          >
            {allocated} / {total} allocated
          </p>
        </div>
        {total > 20 ? (
          <p className={styles.helperText}>
            Homebrew progression: class features stop at level 20.
          </p>
        ) : null}
        <ClassProgressionEditor draft={draft} totalLevel={total} onChange={changeDraft} />
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </OverlayBody>
      <OverlayFooter className={styles.footer}>
        <ActionButton variant="OUTLINE" icon={<X size={18} aria-hidden="true" />} onClick={onClose}>
          Cancel
        </ActionButton>
        <ActionButton
          disabled={
            !preview ||
            !hasChanges ||
            available !== 0 ||
            isEditingLevel ||
            xpMode !== null ||
            total > 100
          }
          icon={<Check size={18} aria-hidden="true" />}
          onClick={save}
        >
          Save
        </ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}
