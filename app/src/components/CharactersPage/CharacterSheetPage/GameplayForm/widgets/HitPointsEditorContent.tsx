import clsx from "clsx";
import type { ChangeEvent } from "react";
import { CLASS_FEATURE, FEATS, type SpellDescriptionEntry } from "../../../../../codex/entries";
import CellContainer from "../../../../CellContainer/CellContainer";
import DescriptionContent from "../../../../DescriptionContent/DescriptionContent";
import NumberInput from "../../../FormInputs/NumberInput";
import type { Character } from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../../../pages/CharactersPage/abilities";
import {
  createFeatureSourcedDescriptionEntries,
  createSourcedDescriptionEntries
} from "../../../../../pages/CharactersPage/actionModalDescriptions";
import { getCharacterCustomTraitEffectInput } from "../../../../../pages/CharactersPage/characterRuntime/customEffectRuntime";
import { getFeatureDescriptionForCharacter } from "../../../../../pages/CharactersPage/classFeatures/featureDescriptions";
import { getCustomTraitActualMaxHitPointBonuses } from "../../../../../pages/CharactersPage/customTraitEffects";
import { getFeatDefinition, getFeatLabel } from "../../../../../pages/CharactersPage/feats";
import { getAutomaticMaxHitPointsForCharacter } from "../../../../../pages/CharactersPage/gameplay";
import { getCharacterClasses } from "../../../../../pages/CharactersPage/multiclass";
import {
  getHitDieFormulaForClass,
  getHitDieLabelForCharacter,
  getHitDieMaximumForClass
} from "../../../../../pages/CharactersPage/hitDice";
import {
  formatFormulaBreakdown,
  formatFormulaTerms,
  formatSignedFormulaTerm
} from "../../../../../pages/CharactersPage/shared/formulas";
import {
  getDwarvenToughnessDescriptionAddition,
  getDwarvenToughnessHitPointMaximumBonus
} from "../../../../../pages/CharactersPage/speciesDwarf";
import { getEffectiveHitPointMaximumForCharacter } from "../../../../../pages/CharactersPage/traits";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import type { MaxHitPointsMode } from "../gameplayStateUtils";
import styles from "./HitPointsEditModal.module.css";

export const MAX_HIT_POINTS = 9999;
export const HIT_POINTS_MODAL_SUMMARY =
  "Level 1 uses your Hit Die maximum plus CON. Auto uses the rounded-up average plus CON after level 1. While in Manual mode you have to do the rolls yourself and simply edit the maximum HP to the value.";

export type HitPointsEditorCharacter = Pick<
  Character,
  | "abilities"
  | "classFeatureState"
  | "className"
  | "classRules"
  | "currentHitPoints"
  | "customClass"
  | "hitPoints"
  | "level"
> &
  Partial<
    Pick<
      Character,
      | "background"
      | "backgroundChoices"
      | "feats"
      | "inventoryItems"
      | "multiclass"
      | "species"
      | "statusEntries"
      | "subclassId"
    >
  >;

type HitPointsEditorContentProps = {
  character: HitPointsEditorCharacter;
  mode: MaxHitPointsMode;
  hitPoints: number;
  currentHitPoints: number;
  onSetMode: (mode: MaxHitPointsMode) => void;
  onHitPointsChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCurrentHitPointsChange: (event: ChangeEvent<HTMLInputElement>) => void;
  currentHitPointsDisabled?: boolean;
  hitPointsInvalid?: boolean;
  className?: string;
};

function formatHitPointFormulaContent({
  character,
  mode
}: {
  character: HitPointsEditorCharacter;
  mode: MaxHitPointsMode;
}): { content: string; breakdown: string } {
  const constitutionModifier = getAbilityModifierForCharacter(character, "CON");
  const constitutionTerm = formatSignedFormulaTerm(constitutionModifier, "CON");
  const breakdown =
    mode === "automatic"
      ? (formatFormulaBreakdown([`${getAutomaticMaxHitPointsForCharacter(character)} Base HP`]) ??
        "")
      : "Roll yourself";
  if (character.multiclass) {
    const adjustment = character.multiclass.hitPointsAdjustment ?? 0;
    let minimum = adjustment;
    let maximum = adjustment;
    const terms: string[] = [];
    function addGain(term: string, dieMinimum: number, dieMaximum: number, count = 1) {
      if (!count) return;
      const expression = formatFormulaTerms([term, constitutionTerm]);
      const gain = dieMinimum + constitutionModifier < 1 ? `max(1, ${expression})` : expression;
      terms.push(count === 1 && dieMinimum === dieMaximum ? gain : `${count} × (${gain})`);
      minimum += count * Math.max(1, dieMinimum + constitutionModifier);
      maximum += count * Math.max(1, dieMaximum + constitutionModifier);
    }
    for (const entry of getCharacterClasses(character)) {
      const die = getHitDieMaximumForClass(entry.className, entry.customClass, entry.classRules);
      const className = entry.customClass?.name || entry.className;
      const isStarting = entry.id === character.multiclass.startingClassId;
      if (isStarting) addGain(`${die} ${className} D${die}`, die, die);
      const rolls = new Map<number, number>();
      let unrolledLevels = 0;
      for (let index = isStarting ? 1 : 0; index < entry.level; index += 1) {
        const roll = entry.hitPointRolls?.[index];
        if (typeof roll === "number" && Number.isInteger(roll) && roll >= 1 && roll <= die)
          rolls.set(roll, (rolls.get(roll) ?? 0) + 1);
        else unrolledLevels += 1;
      }
      for (const [roll, count] of rolls)
        addGain(`${roll} ${className} D${die} roll`, roll, roll, count);
      addGain(`1d${die} ${className}`, 1, die, unrolledLevels);
    }
    if (adjustment) terms.push(formatSignedFormulaTerm(adjustment, "Adjustment"));
    let formula = formatFormulaTerms(terms);
    if (minimum < 1) formula = `max(1, ${formula})`;
    if (maximum > MAX_HIT_POINTS) formula = `min(${MAX_HIT_POINTS}, ${formula})`;
    const minimumBaseHitPoints = Math.max(1, Math.min(MAX_HIT_POINTS, minimum));
    const maximumBaseHitPoints = Math.max(1, Math.min(MAX_HIT_POINTS, maximum));
    return {
      content: `${minimumBaseHitPoints}~${maximumBaseHitPoints} MAX HP = ${formula}`,
      breakdown
    };
  }
  const hitDieLabel = getHitDieLabelForCharacter(character);
  const className = character.customClass?.name || character.className;
  const hitDieFormula = getHitDieFormulaForClass(
    character.className,
    character.customClass,
    character.classRules
  );
  const hitDieMaximum = getHitDieMaximumForClass(
    character.className,
    character.customClass,
    character.classRules
  );
  const level = Math.max(1, Math.floor(character.level));
  const laterLevelCount = Math.max(0, level - 1);
  const firstLevelHitPoints = Math.max(1, hitDieMaximum + constitutionModifier);
  const minimumBaseHitPoints =
    firstLevelHitPoints + laterLevelCount * Math.max(1, 1 + constitutionModifier);
  const maximumBaseHitPoints =
    firstLevelHitPoints + laterLevelCount * Math.max(1, hitDieMaximum + constitutionModifier);
  const firstLevelFormula = formatFormulaTerms([
    `${hitDieMaximum} ${className} ${hitDieLabel}`,
    constitutionTerm
  ]);
  const laterLevelFormula = `${hitDieFormula} ${className} ${constitutionTerm}`;
  const formula = formatFormulaTerms([
    hitDieMaximum + constitutionModifier < 1 ? `max(1, ${firstLevelFormula})` : firstLevelFormula,
    `+ ${laterLevelCount} × (${constitutionModifier < 0 ? `max(1, ${laterLevelFormula})` : laterLevelFormula})`
  ]);

  return {
    content: `${minimumBaseHitPoints}~${maximumBaseHitPoints} MAX HP = ${formula}`,
    breakdown
  };
}

function characterHasFeat(character: HitPointsEditorCharacter, feat: FEATS): boolean {
  return Boolean(character.feats?.some((entry) => entry.feat === feat));
}

function getFeatHitPointDescriptionAddition(feat: FEATS): SpellDescriptionEntry[] {
  const description = getFeatDefinition(feat)?.description ?? [];
  const hitPointDescription = description.filter(
    (entry): entry is string => typeof entry === "string" && entry.includes("Hit Point maximum")
  );

  return createSourcedDescriptionEntries(
    getFeatLabel(feat),
    hitPointDescription.length > 0 ? hitPointDescription : description
  );
}

function formatActualMaxHitPointBonusValue(value: number): string {
  const normalizedValue = Math.trunc(value);

  return normalizedValue >= 0 ? `+${normalizedValue}` : String(normalizedValue);
}

function getActualMaxHitPointDescriptionAdditions(
  character: HitPointsEditorCharacter
): SpellDescriptionEntry[][] {
  return getCustomTraitActualMaxHitPointBonuses(getCharacterCustomTraitEffectInput(character)).map(
    (bonus) => [
      `Actual Max HP: ${formatActualMaxHitPointBonusValue(bonus.value)} from ${bonus.label}`
    ]
  );
}

function getHitPointAdditionalDescription(
  character: HitPointsEditorCharacter
): SpellDescriptionEntry[][] {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];
  const draconicResilienceDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.DRACONIC_RESILIENCE
  );

  if (draconicResilienceDescription.length > 0) {
    descriptionAdditions.push(
      createFeatureSourcedDescriptionEntries(
        character,
        CLASS_FEATURE.DRACONIC_RESILIENCE,
        draconicResilienceDescription,
        "Draconic Resilience"
      )
    );
  }

  if (getDwarvenToughnessHitPointMaximumBonus(character) > 0) {
    descriptionAdditions.push(getDwarvenToughnessDescriptionAddition());
  }

  if (characterHasFeat(character, FEATS.TOUGH)) {
    descriptionAdditions.push(getFeatHitPointDescriptionAddition(FEATS.TOUGH));
  }

  if (characterHasFeat(character, FEATS.BOON_OF_FORTITUDE)) {
    descriptionAdditions.push(getFeatHitPointDescriptionAddition(FEATS.BOON_OF_FORTITUDE));
  }

  descriptionAdditions.push(...getActualMaxHitPointDescriptionAdditions(character));

  return descriptionAdditions.filter((description) => description.length > 0);
}

function HitPointsEditorContent({
  character,
  mode,
  hitPoints,
  currentHitPoints,
  onSetMode,
  onHitPointsChange,
  onCurrentHitPointsChange,
  currentHitPointsDisabled = false,
  hitPointsInvalid = false,
  className
}: HitPointsEditorContentProps) {
  const editorCharacter = {
    ...character,
    hitPoints,
    currentHitPoints
  };
  const actualMaxHitPoints = getEffectiveHitPointMaximumForCharacter(editorCharacter);
  const formulaCell = formatHitPointFormulaContent({
    character: editorCharacter,
    mode
  });
  const additionalDescription = getHitPointAdditionalDescription(editorCharacter);

  return (
    <div className={clsx(styles.body, className)}>
      <div className={styles.modeSwitch} role="group" aria-label="Max HP mode">
        <button
          type="button"
          className={clsx(
            styles.modeSwitchButton,
            mode === "automatic" && styles.modeSwitchButtonActive
          )}
          onClick={() => onSetMode("automatic")}
          aria-pressed={mode === "automatic"}
        >
          Auto
        </button>
        <button
          type="button"
          className={clsx(
            styles.modeSwitchButton,
            mode === "custom" && styles.modeSwitchButtonActive
          )}
          onClick={() => onSetMode("custom")}
          aria-pressed={mode === "custom"}
        >
          Manual
        </button>
      </div>

      <CellContainer
        label="Max HP Formula"
        content={formulaCell.content}
        breakdown={formulaCell.breakdown}
        contentClassName={styles.formulaContent}
        breakdownClassName={styles.formulaBreakdown}
      />

      {additionalDescription.length > 0 ? (
        <div className={styles.additionalDescription}>
          {additionalDescription.map((description, index) => (
            <DescriptionContent
              key={index}
              description={description}
              className={styles.additionalDescriptionSection}
              entryClassName={sheetStyles.spellDrawerDescriptionLine}
              strongClassName={sheetStyles.spellDrawerDescriptionStrong}
            />
          ))}
        </div>
      ) : null}

      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span>Max Base HP</span>
          <NumberInput
            min={1}
            max={MAX_HIT_POINTS}
            disabled={mode === "automatic"}
            invalid={hitPointsInvalid}
            value={hitPoints}
            onChange={onHitPointsChange}
          />
        </label>
        <label className={styles.field}>
          <span>Actual Max HP</span>
          <NumberInput
            min={1}
            max={Math.max(MAX_HIT_POINTS, actualMaxHitPoints)}
            disabled
            value={actualMaxHitPoints}
          />
        </label>
        <label className={styles.field}>
          <span>Current HP</span>
          <NumberInput
            min={0}
            max={actualMaxHitPoints}
            disabled={currentHitPointsDisabled}
            value={currentHitPoints}
            onChange={onCurrentHitPointsChange}
          />
        </label>
      </div>
    </div>
  );
}

export default HitPointsEditorContent;
