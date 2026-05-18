import clsx from "clsx";
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
  getRogueSneakAttackFormulaDisplay,
  getRogueSneakAttackMaxEffects,
  rogueCunningStrikeSavingThrowDescription,
  type RogueSneakAttackEffectDefinition,
  type RogueSneakAttackEffectKey
} from "../../../../../../pages/CharactersPage/classFeatures/rogue/rogue";
import { formatFormulaCell } from "../../../../../../pages/CharactersPage/shared/formulas";
import sheetStyles from "../../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
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
  const previewFormulaDisplay =
    getRogueSneakAttackFormulaDisplay(character, selectedEffectKeys) ?? previewFormula;
  const previewFormulaCell = formatFormulaCell({
    formula: previewFormula,
    displayTerms: [previewFormulaDisplay],
    resultLabel: "Damage"
  });

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
    <div className={styles.sneakAttackBody}>
      <div className={clsx(sheetStyles.spellDrawerDetails, styles.sneakAttackFormulaGrid)}>
        <CellContainer
          className={styles.sneakAttackFormulaCell}
          label="Sneak Attack Damage Formula"
          content={previewFormulaCell.value}
          breakdown={previewFormulaCell.breakdown}
          contentClassName={styles.sneakAttackFormulaValue}
          breakdownClassName={styles.sneakAttackFormulaBreakdown}
        />
      </div>

      {effectDefinitions.length > 0 ? (
        <section className={styles.sneakAttackEffectsSection}>
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
        </section>
      ) : null}
    </div>
  );
}

export default SneakAttackActionBody;
