import clsx from "clsx";
import { Pencil, Save, X } from "lucide-react";
import SelectInput from "../../../../components/CharactersPage/FormInputs/SelectInput";
import type { AbilityKey, SkillName } from "../../../../types";
import type { SkillRowsByAbility } from "../../skills";
import type { GrantedProficiency, ToolProficiency } from "../../proficiency";
import type { SkillLevel } from "../types";
import shared from "./CharacterSheetSectionShared.module.css";
import styles from "./SkillsAndProficienciesForm.module.css";

type SkillsAndProficienciesFormProps = {
  className?: string;
  displayedManualProficiencyLabels: string[];
  displayedManualSkillSet: Set<string>;
  displayedManualToolSet: Set<ToolProficiency>;
  displayedSkillExpertiseSet: Set<string>;
  grantedProficiencies: GrantedProficiency[];
  grantedSkillSet: Set<SkillName>;
  isEditing: boolean;
  onBeginEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onToggleToolProficiency: (toolProficiency: ToolProficiency) => void;
  onUpdateSkillLevel: (
    skill: SkillName,
    nextLevel: SkillLevel,
    isGrantedProficient: boolean
  ) => void;
  resolveToolProficiencyLabel: (toolProficiency: ToolProficiency) => string;
  skillColumnLayout: AbilityKey[][];
  skillRowsByAbilityMap: Map<AbilityKey, SkillRowsByAbility>;
  toolProficiencyOptions: ToolProficiency[];
};

function getSkillLevelForSkill(
  skill: SkillName,
  isGrantedProficient: boolean,
  manualSkillSet: Set<string>,
  expertiseSkillSet: Set<string>
): SkillLevel {
  if (expertiseSkillSet.has(skill)) {
    return "expert";
  }

  if (isGrantedProficient || manualSkillSet.has(skill)) {
    return "proficient";
  }

  return "none";
}

function SkillsAndProficienciesForm({
  className,
  displayedManualProficiencyLabels,
  displayedManualSkillSet,
  displayedManualToolSet,
  displayedSkillExpertiseSet,
  grantedProficiencies,
  grantedSkillSet,
  isEditing,
  onBeginEdit,
  onCancel,
  onSave,
  onToggleToolProficiency,
  onUpdateSkillLevel,
  resolveToolProficiencyLabel,
  skillColumnLayout,
  skillRowsByAbilityMap,
  toolProficiencyOptions
}: SkillsAndProficienciesFormProps) {
  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Skills</p>
          <h3 className={shared.subtitle}>Skills and Proficiencies</h3>
        </div>
      </div>

      <div className={styles.skillStack}>
        <div className={styles.skillGroup}>
          <div className={styles.skillGroupHeader}>
            <p className={styles.skillGroupTitle}>Skills</p>
            {isEditing ? null : (
              <button type="button" className={shared.editButton} onClick={onBeginEdit}>
                <Pencil size={16} />
                Edit
              </button>
            )}
          </div>
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
                          const isGrantedProficient = grantedSkillSet.has(row.name);
                          const currentSkillLevel = getSkillLevelForSkill(
                            row.name,
                            isGrantedProficient,
                            displayedManualSkillSet,
                            displayedSkillExpertiseSet
                          );

                          return (
                            <li
                              key={row.name}
                              className={clsx(
                                styles.skillRow,
                                isEditing && styles.skillRowEditing,
                                row.proficiencyMultiplier === 1 && styles.skillRowProficient,
                                row.proficiencyMultiplier === 2 && styles.skillRowExpert
                              )}
                            >
                              <strong className={styles.skillRowModifier}>{row.totalModifier >= 0 ? `+${row.totalModifier}` : row.totalModifier}</strong>
                              <span>{row.name}</span>
                              {isEditing ? (
                                <SelectInput
                                  className={styles.skillLevelSelect}
                                  value={currentSkillLevel}
                                  onChange={(event) =>
                                    onUpdateSkillLevel(
                                      row.name,
                                      event.target.value as SkillLevel,
                                      isGrantedProficient
                                    )
                                  }
                                >
                                  {isGrantedProficient ? null : <option value="none">None</option>}
                                  <option value="proficient">Proficient</option>
                                  <option value="expert">Expert</option>
                                </SelectInput>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.skillGroup}>
          <p className={styles.skillGroupTitle}>Proficiencies</p>
          <p className={styles.skillGroupSubtitle}>Innate Proficencies</p>
          {grantedProficiencies.length === 0 ? (
            <p className={shared.emptyText}>None</p>
          ) : (
            <ul className={styles.proficiencyPillGrid}>
              {grantedProficiencies.map((entry) => (
                <li key={`${entry.kind}:${entry.name}`} className={styles.proficiencyPill}>
                  <span>{entry.name}</span>
                  <small>{entry.sources.join(", ")}</small>
                </li>
              ))}
            </ul>
          )}
          <p className={styles.skillGroupSubtitle}>Chosen Proficiences</p>
          {isEditing ? (
            <>
              <p className={shared.helperText}>
                Skill proficiencies are edited in the skill list above. Tools are edited here.
              </p>
              <div className={shared.choiceGrid}>
                {toolProficiencyOptions.map((toolProficiency) => (
                  <label
                    key={toolProficiency}
                    className={clsx(
                      shared.choiceChip,
                      displayedManualToolSet.has(toolProficiency) && shared.choiceChipActive
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={displayedManualToolSet.has(toolProficiency)}
                      onChange={() => onToggleToolProficiency(toolProficiency)}
                    />
                    <span>{resolveToolProficiencyLabel(toolProficiency)}</span>
                  </label>
                ))}
              </div>
            </>
          ) : displayedManualProficiencyLabels.length === 0 ? (
            <p className={shared.emptyText}>None</p>
          ) : (
            <ul className={styles.proficiencyPillGrid}>
              {displayedManualProficiencyLabels.map((proficiency) => (
                <li key={proficiency} className={styles.proficiencyPill}>
                  <span>{proficiency}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isEditing ? (
          <div className={shared.formActions}>
            <button type="button" className={shared.saveButton} onClick={onSave}>
              <Save size={16} />
              Save
            </button>
            <button type="button" className={shared.cancelButton} onClick={onCancel}>
              <X size={16} />
              Cancel
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default SkillsAndProficienciesForm;
