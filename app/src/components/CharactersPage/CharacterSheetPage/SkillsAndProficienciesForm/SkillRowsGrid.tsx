import clsx from "clsx";
import { ChevronsUp } from "lucide-react";
import type { SkillProficiencyEntry } from "../../../../types";
import { PROF_LEVEL } from "../../../../types";
import type { FeatureIndicator } from "../../../../pages/CharactersPage/classFeatures";
import type { CharacterCombatSummarySkills } from "../../../../pages/CharactersPage/characterRuntime/combatSummarySkills";
import {
  getResolvedSkillProficiencyEntry,
  getSkillProficiencyForName,
  isManualSkillLevelSelectable
} from "../../../../pages/CharactersPage/proficiency";
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
  skillSummary: CharacterCombatSummarySkills;
  skillProficiencies: SkillProficiencyEntry[];
  editable?: boolean;
  onOpenSkillReference: OpenSkillReferenceHandler;
  onSkillLevelChange?: (skillName: string, nextLevel: PROF_LEVEL) => void;
};

function SkillRowsGrid({
  skillSummary,
  skillProficiencies,
  editable = false,
  onOpenSkillReference,
  onSkillLevelChange
}: SkillRowsGridProps) {
  const skillRowsByAbilityMap = new Map(
    skillSummary.rowsByAbility.map((group) => [group.ability, group])
  );

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
                    const skillReference = skillSummary.getReferenceForSkill(row.name);
                    const skillRollState = resolveFeatureIndicators(skillReference?.indicators);

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
                                skillReference?.indicators,
                                skillReference?.detailCards,
                                skillReference?.rollModifier,
                                skillReference?.rollDescription,
                                undefined,
                                skillReference?.descriptionAdditions,
                                skillReference?.rollFormula,
                                skillReference?.rollFormulaDisplay
                              )
                            }
                          >
                            <span className={styles.skillNameContent}>
                              <span>{row.name}</span>
                              {skillReference?.hasAdditionalBonuses ? (
                                <span
                                  title={skillReference.additionalBonusLabels.join(", ")}
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
