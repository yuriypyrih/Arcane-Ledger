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
import { getFeatureDescriptionForCharacter } from "../../../../../pages/CharactersPage/classFeatures/featureDescriptions";
import { getFeatDefinition, getFeatLabel } from "../../../../../pages/CharactersPage/feats";
import { getAutomaticMaxHitPointsForCharacter } from "../../../../../pages/CharactersPage/gameplay";
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
  | "currentHitPoints"
  | "customClass"
  | "hitPoints"
  | "level"
> &
  Partial<
    Pick<
      Character,
      "background" | "backgroundChoices" | "feats" | "species" | "statusEntries" | "subclassId"
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
  const hitDieLabel = getHitDieLabelForCharacter(character);
  const hitDieFormula = getHitDieFormulaForClass(character.className, character.customClass);
  const hitDieMaximum = getHitDieMaximumForClass(character.className, character.customClass);
  const constitutionModifier = getAbilityModifierForCharacter(character, "CON");
  const level = Math.max(1, Math.floor(character.level));
  const laterLevelCount = Math.max(0, level - 1);
  const constitutionTerm = formatSignedFormulaTerm(constitutionModifier, "CON");
  const minimumBaseHitPoints = Math.max(
    1,
    hitDieMaximum + constitutionModifier + laterLevelCount * (1 + constitutionModifier)
  );
  const maximumBaseHitPoints = Math.max(
    1,
    hitDieMaximum + constitutionModifier + laterLevelCount * (hitDieMaximum + constitutionModifier)
  );
  const formula = formatFormulaTerms([
    `${hitDieMaximum} (${hitDieLabel})`,
    constitutionTerm,
    `+ ${laterLevelCount} × (${hitDieFormula} ${constitutionTerm})`
  ]);
  const breakdown =
    mode === "automatic"
      ? (formatFormulaBreakdown([`${getAutomaticMaxHitPointsForCharacter(character)} Base HP`]) ??
        "")
      : "Roll yourself";

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
          className={clsx(styles.modeSwitchButton, mode === "automatic" && styles.modeSwitchButtonActive)}
          onClick={() => onSetMode("automatic")}
          aria-pressed={mode === "automatic"}
        >
          Auto
        </button>
        <button
          type="button"
          className={clsx(styles.modeSwitchButton, mode === "custom" && styles.modeSwitchButtonActive)}
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
