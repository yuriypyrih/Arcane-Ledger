import clsx from "clsx";
import { ChevronsUp } from "lucide-react";
import type { Character, SkillProficiencyEntry } from "../../../../types";
import { PROF_LEVEL } from "../../../../types";
import {
  getSkillIndicatorsForCharacter,
  getSkillReferenceDescriptionAdditionsForCharacter,
  getSkillRollD20MinimumForCharacter,
  type FeatureIndicator
} from "../../../../pages/CharactersPage/classFeatures";
import {
  getResolvedSkillProficiencyEntry,
  getSkillProficiencyForName,
  isManualSkillLevelSelectable
} from "../../../../pages/CharactersPage/proficiency";
import { getSkillRowsByAbility, type SkillRow } from "../../../../pages/CharactersPage/skills";
import {
  formatFormulaCell,
  formatFormulaDieDisplayTerm,
  formatFormulaTerms,
  formatSignedFormulaTerm
} from "../../../../pages/CharactersPage/shared";
import { formatCustomTraitBonusRollFormulaTerm } from "../../../../pages/CharactersPage/customTraitEffects";
import { skillColumnLayout } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import RollStatePill from "../../../RollStatePill/RollStatePill";
import { resolveFeatureIndicators } from "../../../RollStatePill/rollState";
import SelectInput from "../../FormInputs/SelectInput";
import SheetSurface from "../SheetSurface";
import type {
  SelectedSkillReference,
  SkillReferenceDetailCard
} from "./SkillReferenceDrawer";
import styles from "./SkillsAndProficienciesForm.module.css";

export type OpenSkillReferenceHandler = (
  keyword: string,
  indicators?: FeatureIndicator[],
  detailCards?: SkillReferenceDetailCard[],
  rollModifier?: number,
  rollDescription?: string,
  additionalDescription?: SelectedSkillReference["additionalDescription"],
  descriptionAdditions?: SelectedSkillReference["descriptionAdditions"],
  rollFormula?: string,
  rollFormulaDisplay?: string
) => void;

type SkillRowsGridProps = {
  character: Character;
  skillProficiencies: SkillProficiencyEntry[];
  editable?: boolean;
  onOpenSkillReference: OpenSkillReferenceHandler;
  onSkillLevelChange?: (skillName: string, nextLevel: PROF_LEVEL) => void;
};

function formatSkillRollFormula(
  modifier: number,
  d20Minimum: number | null,
  formulaTerms: string[] = []
): string {
  const d20Term = d20Minimum ? `1d20m${d20Minimum}` : "1d20";
  const d20Formula =
    modifier === 0 ? d20Term : `${d20Term} ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;

  return formatFormulaTerms([d20Formula, ...formulaTerms]);
}

function getSkillRollFormulaTerms(row: SkillRow): string[] {
  return row.bonusEntries
    .map(formatCustomTraitBonusRollFormulaTerm)
    .filter((entry): entry is string => Boolean(entry));
}

function getSkillFormulaDisplayTerms(row: SkillRow, d20Minimum: number | null = null): string[] {
  const d20Term = formatFormulaDieDisplayTerm(
    "1d20",
    d20Minimum ? [{ kind: "minimum", value: d20Minimum }] : []
  );
  const terms = [d20Term, formatSignedFormulaTerm(row.abilityModifierBase, row.abilityLabel)];

  row.abilityModifierBonusEntries.forEach((entry) => {
    terms.push(entry.formulaLabel ?? formatSignedFormulaTerm(entry.value, entry.label));
  });

  if (row.proficiencyMultiplier === 1) {
    terms.push(formatSignedFormulaTerm(row.proficiencyContribution, "Proficiency Bonus"));
  } else if (row.proficiencyMultiplier === 2) {
    terms.push(formatSignedFormulaTerm(row.proficiencyContribution, "Proficiency Bonus x2"));
  }

  row.bonusEntries.forEach((entry) => {
    terms.push(entry.formulaLabel ?? formatSignedFormulaTerm(entry.value, entry.label));
  });

  return terms;
}

function getSkillReferenceDetailCards({
  row,
  rollFormula,
  d20Minimum
}: {
  row: SkillRow;
  rollFormula: string;
  d20Minimum: number | null;
}): SkillReferenceDetailCard[] {
  const formulaCell = formatFormulaCell({
    formula: rollFormula,
    displayTerms: getSkillFormulaDisplayTerms(row, d20Minimum),
    resultLabel: row.name
  });

  return [
    {
      label: "Formula",
      value: formulaCell.value,
      breakdown: formulaCell.breakdown,
      variant: "formula"
    }
  ];
}

function SkillRowsGrid({
  character,
  skillProficiencies,
  editable = false,
  onOpenSkillReference,
  onSkillLevelChange
}: SkillRowsGridProps) {
  const skillIndicators = getSkillIndicatorsForCharacter(character);
  const skillRowsByAbility = getSkillRowsByAbility(character, skillProficiencies);
  const skillRowsByAbilityMap = new Map(skillRowsByAbility.map((group) => [group.ability, group]));

  return (
    <div className={styles.skillColumns}>
      {skillColumnLayout.map((columnAbilities, columnIndex) => (
        <div key={`skill-column-${columnIndex}`} className={styles.skillColumn}>
          {columnAbilities.map((ability) => {
            const group = skillRowsByAbilityMap.get(ability);

            if (!group) {
              return null;
            }

            return (
              <section key={group.ability} className={styles.skillAbilityGroup}>
                <p className={styles.skillAbilityTitle}>{group.abilityLabel}</p>
                <ul className={styles.skillAbilityList}>
                  {group.rows.map((row) => {
                    const skillProficiency = getSkillProficiencyForName(row.name);
                    const resolvedSkillProficiency = skillProficiency
                      ? getResolvedSkillProficiencyEntry(skillProficiencies, skillProficiency)
                      : null;
                    const currentSkillLevel =
                      resolvedSkillProficiency?.proficiencyLevel ?? PROF_LEVEL.NONE;
                    const skillRollState = resolveFeatureIndicators(skillIndicators[row.name]);
                    const additionalBonusLabels = [
                      ...row.abilityModifierBonusEntries.map((entry) => entry.label),
                      ...row.bonusEntries.map((entry) => entry.label)
                    ];
                    const hasAdditionalBonuses = additionalBonusLabels.length > 0;
                    const reliableTalentD20Minimum = getSkillRollD20MinimumForCharacter(
                      character,
                      row.name
                    );
                    const skillDescriptionAdditions =
                      getSkillReferenceDescriptionAdditionsForCharacter(character, row.name);
                    const skillFormulaTerms = getSkillRollFormulaTerms(row);
                    const skillRollFormula = formatSkillRollFormula(
                      row.totalModifier,
                      reliableTalentD20Minimum,
                      skillFormulaTerms
                    );
                    const skillDetailCards = getSkillReferenceDetailCards({
                      row,
                      rollFormula: skillRollFormula,
                      d20Minimum: reliableTalentD20Minimum
                    });
                    const skillFormulaDescription =
                      typeof skillDetailCards[0]?.value === "string"
                        ? skillDetailCards[0].value
                        : undefined;

                    return (
                      <SheetSurface
                        as="li"
                        key={row.name}
                        borderSize="sm"
                        hoverBorder
                        className={clsx(
                          styles.skillRow,
                          editable && styles.skillRowEditing,
                          row.proficiencyMultiplier === 1 && styles.skillRowProficient,
                          row.proficiencyMultiplier === 2 && styles.skillRowExpert
                        )}
                      >
                        <strong className={styles.skillRowModifier}>
                          {row.totalModifier >= 0 ? `+${row.totalModifier}` : row.totalModifier}
                        </strong>
                        <div className={styles.skillRowContent}>
                          <button
                            type="button"
                            className={styles.skillNameButton}
                            onClick={() =>
                              onOpenSkillReference(
                                row.name,
                                skillIndicators[row.name],
                                skillDetailCards,
                                row.totalModifier,
                                skillFormulaDescription,
                                undefined,
                                skillDescriptionAdditions,
                                skillRollFormula,
                                skillRollFormula
                              )
                            }
                          >
                            <span className={styles.skillNameContent}>
                              <span>{row.name}</span>
                              {hasAdditionalBonuses ? (
                                <span
                                  title={additionalBonusLabels.join(", ")}
                                  className={styles.skillBonusIcon}
                                >
                                  <ChevronsUp size={16} aria-hidden="true" />
                                </span>
                              ) : null}
                            </span>
                          </button>
                          {skillRollState ? (
                            <span className={styles.skillIndicators}>
                              <RollStatePill
                                tone={skillRollState.tone}
                                label={skillRollState.label}
                              />
                            </span>
                          ) : null}
                        </div>
                        {editable ? (
                          <SelectInput
                            className={styles.skillLevelSelect}
                            value={currentSkillLevel}
                            onChange={(event) =>
                              onSkillLevelChange?.(row.name, event.target.value as PROF_LEVEL)
                            }
                          >
                            <option
                              value={PROF_LEVEL.NONE}
                              disabled={
                                skillProficiency
                                  ? !isManualSkillLevelSelectable(
                                      skillProficiencies,
                                      skillProficiency,
                                      PROF_LEVEL.NONE
                                    )
                                  : false
                              }
                            >
                              None
                            </option>
                            <option
                              value={PROF_LEVEL.PROFICIENT}
                              disabled={
                                skillProficiency
                                  ? !isManualSkillLevelSelectable(
                                      skillProficiencies,
                                      skillProficiency,
                                      PROF_LEVEL.PROFICIENT
                                    )
                                  : false
                              }
                            >
                              Proficient
                            </option>
                            <option
                              value={PROF_LEVEL.EXPERT}
                              disabled={
                                skillProficiency
                                  ? !isManualSkillLevelSelectable(
                                      skillProficiencies,
                                      skillProficiency,
                                      PROF_LEVEL.EXPERT
                                    )
                                  : false
                              }
                            >
                              Expert
                            </option>
                          </SelectInput>
                        ) : null}
                      </SheetSurface>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default SkillRowsGrid;
