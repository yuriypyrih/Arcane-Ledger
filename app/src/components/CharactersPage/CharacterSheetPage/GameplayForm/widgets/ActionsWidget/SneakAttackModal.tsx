import CellContainer from "../../../../../CellContainer/CellContainer";
import DescriptionContent from "../../../../../DescriptionContent/DescriptionContent";
import RadioContainerOption from "../../../RadioContainerOption";
import type { Character } from "../../../../../../types";
import type { FeatureActionCard } from "../../../../../../pages/CharactersPage/classFeatures";
import {
  getRogueSneakAttackDiceCount,
  getRogueSneakAttackEffectDefinitions,
  getRogueSneakAttackEffectDiceCost,
  getRogueSneakAttackFormula,
  getRogueSneakAttackMaxEffects,
  rogueCunningStrikeSavingThrowDescription,
  type RogueSneakAttackEffectDefinition,
  type RogueSneakAttackEffectKey
} from "../../../../../../pages/CharactersPage/classFeatures/rogue/rogue";
import {
  getRogueSoulknifePsionicDiceRemaining,
  getRogueSoulknifeRendMindUsesRemaining,
  hasRogueSoulknifeRendMindFeature
} from "../../../../../../pages/CharactersPage/classFeatures/rogue/subclasses/rogueSoulknife";
import { getAbilityModifierForCharacter } from "../../../../../../pages/CharactersPage/abilities";
import { getProficiencyBonus } from "../../../../../../pages/CharactersPage/gameplay";
import { formatFormulaCell } from "../../../../../../pages/CharactersPage/shared/formulas";
import shared from "../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./SneakAttackModal.module.css";

export type SneakAttackActionSelection = {
  effectKeys: RogueSneakAttackEffectKey[];
  useRendMind: boolean;
};

type SneakAttackActionBodyProps = {
  action: FeatureActionCard;
  character: Character;
  selection: SneakAttackActionSelection;
  onSelectionChange: (selection: SneakAttackActionSelection) => void;
};

function SneakAttackActionBody({
  action,
  character,
  selection,
  onSelectionChange
}: SneakAttackActionBodyProps) {
  const selectedEffectKeys = selection.effectKeys;
  const effectDefinitions = getRogueSneakAttackEffectDefinitions(character);
  const maxEffects = getRogueSneakAttackMaxEffects(character);
  const totalDiceCount = getRogueSneakAttackDiceCount(character);
  const selectedEffectCost = getRogueSneakAttackEffectDiceCost(character, selectedEffectKeys);
  const previewFormula =
    getRogueSneakAttackFormula(character, selectedEffectKeys) ??
    action.valueLabel ??
    action.summary;
  const previewFormulaCell = formatFormulaCell({
    formula: previewFormula,
    resultLabel: "Damage"
  });
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
    const currentKeys = selection.effectKeys;

    if (currentKeys.includes(effect.key)) {
      onSelectionChange({
        ...selection,
        effectKeys: currentKeys.filter((key) => key !== effect.key)
      });
      return;
    }

    if (
      currentKeys.length >= maxEffects ||
      getRogueSneakAttackEffectDiceCost(character, currentKeys) + effect.costDice > totalDiceCount
    ) {
      return;
    }

    onSelectionChange({
      ...selection,
      effectKeys: [...currentKeys, effect.key]
    });
  }

  return (
    <>
      <CellContainer
        className={styles.sneakAttackPreviewCard}
        label="Formula"
        content={previewFormulaCell.value}
        breakdown={previewFormulaCell.breakdown}
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
              {rogueCunningStrikeSavingThrowDescription ? (
                <p className={shared.helperText}>{rogueCunningStrikeSavingThrowDescription}</p>
              ) : null}
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
                  header={
                    <DescriptionContent
                      description={effect.referenceDescription}
                      className={styles.sneakAttackEffectDescription}
                      entryClassName={styles.sneakAttackEffectDescriptionLine}
                      strongClassName={styles.sneakAttackEffectDescriptionStrong}
                    />
                  }
                  selected={isSelected}
                  disabled={isDisabled}
                  indicatorType="checkbox"
                  onSelect={() => toggleEffect(effect)}
                  className={styles.sneakAttackEffectOption}
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
            selected={selection.useRendMind}
            disabled={!canUseRendMind}
            indicatorType="checkbox"
            onSelect={() =>
              onSelectionChange({
                ...selection,
                useRendMind: !selection.useRendMind
              })
            }
          />

          {!canUseRendMind ? (
            <p className={styles.rendMindWarning}>Rend Mind needs a charge or 1 Psionic Die.</p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

export default SneakAttackActionBody;
