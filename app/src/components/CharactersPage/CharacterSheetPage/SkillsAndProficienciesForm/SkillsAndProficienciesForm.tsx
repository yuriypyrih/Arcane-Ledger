import clsx from "clsx";
import { ChevronsUp, Pencil, Save, X } from "lucide-react";
import { useState } from "react";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import SelectInput from "../../FormInputs/SelectInput";
import type { Character, SkillProficiencyEntry } from "../../../../types";
import { PROF_LEVEL } from "../../../../types";
import { getKeywordDescription } from "../../../../pages/CharactersPage/keywordDescriptions";
import {
  getSkillIndicatorsForCharacter,
  getSkillReferenceDescriptionAdditionsForCharacter,
  getSkillRollD20MinimumForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import type { FeatureIndicator } from "../../../../pages/CharactersPage/classFeatures";
import {
  getDisplayArmorProficiencyEntries,
  getDisplayLanguageProficiencyEntries,
  getDisplaySavingThrowProficiencyEntries,
  getDisplaySkillProficiencyEntries,
  getDisplayToolProficiencyEntries,
  getDisplayWeaponProficiencyEntries,
  getProficiencyKeyword,
  getProficiencyLabel,
  getResolvedSkillProficiencyEntry,
  getSkillProficiencyForName,
  isManualSkillLevelSelectable,
  isWeaponMasteryProficiency,
  upsertManualSkillEntry,
  type ProficiencyDisplayEntry
} from "../../../../pages/CharactersPage/proficiency";
import { getSkillRowsByAbility } from "../../../../pages/CharactersPage/skills";
import type { SkillRow } from "../../../../pages/CharactersPage/skills";
import {
  formatD20Formula,
  formatFormulaCell,
  formatFormulaDieDisplayTerm,
  formatSignedFormulaTerm
} from "../../../../pages/CharactersPage/shared";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { skillColumnLayout } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import RollStatePill from "../../../RollStatePill/RollStatePill";
import {
  getRollModeFromIndicators,
  resolveFeatureIndicators
} from "../../../RollStatePill/rollState";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import ProficiencyEditorModal, { type ProficiencyEditorTab } from "./ProficiencyEditorModal";
import SkillReferenceDrawer, {
  type SelectedSkillReference,
  type SkillReferenceDetailCard
} from "./SkillReferenceDrawer";
import styles from "./SkillsAndProficienciesForm.module.css";

type SkillsAndProficienciesFormProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type ProficiencyCategorySection = {
  title: string;
  entries: ProficiencyDisplayEntry[];
};

function SkillsAndProficienciesForm({
  character,
  className,
  onPersistCharacter
}: SkillsAndProficienciesFormProps) {
  const [isSkillTableEditing, setIsSkillTableEditing] = useState(false);
  const [isProficiencyModalOpen, setIsProficiencyModalOpen] = useState(false);
  const [proficiencyEditorInitialTab, setProficiencyEditorInitialTab] =
    useState<ProficiencyEditorTab>("weapons");
  const [skillProficienciesDraft, setSkillProficienciesDraft] = useState<SkillProficiencyEntry[]>(
    () => character.skillProficiencies
  );
  const [selectedKeyword, setSelectedKeyword] = useState<SelectedSkillReference | null>(null);
  const [isSkillReferenceDiceRollerSettingsOpen, setIsSkillReferenceDiceRollerSettingsOpen] =
    useState(false);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  useBodyScrollLock(
    Boolean(selectedKeyword) || isProficiencyModalOpen || isSkillReferenceDiceRollerSettingsOpen
  );

  const displayedSkillProficiencies = isSkillTableEditing
    ? skillProficienciesDraft
    : character.skillProficiencies;

  const displayedWeaponProficiencyEntries = getDisplayWeaponProficiencyEntries(
    character.weaponProficiencies,
    character.className
  );
  const displayedLanguageProficiencyEntries = getDisplayLanguageProficiencyEntries(
    character.languageProficiencies
  );
  const skillIndicators = getSkillIndicatorsForCharacter(character);
  const skillRowsByAbility = getSkillRowsByAbility(character, displayedSkillProficiencies);
  const skillRowsByAbilityMap = new Map(skillRowsByAbility.map((group) => [group.ability, group]));

  const proficiencyCategorySections: ProficiencyCategorySection[] = [
    {
      title: "Skill Proficiencies",
      entries: getDisplaySkillProficiencyEntries(displayedSkillProficiencies)
    },
    {
      title: "Saving Throws",
      entries: getDisplaySavingThrowProficiencyEntries(character.savingThrowProficiencies)
    },
    {
      title: "Weapon Proficiencies",
      entries: displayedWeaponProficiencyEntries.filter(
        (entry) => !isWeaponMasteryProficiency(entry.proficiency)
      )
    },
    {
      title: "Weapon Masteries",
      entries: displayedWeaponProficiencyEntries.filter((entry) =>
        isWeaponMasteryProficiency(entry.proficiency)
      )
    },
    {
      title: "Armor Proficiencies",
      entries: getDisplayArmorProficiencyEntries(character.armorProficiencies)
    },
    {
      title: "Tool Proficiencies",
      entries: getDisplayToolProficiencyEntries(character.toolProficiencies)
    },
    {
      title: "Languages",
      entries: displayedLanguageProficiencyEntries
    }
  ];

  const visibleProficiencySections = proficiencyCategorySections.filter(
    (section) => section.entries.length > 0
  );

  function formatSkillRollFormula(modifier: number, d20Minimum: number | null): string {
    const d20Term = d20Minimum ? `1d20m${d20Minimum}` : "1d20";

    if (modifier === 0) {
      return d20Term;
    }

    return `${d20Term} ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
  }

  function getSkillFormulaDisplayTerms(row: SkillRow, d20Minimum: number | null = null): string[] {
    const d20Term = formatFormulaDieDisplayTerm(
      "1d20",
      d20Minimum ? [{ kind: "minimum", value: d20Minimum }] : []
    );
    const terms = [d20Term, formatSignedFormulaTerm(row.abilityModifierBase, row.abilityLabel)];

    row.abilityModifierBonusEntries.forEach((entry) => {
      terms.push(formatSignedFormulaTerm(entry.value, entry.label));
    });

    if (row.proficiencyMultiplier === 1) {
      terms.push(formatSignedFormulaTerm(row.proficiencyContribution, "Proficiency Bonus"));
    } else if (row.proficiencyMultiplier === 2) {
      terms.push(formatSignedFormulaTerm(row.proficiencyContribution, "Proficiency Bonus x2"));
    }

    row.bonusEntries.forEach((entry) => {
      terms.push(formatSignedFormulaTerm(entry.value, entry.label));
    });

    return terms;
  }

  function beginSkillTableEditing() {
    setSkillProficienciesDraft(character.skillProficiencies);
    setIsSkillTableEditing(true);
  }

  function cancelSkillTableEditing() {
    setSkillProficienciesDraft(character.skillProficiencies);
    setIsSkillTableEditing(false);
  }

  function saveSkillTableEdits() {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      skillProficiencies: skillProficienciesDraft
    }));

    setIsSkillTableEditing(false);
  }

  function openProficiencyEditor(tab: ProficiencyEditorTab = "weapons") {
    setProficiencyEditorInitialTab(tab);
    setIsProficiencyModalOpen(true);
  }

  function closeSelectedKeyword() {
    setIsSkillReferenceDiceRollerSettingsOpen(false);
    setSelectedKeyword(null);
  }

  function updateSkillLevel(skillName: string, nextLevel: PROF_LEVEL) {
    const skillProficiency = getSkillProficiencyForName(skillName);

    if (!skillProficiency) {
      return;
    }

    setSkillProficienciesDraft((currentProficiencies) =>
      upsertManualSkillEntry(currentProficiencies, skillProficiency, nextLevel)
    );
  }

  function formatReferenceSourceLabel(sourceLabels: string[], fallback: string): string {
    const normalizedLabels = [
      ...new Set(sourceLabels.map((label) => label.trim()).filter(Boolean))
    ];

    return normalizedLabels.length > 0 ? normalizedLabels.join(", ") : fallback;
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

  function openKeywordReference(
    keyword: string,
    indicators?: FeatureIndicator[],
    detailCards?: SkillReferenceDetailCard[],
    rollModifier?: number,
    rollDescription?: string,
    additionalDescription?: SelectedSkillReference["additionalDescription"],
    descriptionAdditions?: SelectedSkillReference["descriptionAdditions"],
    rollFormula?: string,
    rollFormulaDisplay?: string
  ) {
    const description = getKeywordDescription(keyword);

    if (!description) {
      return;
    }

    setIsSkillReferenceDiceRollerSettingsOpen(false);
    setSelectedKeyword({
      name: keyword,
      description,
      indicators: indicators?.length ? indicators : undefined,
      detailCards,
      rollModifier,
      rollDescription,
      additionalDescription,
      descriptionAdditions,
      rollFormula,
      rollFormulaDisplay
    });
  }

  function rollSelectedSkillReference() {
    if (!selectedKeyword || typeof selectedKeyword.rollModifier !== "number") {
      return;
    }

    const rollFormula =
      selectedKeyword.rollFormula ?? formatD20Formula(selectedKeyword.rollModifier);
    const rollFormulaDisplay = selectedKeyword.rollFormulaDisplay ?? rollFormula;

    openDiceRoller({
      title: selectedKeyword.name,
      formula: rollFormula,
      formulaDisplay: rollFormulaDisplay,
      description: selectedKeyword.rollDescription ?? selectedKeyword.description,
      mode: getRollModeFromIndicators(selectedKeyword.indicators)
    });
  }

  function renderProficiencyPills(section: ProficiencyCategorySection) {
    return (
      <div key={section.title} className={styles.skillGroup}>
        <p className={styles.skillGroupSubtitle}>{section.title}</p>
        <ul className={styles.proficiencyPillGrid}>
          {section.entries.map((entry) => {
            const label = getProficiencyLabel(entry.proficiency);
            const keyword = getProficiencyKeyword(entry.proficiency);

            return (
              <li
                key={`${section.title}:${entry.proficiency}:${entry.sourceLabels.join("|")}:${entry.proficiencyLevel}`}
                className={styles.proficiencyPill}
              >
                <button
                  type="button"
                  className={styles.proficiencyPillButton}
                  onClick={() =>
                    openKeywordReference(keyword, undefined, [
                      {
                        label: "Source",
                        value: formatReferenceSourceLabel(entry.sourceLabels, "Manual")
                      }
                    ])
                  }
                >
                  <span>{label}</span>
                  <small>{entry.sourceLabels.join(", ")}</small>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
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
            {!isSkillTableEditing ? (
              <button
                type="button"
                className={shared.editButton}
                disabled={isProficiencyModalOpen}
                onClick={beginSkillTableEditing}
                aria-label="Edit skills"
              >
                <Pencil size={16} />
                Edit
              </button>
            ) : null}
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
                          const skillProficiency = getSkillProficiencyForName(row.name);
                          const resolvedSkillProficiency = skillProficiency
                            ? getResolvedSkillProficiencyEntry(
                                displayedSkillProficiencies,
                                skillProficiency
                              )
                            : null;
                          const currentSkillLevel =
                            resolvedSkillProficiency?.proficiencyLevel ?? PROF_LEVEL.NONE;
                          const skillRollState = resolveFeatureIndicators(
                            skillIndicators[row.name]
                          );
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
                          const skillRollFormula = formatSkillRollFormula(
                            row.totalModifier,
                            reliableTalentD20Minimum
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
                            <li
                              key={row.name}
                              className={clsx(
                                styles.skillRow,
                                isSkillTableEditing && styles.skillRowEditing,
                                row.proficiencyMultiplier === 1 && styles.skillRowProficient,
                                row.proficiencyMultiplier === 2 && styles.skillRowExpert
                              )}
                            >
                              <strong className={styles.skillRowModifier}>
                                {row.totalModifier >= 0
                                  ? `+${row.totalModifier}`
                                  : row.totalModifier}
                              </strong>
                              <div className={styles.skillRowContent}>
                                <button
                                  type="button"
                                  className={styles.skillNameButton}
                                  onClick={() =>
                                    openKeywordReference(
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
                              {isSkillTableEditing ? (
                                <SelectInput
                                  className={styles.skillLevelSelect}
                                  value={currentSkillLevel}
                                  onChange={(event) =>
                                    updateSkillLevel(row.name, event.target.value as PROF_LEVEL)
                                  }
                                >
                                  <option
                                    value={PROF_LEVEL.NONE}
                                    disabled={
                                      skillProficiency
                                        ? !isManualSkillLevelSelectable(
                                            displayedSkillProficiencies,
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
                                            displayedSkillProficiencies,
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
                                            displayedSkillProficiencies,
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
          {isSkillTableEditing ? (
            <div className={shared.formActions}>
              <button type="button" className={shared.saveButton} onClick={saveSkillTableEdits}>
                <Save size={16} />
                Save
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                onClick={cancelSkillTableEditing}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          ) : null}
        </div>

        <div className={styles.skillGroup}>
          <div className={styles.skillGroupHeader}>
            <p className={styles.skillGroupTitle}>Proficiencies</p>
            <button
              type="button"
              className={shared.editButton}
              disabled={isSkillTableEditing || isProficiencyModalOpen}
              onClick={() => openProficiencyEditor("weapons")}
              aria-label="Edit proficiencies"
            >
              <Pencil size={16} />
              Edit
            </button>
          </div>
          {visibleProficiencySections.length === 0 ? (
            <p className={shared.emptyText}>No proficiencies assigned</p>
          ) : (
            visibleProficiencySections.map((section) => renderProficiencyPills(section))
          )}
        </div>
      </div>

      {isProficiencyModalOpen ? (
        <ProficiencyEditorModal
          character={character}
          initialTab={proficiencyEditorInitialTab}
          onClose={() => setIsProficiencyModalOpen(false)}
          onPersistCharacter={onPersistCharacter}
        />
      ) : null}

      {selectedKeyword ? (
        <SkillReferenceDrawer
          reference={selectedKeyword}
          rollAction={
            typeof selectedKeyword.rollModifier === "number"
              ? {
                  onRoll: rollSelectedSkillReference,
                  isDiceRollerSettingsOpen: isSkillReferenceDiceRollerSettingsOpen,
                  onDiceRollerSettingsOpenChange: setIsSkillReferenceDiceRollerSettingsOpen
                }
              : undefined
          }
          onClose={closeSelectedKeyword}
        />
      ) : null}
      {diceRollerPopup}
    </article>
  );
}

export default SkillsAndProficienciesForm;
