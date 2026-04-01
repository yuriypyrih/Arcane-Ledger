import clsx from "clsx";
import { ChevronDown, ChevronUp, Save, X } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import NumberInput from "../../FormInputs/NumberInput";
import { abilityKeys } from "../../../../pages/CharactersPage/constants";
import type { AbilityKey } from "../../../../types";
import type { AbilitiesDraft } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./AbilityScoresModal.module.css";

type AbilityScoresModalProps = {
  isOpen: boolean;
  draft: AbilitiesDraft;
  pointBuyRemaining: number | null;
  onClose: () => void;
  onSave: () => void;
  onSetAttributeMode: (attributeMode: AbilitiesDraft["attributeMode"]) => void;
  onUpdateAbilityScore: (ability: AbilityKey, value: string) => void;
};

function AbilityScoresModal({
  isOpen,
  draft,
  pointBuyRemaining,
  onClose,
  onSave,
  onSetAttributeMode,
  onUpdateAbilityScore
}: AbilityScoresModalProps) {
  if (!isOpen) {
    return null;
  }

  const pointBuyStatus =
    draft.attributeMode === "pointBuy" && pointBuyRemaining !== null
      ? pointBuyRemaining < 0
        ? "overdraft"
        : pointBuyRemaining === 0
          ? "ready"
          : null
      : null;

  function handlePointBuyKeyDown(
    event: ReactKeyboardEvent<HTMLInputElement>,
    ability: AbilityKey
  ) {
    if (draft.attributeMode !== "pointBuy") {
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      onUpdateAbilityScore(ability, String(draft.abilities[ability] + 1));
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      onUpdateAbilityScore(ability, String(draft.abilities[ability] - 1));
      return;
    }

    if (
      [
        "Tab",
        "Shift",
        "Backspace",
        "Delete",
        "Enter",
        "Escape",
        "ArrowLeft",
        "ArrowRight"
      ].includes(event.key)
    ) {
      return;
    }

    event.preventDefault();
  }

  function adjustPointBuyAbility(ability: AbilityKey, delta: number) {
    if (draft.attributeMode !== "pointBuy" || delta === 0) {
      return;
    }

    onUpdateAbilityScore(ability, String(draft.abilities[ability] + delta));
  }

  return (
    <div
      className={sheetStyles.spellManagementBackdrop}
      role="presentation"
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
    >
      <section
        className={clsx(sheetStyles.spellManagementModal, styles.abilityEditorModal)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ability-scores-modal-title"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={sheetStyles.spellManagementHeader}>
          <div className={styles.modalHeading}>
            <h3 id="ability-scores-modal-title" className={styles.modalTitle}>
              Edit Ability Modifiers
            </h3>
            <p className={shared.helperText}>
              Update your base ability scores using Point Buy or Custom values.
            </p>
          </div>
          <button
            type="button"
            className={sheetStyles.spellManagementCloseButton}
            onClick={onClose}
            aria-label="Close ability score editor"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modeControl}>
            <button
              type="button"
              className={clsx(
                styles.modeButton,
                draft.attributeMode === "pointBuy" && styles.modeButtonActive
              )}
              onClick={() => onSetAttributeMode("pointBuy")}
            >
              Point Buy
            </button>
            <button
              type="button"
              className={clsx(
                styles.modeButton,
                draft.attributeMode === "custom" && styles.modeButtonActive
              )}
              onClick={() => onSetAttributeMode("custom")}
            >
              Custom
            </button>
          </div>

          {draft.attributeMode === "pointBuy" && pointBuyRemaining !== null ? (
            <div className={styles.pointBuyInfo}>
              <div
                className={clsx(
                  styles.pointBuySummary,
                  pointBuyStatus === "overdraft" && styles.pointBuySummaryOverdraft
                )}
              >
                <span className={styles.pointBuyLabel}>
                  POINTS REMAINING
                  {pointBuyStatus ? (
                    <>
                      {" "}
                      <span className={styles.pointBuyLabelDivider}>-</span>{" "}
                      <span
                        className={clsx(
                          styles.pointBuyStatus,
                          pointBuyStatus === "ready"
                            ? styles.pointBuyStatusReady
                            : styles.pointBuyStatusOverdraft
                        )}
                      >
                        {pointBuyStatus === "ready" ? "READY" : "OVERDRAFT"}
                      </span>
                    </>
                  ) : null}
                </span>
                <strong className={styles.pointBuyValue}>{pointBuyRemaining}</strong>
              </div>
              <p className={styles.pointBuyHint}>
                Scores 8-13 cost 1 point per +1. Scores 14-15 cost 2 points per +1.
              </p>
            </div>
          ) : null}

          <div className={styles.abilityInputGrid}>
            {abilityKeys.map((ability) => (
              <label key={ability} className={styles.abilityInputCard}>
                <span className={styles.abilityInputLabel}>{ability}</span>
                {draft.attributeMode === "pointBuy" ? (
                  <div className={styles.pointBuyInputShell}>
                    <NumberInput
                      className={styles.pointBuyInput}
                      min={8}
                      max={15}
                      readOnly
                      value={draft.abilities[ability]}
                      onBeforeInput={(event) => {
                        event.preventDefault();
                      }}
                      onKeyDown={(event) => handlePointBuyKeyDown(event, ability)}
                      onChange={(event) => onUpdateAbilityScore(ability, event.target.value)}
                    />
                    <div className={styles.pointBuyStepper}>
                      <button
                        type="button"
                        className={styles.pointBuyStepperButton}
                        onClick={() => adjustPointBuyAbility(ability, 1)}
                        disabled={draft.abilities[ability] >= 15}
                        aria-label={`Increase ${ability}`}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        className={styles.pointBuyStepperButton}
                        onClick={() => adjustPointBuyAbility(ability, -1)}
                        disabled={draft.abilities[ability] <= 8}
                        aria-label={`Decrease ${ability}`}
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <NumberInput
                    min={1}
                    max={99}
                    value={draft.abilities[ability]}
                    onChange={(event) => onUpdateAbilityScore(ability, event.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
        </div>

        <div className={shared.formActions}>
          <button type="button" className={shared.saveButton} onClick={onSave}>
            <Save size={16} />
            Save
          </button>
          <button type="button" className={shared.cancelButton} onClick={onClose}>
            <X size={16} />
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}

export default AbilityScoresModal;
