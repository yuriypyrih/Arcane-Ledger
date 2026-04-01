import clsx from "clsx";
import { BookOpen, X } from "lucide-react";
import { useState } from "react";
import CellContainer from "../../../../CellContainer/CellContainer";
import KeywordReferenceDrawer from "../../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import type { Character } from "../../../../../types";
import type { FeatureActionCard } from "../../../../../pages/CharactersPage/classFeatures";
import {
  getRogueSneakAttackDiceCount,
  getRogueSneakAttackEffectDefinitions,
  getRogueSneakAttackEffectDiceCost,
  getRogueSneakAttackMaxEffects,
  getRogueSneakAttackValueLabel,
  type RogueSneakAttackEffectDefinition,
  type RogueSneakAttackEffectKey
} from "../../../../../pages/CharactersPage/classFeatures/rogue";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import sharedModalStyles from "./FeatureActionModal.module.css";
import styles from "./SneakAttackModal.module.css";

type SneakAttackModalProps = {
  action: FeatureActionCard;
  character: Character;
  onClose: () => void;
  onConfirm: (effectKeys: RogueSneakAttackEffectKey[]) => void;
};

function SneakAttackModal({
  action,
  character,
  onClose,
  onConfirm
}: SneakAttackModalProps) {
  const [selectedEffectKeys, setSelectedEffectKeys] = useState<RogueSneakAttackEffectKey[]>([]);
  const [selectedReferenceEffect, setSelectedReferenceEffect] =
    useState<RogueSneakAttackEffectDefinition | null>(null);
  const effectDefinitions = getRogueSneakAttackEffectDefinitions(character);
  const maxEffects = getRogueSneakAttackMaxEffects(character);
  const baseDiceCount = getRogueSneakAttackDiceCount(character);
  const selectedEffectCost = getRogueSneakAttackEffectDiceCost(selectedEffectKeys);
  const previewValueLabel =
    getRogueSneakAttackValueLabel(character, selectedEffectKeys) ??
    action.valueLabel ??
    action.summary;

  function toggleEffect(effect: RogueSneakAttackEffectDefinition) {
    setSelectedEffectKeys((currentKeys) => {
      if (currentKeys.includes(effect.key)) {
        return currentKeys.filter((key) => key !== effect.key);
      }

      if (
        currentKeys.length >= maxEffects ||
        getRogueSneakAttackEffectDiceCost(currentKeys) + effect.costDice > baseDiceCount
      ) {
        return currentKeys;
      }

      return [...currentKeys, effect.key];
    });
  }

  return (
    <>
      <div className={sheetStyles.spellManagementBackdrop} role="presentation" onClick={onClose}>
        <section
          className={clsx(sheetStyles.spellManagementModal, sharedModalStyles.featureActionModal)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sneak-attack-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className={sheetStyles.spellManagementHeader}>
            <div className={sharedModalStyles.modalHeading}>
              <p className={sheetStyles.eyebrow}>Rogue</p>
              <h3 id="sneak-attack-modal-title" className={sheetStyles.sheetPanelTitle}>
                {action.name}
              </h3>
              <p className={shared.helperText}>{action.breakdown ?? action.detail}</p>
            </div>
            <button
              type="button"
              className={sheetStyles.spellManagementCloseButton}
              onClick={onClose}
              aria-label="Close Sneak Attack"
            >
              <X size={18} />
            </button>
          </div>

          <CellContainer
            className={styles.sneakAttackPreviewCard}
            label="Damage"
            content={previewValueLabel}
          />

          {effectDefinitions.length > 0 ? (
            <div className={styles.sneakAttackEffectsSection}>
              <div className={styles.sneakAttackEffectsHeader}>
                <div>
                  <h4 className={styles.sneakAttackEffectsTitle}>Cunning Strike</h4>
                  <p className={shared.helperText}>
                    Choose up to {maxEffects} effect{maxEffects === 1 ? "" : "s"}. Each effect
                    reduces the Sneak Attack dice you roll.
                  </p>
                </div>
                <span className={styles.sneakAttackEffectSpend}>
                  {selectedEffectCost}d6 spent
                </span>
              </div>

              <div className={styles.sneakAttackEffectsList}>
                {effectDefinitions.map((effect) => {
                  const isSelected = selectedEffectKeys.includes(effect.key);
                  const isDisabled =
                    !isSelected &&
                    (selectedEffectKeys.length >= maxEffects ||
                      selectedEffectCost + effect.costDice > baseDiceCount);

                  return (
                    <div
                      key={effect.key}
                      className={clsx(
                        styles.sneakAttackEffectRow,
                        isSelected && styles.sneakAttackEffectRowSelected
                      )}
                    >
                      <button
                        type="button"
                        className={styles.sneakAttackEffectButton}
                        onClick={() => toggleEffect(effect)}
                        disabled={isDisabled}
                        aria-pressed={isSelected}
                      >
                        <strong className={styles.sneakAttackEffectName}>{effect.name}</strong>
                        <small className={styles.sneakAttackEffectMeta}>
                          {`Cost: ${effect.costDice}d6`}
                        </small>
                      </button>
                      <button
                        type="button"
                        className={styles.sneakAttackReferenceButton}
                        onClick={() => setSelectedReferenceEffect(effect)}
                        aria-label={`Open ${effect.name} reference`}
                      >
                        <BookOpen size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className={shared.formActions}>
            <button type="button" className={shared.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className={shared.saveButton}
              onClick={() => onConfirm(selectedEffectKeys)}
            >
              Sneak Attack
            </button>
          </div>
        </section>
      </div>

      {selectedReferenceEffect ? (
        <KeywordReferenceDrawer
          title={selectedReferenceEffect.referenceTitle}
          badgeLabel="Keyword"
          backdropClassName={styles.sneakAttackReferenceDrawerBackdrop}
          entries={[
            {
              title: "",
              description: selectedReferenceEffect.referenceDescription
            }
          ]}
          onClose={() => setSelectedReferenceEffect(null)}
        />
      ) : null}
    </>
  );
}

export default SneakAttackModal;
