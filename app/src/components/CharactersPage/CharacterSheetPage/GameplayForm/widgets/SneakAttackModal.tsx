import { BookOpen } from "lucide-react";
import { useState } from "react";
import CellContainer from "../../../../CellContainer/CellContainer";
import KeywordReferenceDrawer from "../../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import RadioContainerOption from "../../RadioContainerOption";
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
} from "../../../../../pages/CharactersPage/classFeatures/rogue/rogue";
import {
  getRogueSoulknifePsionicDiceRemaining,
  getRogueSoulknifeRendMindUsesRemaining,
  hasRogueSoulknifeRendMindFeature
} from "../../../../../pages/CharactersPage/classFeatures/rogue/subclasses/rogueSoulknife";
import { getAbilityModifierForCharacter } from "../../../../../pages/CharactersPage/abilities";
import { getProficiencyBonus } from "../../../../../pages/CharactersPage/gameplay";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./SneakAttackModal.module.css";

export type SneakAttackActionSelection = {
  effectKeys: RogueSneakAttackEffectKey[];
  useRendMind: boolean;
};

type SneakAttackActionBodyProps = {
  action: FeatureActionCard;
  character: Character;
  onConfirm: (selection: SneakAttackActionSelection) => void;
};

function SneakAttackActionBody({ action, character, onConfirm }: SneakAttackActionBodyProps) {
  const [selectedEffectKeys, setSelectedEffectKeys] = useState<RogueSneakAttackEffectKey[]>([]);
  const [selectedReferenceEffect, setSelectedReferenceEffect] =
    useState<RogueSneakAttackEffectDefinition | null>(null);
  const [selectedRendMind, setSelectedRendMind] = useState(false);
  const effectDefinitions = getRogueSneakAttackEffectDefinitions(character);
  const maxEffects = getRogueSneakAttackMaxEffects(character);
  const totalDiceCount = getRogueSneakAttackDiceCount(character);
  const selectedEffectCost = getRogueSneakAttackEffectDiceCost(character, selectedEffectKeys);
  const previewValueLabel =
    getRogueSneakAttackValueLabel(character, selectedEffectKeys) ??
    action.valueLabel ??
    action.summary;
  const hasRendMind = hasRogueSoulknifeRendMindFeature(character);
  const rendMindUsesRemaining = getRogueSoulknifeRendMindUsesRemaining(character);
  const psionicDiceRemaining = getRogueSoulknifePsionicDiceRemaining(character);
  const canUseRendMind = rendMindUsesRemaining > 0 || psionicDiceRemaining > 0;
  const rendMindSaveDc =
    8 + getAbilityModifierForCharacter(character, "DEX") + getProficiencyBonus(character.level);
  const rendMindUsageLabel =
    rendMindUsesRemaining > 0
      ? "1 charge available"
      : psionicDiceRemaining > 0
        ? "Use 1 Psionic Die"
        : "No charge or Psionic Die remaining";

  function toggleEffect(effect: RogueSneakAttackEffectDefinition) {
    setSelectedEffectKeys((currentKeys) => {
      if (currentKeys.includes(effect.key)) {
        return currentKeys.filter((key) => key !== effect.key);
      }

      if (
        currentKeys.length >= maxEffects ||
        getRogueSneakAttackEffectDiceCost(character, currentKeys) + effect.costDice > totalDiceCount
      ) {
        return currentKeys;
      }

      return [...currentKeys, effect.key];
    });
  }

  return (
    <>
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
                Choose up to {maxEffects} effect{maxEffects === 1 ? "" : "s"}. Each effect reduces
                the Sneak Attack dice you roll.
              </p>
            </div>
            <span className={styles.sneakAttackEffectSpend}>{selectedEffectCost}d6 spent</span>
          </div>

          <div className={styles.sneakAttackEffectsList}>
            {effectDefinitions.map((effect) => {
              const isSelected = selectedEffectKeys.includes(effect.key);
              const isDisabled =
                !isSelected &&
                (selectedEffectKeys.length >= maxEffects ||
                  selectedEffectCost + effect.costDice > totalDiceCount);

              return (
                <RadioContainerOption
                  key={effect.key}
                  header={effect.name}
                  breakdown={
                    <span className={styles.sneakAttackEffectMeta}>{`Cost: ${effect.costDice}d6`}</span>
                  }
                  selected={isSelected}
                  disabled={isDisabled}
                  indicatorType="checkbox"
                  onSelect={() => toggleEffect(effect)}
                  className={styles.sneakAttackEffectOption}
                  aside={
                    <button
                      type="button"
                      className={styles.sneakAttackReferenceButton}
                      onClick={() => setSelectedReferenceEffect(effect)}
                      aria-label={`Open ${effect.name} reference`}
                    >
                      <BookOpen size={16} />
                    </button>
                  }
                />
              );
            })}
          </div>
        </div>
      ) : null}

      {hasRendMind ? (
        <div className={styles.rendMindSection}>
          <div className={styles.rendMindHeader}>
            <div>
              <h4 className={styles.sneakAttackEffectsTitle}>Rend Mind</h4>
              <p className={shared.helperText}>
                Opt in when the triggering Sneak Attack used your Psychic Blade.
              </p>
            </div>
            <span className={styles.rendMindTag}>{rendMindUsageLabel}</span>
          </div>

          <RadioContainerOption
            header="Rend Mind"
            subheader={`Wis Save DC ${rendMindSaveDc} | ${
              rendMindUsesRemaining > 0 ? "Long Rest charge" : "Use 1 Psionic Die"
            }`}
            selected={selectedRendMind}
            disabled={!canUseRendMind}
            indicatorType="checkbox"
            onSelect={() => setSelectedRendMind((current) => !current)}
          />

          {!canUseRendMind ? (
            <p className={styles.rendMindWarning}>Rend Mind needs a charge or 1 Psionic Die.</p>
          ) : null}
        </div>
      ) : null}

      <div className={shared.formActions}>
        <button
          type="button"
          className={shared.saveButton}
          onClick={() =>
            onConfirm({
              effectKeys: selectedEffectKeys,
              useRendMind: selectedRendMind && canUseRendMind
            })
          }
        >
          Sneak Attack
        </button>
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

export default SneakAttackActionBody;
