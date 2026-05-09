import clsx from "clsx";
import { Cog, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import ActionButton from "../../../ActionButton";
import TextInput from "../../FormInputs/TextInput";
import DiceRollerSettingsButton from "../GameplayForm/widgets/DiceRollerSettingsButton";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import d20Icon from "../../../../assets/svg/d20.svg";
import type { DiceSelection, DiceSides, RollMode } from "../../../../types";
import {
  createEmptySelection,
  formatCustomDiceText,
  getCustomDiceCount,
  parseCustomDiceText,
  selectableDice,
  type CustomDiceTerm
} from "../../../../utils/dice";
import styles from "./ThumbDiceButton.module.css";

const modeOptions: Array<{ mode: RollMode; label: string; ariaLabel: string }> = [
  {
    mode: "normal",
    label: "Normal",
    ariaLabel: "Use normal roll mode"
  },
  {
    mode: "advantage",
    label: "ADV",
    ariaLabel: "Use advantage roll mode"
  },
  {
    mode: "disadvantage",
    label: "DIS",
    ariaLabel: "Use disadvantage roll mode"
  }
];

function buildDiceFormula(selection: DiceSelection, customDiceTerms: CustomDiceTerm[]): string {
  const standardTerms = selectableDice
    .map((sides) => {
      const count = selection[sides];
      return count > 0 ? `${count}d${sides}` : null;
    })
    .filter((term): term is string => term !== null);

  const customTerms = customDiceTerms.map((term) => `${term.count}d${term.sides}`);

  return [...standardTerms, ...customTerms].join(" + ");
}

function buildDiceDescription(selection: DiceSelection, customDiceTerms: CustomDiceTerm[]): string {
  const standardTerms = selectableDice
    .map((sides) => {
      const count = selection[sides];
      return count > 0 ? `${count} x d${sides}` : null;
    })
    .filter((term): term is string => term !== null);

  const customTerms = customDiceTerms.map((term) => `${term.count} x d${term.sides}`);
  const terms = [...standardTerms, ...customTerms];

  return terms.length > 0 ? `Selected: ${terms.join(", ")}` : "No dice selected.";
}

function ThumbDiceButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDiceRollerSettingsOpen, setIsDiceRollerSettingsOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [selection, setSelection] = useState<DiceSelection>(createEmptySelection);
  const [customDiceText, setCustomDiceText] = useState("");
  const [customDraftText, setCustomDraftText] = useState("");
  const [customError, setCustomError] = useState("");
  const [mode, setMode] = useState<RollMode>("normal");
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  const customDiceCount = getCustomDiceCount(customDiceText);
  const totalSelectedDice =
    selectableDice.reduce((sum, sides) => sum + selection[sides], 0) + customDiceCount;

  function adjustSelection(sides: DiceSides, delta: 1 | -1) {
    setSelection((currentSelection) => {
      const nextValue = Math.max(0, currentSelection[sides] + delta);

      return {
        ...currentSelection,
        [sides]: nextValue
      };
    });
  }

  function closeThumbPanel() {
    setIsExpanded(false);
    setIsDiceRollerSettingsOpen(false);
    setIsCustomModalOpen(false);
    setMode("normal");
  }

  function openCustomModal() {
    setCustomDraftText(customDiceText);
    setCustomError("");
    setIsCustomModalOpen(true);
  }

  function submitCustomDice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const terms = parseCustomDiceText(customDraftText);
      setCustomDiceText(formatCustomDiceText(terms));
      setCustomError("");
      setIsCustomModalOpen(false);
    } catch (error) {
      setCustomError(error instanceof Error ? error.message : "Enter valid custom dice.");
    }
  }

  function handleThumbClick() {
    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }

    if (totalSelectedDice === 0) {
      closeThumbPanel();
      return;
    }

    const customDiceTerms = parseCustomDiceText(customDiceText);

    openDiceRoller({
      title: "Quick roll",
      formula: buildDiceFormula(selection, customDiceTerms),
      description: buildDiceDescription(selection, customDiceTerms),
      mode
    });

    setSelection(createEmptySelection());
    setCustomDiceText("");
    closeThumbPanel();
  }

  const triggerLabel = !isExpanded ? (
    <img src={d20Icon} alt="" className={styles.thumbIcon} />
  ) : totalSelectedDice > 0 ? (
    <span className={styles.rollLabel}>ROLL</span>
  ) : (
    <X size={22} />
  );

  return (
    <>
      <div className={styles.floatingControls}>
        <div
          id="thumb-dice-menu"
          className={clsx(styles.diceRail, isExpanded && styles.diceRailExpanded)}
          aria-hidden={!isExpanded}
        >
          <div className={styles.dicePanel}>
            <DiceRollerSettingsButton
              actionName="Quick roll"
              className={styles.settingsButton}
              isOpen={isDiceRollerSettingsOpen}
              ariaLabel="Open dice roller settings"
              onOpenChange={setIsDiceRollerSettingsOpen}
            >
              <span className={styles.settingsButtonContent}>
                <Cog size={16} />
                <span>Dice Settings</span>
              </span>
            </DiceRollerSettingsButton>
            <div className={styles.modeGroup} role="group" aria-label="Quick roll mode">
              {modeOptions.map((option) => (
                <button
                  key={option.mode}
                  type="button"
                  className={styles.modeButton}
                  data-active={mode === option.mode}
                  aria-label={option.ariaLabel}
                  onClick={() => setMode(option.mode)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className={styles.diceGroup} aria-label="Dice pool">
              {selectableDice.map((sides) => (
                <button
                  key={sides}
                  type="button"
                  className={clsx(styles.dieButton, selection[sides] > 0 && styles.dieButtonActive)}
                  disabled={!isExpanded}
                  onClick={() => adjustSelection(sides, 1)}
                >
                  <span>d{sides}</span>
                  {selection[sides] > 0 ? (
                    <span
                      className={styles.countBadge}
                      onClick={(event) => {
                        event.stopPropagation();
                        adjustSelection(sides, -1);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          adjustSelection(sides, -1);
                        }
                      }}
                    >
                      {selection[sides]}
                    </span>
                  ) : null}
                </button>
              ))}
              <button
                type="button"
                className={clsx(
                  styles.dieButton,
                  styles.customDieButton,
                  customDiceCount > 0 && styles.dieButtonActive
                )}
                disabled={!isExpanded}
                onClick={openCustomModal}
              >
                <span>Custom Dice</span>
                {customDiceCount > 0 ? (
                  <span className={styles.countBadge}>{customDiceCount}</span>
                ) : null}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={styles.thumbButton}
          onClick={handleThumbClick}
          aria-controls="thumb-dice-menu"
          aria-expanded={isExpanded}
          aria-label={
            !isExpanded
              ? "Open quick dice roller"
              : totalSelectedDice > 0
                ? "Roll selected dice"
                : "Close quick dice roller"
          }
        >
          {triggerLabel}
        </button>
      </div>

      {isCustomModalOpen ? (
        <SheetModal
          titleId="custom-dice-modal-title"
          onClose={() => setIsCustomModalOpen(false)}
          size="small"
        >
          <OverlayHeader>
            <OverlayHeaderContent>
              <OverlayTitle id="custom-dice-modal-title">Custom Dice</OverlayTitle>
              <OverlaySummary>
                Enter custom dice separated by commas, for example 1d7,2d25.
              </OverlaySummary>
            </OverlayHeaderContent>
            <OverlayCloseButton
              label="Close custom dice"
              onClick={() => setIsCustomModalOpen(false)}
            />
          </OverlayHeader>

          <form className={styles.customDiceForm} onSubmit={submitCustomDice}>
            <OverlayBody>
              <label className={styles.customField}>
                <span>Dice</span>
                <TextInput
                  value={customDraftText}
                  onChange={(event) => setCustomDraftText(event.target.value)}
                  placeholder="1d7,2d25"
                  invalid={customError.length > 0}
                  autoFocus
                />
              </label>
              <p className={styles.customHint}>Leave empty to clear custom dice.</p>
              {customError ? <p className={styles.customError}>{customError}</p> : null}
            </OverlayBody>

            <OverlayFooter>
              <ActionButton type="submit">Add</ActionButton>
            </OverlayFooter>
          </form>
        </SheetModal>
      ) : null}

      {diceRollerPopup}
    </>
  );
}

export default ThumbDiceButton;
