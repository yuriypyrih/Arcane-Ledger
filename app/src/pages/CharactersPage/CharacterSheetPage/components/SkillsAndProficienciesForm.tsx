import clsx from "clsx";
import { Pencil, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import SelectInput from "../../../../components/CharactersPage/FormInputs/SelectInput";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { loadPreferences, updatePreferences } from "../../../../storage/preferences";
import type { Character, SkillName } from "../../../../types";
import { getKeywordDescription } from "../../keywordDescriptions";
import {
  getGrantedProficienciesForCharacter,
  getGrantedSkillProficienciesForCharacter,
  getToolProficiencyLabel,
  normalizeManualSkillSelections,
  normalizeSkillExpertiseSelectionsForCharacter,
  normalizeToolProficiencySelections,
  toolProficiencyOptions,
  type ToolProficiency
} from "../../proficiency";
import { getSkillRowsByAbility } from "../../skills";
import type { PersistCharacterUpdater, SkillLevel } from "../types";
import { skillColumnLayout } from "../utils";
import sheetStyles from "../CharacterSheetPage.module.css";
import shared from "./CharacterSheetSectionShared.module.css";
import InlineToggleButton from "./InlineToggleButton";
import styles from "./SkillsAndProficienciesForm.module.css";

type SkillsAndProficienciesFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type SelectedKeyword = {
  name: string;
  description: string;
};

function getSkillLevelForSkill(
  skill: SkillName,
  isGrantedProficient: boolean,
  manualSkillSet: Set<SkillName>,
  expertiseSkillSet: Set<SkillName>
): SkillLevel {
  if (expertiseSkillSet.has(skill)) {
    return "expert";
  }

  if (isGrantedProficient || manualSkillSet.has(skill)) {
    return "proficient";
  }

  return "none";
}

function SkillsAndProficienciesForm({ className, onPersistCharacter }: SkillsAndProficienciesFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [isEditing, setIsEditing] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState<SkillName[]>(() => character.skills ?? []);
  const [skillExpertiseDraft, setSkillExpertiseDraft] = useState<SkillName[]>(
    () => character.skillExpertise ?? []
  );
  const [toolProficienciesDraft, setToolProficienciesDraft] = useState<ToolProficiency[]>(
    () => normalizeToolProficiencySelections(character.toolProficiencies ?? [])
  );
  const [isProficienciesVisible, setIsProficienciesVisible] = useState(
    () => loadPreferences().skillsProficienciesVisible
  );
  const [selectedKeyword, setSelectedKeyword] = useState<SelectedKeyword | null>(null);

  useBodyScrollLock(Boolean(selectedKeyword));

  useEffect(() => {
    if (!selectedKeyword) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedKeyword(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedKeyword]);

  const grantedProficiencies = getGrantedProficienciesForCharacter(
    character.className,
    character.species,
    character.background
  );
  const grantedSkillProficiencies = getGrantedSkillProficienciesForCharacter(
    character.className,
    character.species,
    character.background
  );
  const grantedSkillSet = new Set(grantedSkillProficiencies.map((entry) => entry.skill));
  const normalizedManualSkills = normalizeManualSkillSelections(character.skills);
  const normalizedManualSkillsDraft = normalizeManualSkillSelections(skillsDraft);
  const normalizedSkillExpertise = normalizeSkillExpertiseSelectionsForCharacter(
    character.className,
    character.species,
    character.background,
    normalizedManualSkills,
    character.skillExpertise ?? []
  );
  const normalizedSkillExpertiseDraft = normalizeSkillExpertiseSelectionsForCharacter(
    character.className,
    character.species,
    character.background,
    normalizedManualSkillsDraft,
    skillExpertiseDraft
  );
  const normalizedManualToolProficiencies = normalizeToolProficiencySelections(
    character.toolProficiencies ?? []
  );
  const normalizedManualToolProficienciesDraft = normalizeToolProficiencySelections(
    toolProficienciesDraft
  );

  const displayedManualSkills = isEditing ? normalizedManualSkillsDraft : normalizedManualSkills;
  const displayedSkillExpertise = isEditing ? normalizedSkillExpertiseDraft : normalizedSkillExpertise;
  const displayedManualToolProficiencies = isEditing
    ? normalizedManualToolProficienciesDraft
    : normalizedManualToolProficiencies;
  const displayedProficientSkills = [...new Set([...grantedSkillSet, ...displayedManualSkills])];
  const skillRowsByAbility = getSkillRowsByAbility(
    character,
    displayedProficientSkills,
    displayedSkillExpertise
  );
  const skillRowsByAbilityMap = new Map(skillRowsByAbility.map((group) => [group.ability, group]));

  const displayedManualSkillSet = useMemo(
    () => new Set<SkillName>(displayedManualSkills),
    [displayedManualSkills]
  );
  const displayedSkillExpertiseSet = useMemo(
    () => new Set<SkillName>(displayedSkillExpertise),
    [displayedSkillExpertise]
  );
  const displayedManualToolSet = useMemo(
    () => new Set<ToolProficiency>(displayedManualToolProficiencies),
    [displayedManualToolProficiencies]
  );
  const displayedManualProficiencyLabels = [
    ...displayedManualSkills,
    ...displayedManualToolProficiencies.map((toolProficiency) => getToolProficiencyLabel(toolProficiency))
  ];
  const areProficienciesVisible = isEditing || isProficienciesVisible;

  function beginEditing() {
    setSkillsDraft(character.skills ?? []);
    setSkillExpertiseDraft(character.skillExpertise ?? []);
    setToolProficienciesDraft(normalizeToolProficiencySelections(character.toolProficiencies ?? []));
    setIsEditing(true);
  }

  function cancelEditing() {
    setSkillsDraft(character.skills ?? []);
    setSkillExpertiseDraft(character.skillExpertise ?? []);
    setToolProficienciesDraft(normalizeToolProficiencySelections(character.toolProficiencies ?? []));
    setIsEditing(false);
  }

  function saveSkillsAndProficiencies() {
    const normalizedManualSkillsToSave = normalizeManualSkillSelections(skillsDraft);
    const normalizedToolProficienciesToSave = normalizeToolProficiencySelections(toolProficienciesDraft);
    const normalizedSkillExpertiseToSave = normalizeSkillExpertiseSelectionsForCharacter(
      character.className,
      character.species,
      character.background,
      normalizedManualSkillsToSave,
      skillExpertiseDraft
    );

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      skills: normalizedManualSkillsToSave,
      skillExpertise: normalizeSkillExpertiseSelectionsForCharacter(
        currentCharacter.className,
        currentCharacter.species,
        currentCharacter.background,
        normalizedManualSkillsToSave,
        normalizedSkillExpertiseToSave
      ),
      toolProficiencies: normalizedToolProficienciesToSave
    }));

    setIsEditing(false);
  }

  function updateSkillLevel(skill: SkillName, nextLevel: SkillLevel, isGrantedProficient: boolean) {
    setSkillsDraft((currentSkills) => {
      const nextManualSkillSet = new Set<SkillName>(normalizeManualSkillSelections(currentSkills));

      if (nextLevel === "none" || isGrantedProficient) {
        nextManualSkillSet.delete(skill);
      } else {
        nextManualSkillSet.add(skill);
      }

      const nextManualSkills = normalizeManualSkillSelections([...nextManualSkillSet]);

      setSkillExpertiseDraft((currentExpertise) => {
        const normalizedCurrentExpertise = normalizeSkillExpertiseSelectionsForCharacter(
          character.className,
          character.species,
          character.background,
          nextManualSkills,
          currentExpertise
        );
        const nextExpertiseSet = new Set<SkillName>(normalizedCurrentExpertise);

        if (nextLevel === "expert") {
          nextExpertiseSet.add(skill);
        } else {
          nextExpertiseSet.delete(skill);
        }

        return normalizeSkillExpertiseSelectionsForCharacter(
          character.className,
          character.species,
          character.background,
          nextManualSkills,
          [...nextExpertiseSet]
        );
      });

      return nextManualSkills;
    });
  }

  function toggleToolProficiency(toolProficiency: ToolProficiency) {
    setToolProficienciesDraft((currentToolProficiencies) => {
      const nextToolSet = new Set(normalizeToolProficiencySelections(currentToolProficiencies));

      if (nextToolSet.has(toolProficiency)) {
        nextToolSet.delete(toolProficiency);
      } else {
        nextToolSet.add(toolProficiency);
      }

      return normalizeToolProficiencySelections([...nextToolSet]);
    });
  }

  function openKeywordReference(keyword: string) {
    const description = getKeywordDescription(keyword);

    if (!description) {
      return;
    }

    setSelectedKeyword({
      name: keyword,
      description
    });
  }

  function toggleProficienciesVisibility() {
    if (isEditing) {
      return;
    }

    const nextVisibility = !isProficienciesVisible;
    setIsProficienciesVisible(nextVisibility);
    updatePreferences({ skillsProficienciesVisible: nextVisibility });
  }

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
              <button type="button" className={shared.editButton} onClick={beginEditing}>
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
                              <strong className={styles.skillRowModifier}>
                                {row.totalModifier >= 0 ? `+${row.totalModifier}` : row.totalModifier}
                              </strong>
                              <button
                                type="button"
                                className={styles.skillNameButton}
                                onClick={() => openKeywordReference(row.name)}
                              >
                                {row.name}
                              </button>
                              {isEditing ? (
                                <SelectInput
                                  className={styles.skillLevelSelect}
                                  value={currentSkillLevel}
                                  onChange={(event) =>
                                    updateSkillLevel(
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
          <InlineToggleButton
            label={areProficienciesVisible ? "Hide Proficiencies" : "Show Proficiencies"}
            expanded={areProficienciesVisible}
            disabled={isEditing}
            onClick={toggleProficienciesVisibility}
          />
          {areProficienciesVisible ? (
            <>
              <p className={styles.skillGroupSubtitle}>Granted Proficiencies</p>
              {grantedProficiencies.length === 0 ? (
                <p className={shared.emptyText}>None</p>
              ) : (
                <ul className={styles.proficiencyPillGrid}>
                  {grantedProficiencies.map((entry) => (
                    <li key={`${entry.kind}:${entry.name}`} className={styles.proficiencyPill}>
                      <button
                        type="button"
                        className={styles.proficiencyPillButton}
                        onClick={() => openKeywordReference(entry.name)}
                      >
                        <span>{entry.name}</span>
                        <small>{entry.sources.join(", ")}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className={styles.skillGroupSubtitle}>Chosen Proficiencies</p>
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
                          onChange={() => toggleToolProficiency(toolProficiency)}
                        />
                        <span>{getToolProficiencyLabel(toolProficiency)}</span>
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
                      <button
                        type="button"
                        className={styles.proficiencyPillButton}
                        onClick={() => openKeywordReference(proficiency)}
                      >
                        <span>{proficiency}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : null}
        </div>

        {isEditing ? (
          <div className={shared.formActions}>
            <button type="button" className={shared.saveButton} onClick={saveSkillsAndProficiencies}>
              <Save size={16} />
              Save
            </button>
            <button type="button" className={shared.cancelButton} onClick={cancelEditing}>
              <X size={16} />
              Cancel
            </button>
          </div>
        ) : null}
      </div>

      {selectedKeyword ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={() => setSelectedKeyword(null)}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-skill-reference-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Reference</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="character-skill-reference-title">{selectedKeyword.name}</h3>
                </div>
                <p className={sheetStyles.spellDrawerSummary}>{selectedKeyword.description}</p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedKeyword(null)}
                aria-label="Close skill details"
              >
                <X size={18} />
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </article>
  );
}

export default SkillsAndProficienciesForm;
