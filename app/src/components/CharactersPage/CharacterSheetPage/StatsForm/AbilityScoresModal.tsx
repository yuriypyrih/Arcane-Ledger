import clsx from "clsx";
import { ChevronDown, ChevronUp, Save, X } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import ActionButton from "../../../ActionButton";
import NumberInput from "../../FormInputs/NumberInput";
import { abilityKeys } from "../../../../pages/CharactersPage/constants";
import type { AbilityKey } from "../../../../types";
import type { AbilitiesDraft } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
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
    <SheetModal
      titleId="ability-scores-modal-title"
      onClose={onClose}
      size="small"
      panelClassName={styles.abilityEditorModal}
    >
      <OverlayHeader>
        <OverlayHeaderContent className={styles.modalHeading}>
          <OverlayTitle id="ability-scores-modal-title">Edit Ability Modifiers</OverlayTitle>
          <OverlaySummary className={shared.helperText}>
            Update your base ability scores using Point Buy or Custom values.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close ability score editor" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.modalBody}>
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
      </OverlayBody>

      <OverlayFooter>
        <div className={styles.footerActions}>
          <ActionButton onClick={onSave} icon={<Save size={16} />}>
            Save
          </ActionButton>
          <ActionButton variant="GHOST" onClick={onClose} icon={<X size={16} />}>
            Cancel
          </ActionButton>
        </div>
      </OverlayFooter>
    </SheetModal>
  );
}

export default AbilityScoresModal;
