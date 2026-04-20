import clsx from "clsx";
import { ChevronsUp, Pencil, Save, X } from "lucide-react";
import { useState } from "react";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import SelectInput from "../../FormInputs/SelectInput";
import type { Character, SkillProficiencyEntry } from "../../../../types";
import { PROF_LEVEL } from "../../../../types";
import { getKeywordDescription } from "../../../../pages/CharactersPage/keywordDescriptions";
import { getSkillIndicatorsForCharacter } from "../../../../pages/CharactersPage/classFeatures";
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
import { formatAbilityModifier } from "../../../../pages/CharactersPage/gameplay";
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

  function formatSkillFormula(row: SkillRow): string {
    const terms = [`${formatAbilityModifier(row.abilityModifier)} ${row.abilityLabel}`];

    if (row.proficiencyMultiplier === 1) {
      terms.push(`${formatAbilityModifier(row.proficiencyContribution)} Proficiency Bonus`);
    } else if (row.proficiencyMultiplier === 2) {
      terms.push(`${formatAbilityModifier(row.proficiencyContribution)} Proficiency Bonus x2`);
    }

    row.bonusEntries.forEach((entry) => {
      terms.push(`${formatAbilityModifier(entry.value)} ${entry.label}`);
    });

    return `${row.name} ${formatAbilityModifier(row.totalModifier)} = ${terms.join(" ")}`;
  }

  function formatD20Formula(modifier: number): string {
    if (modifier === 0) {
      return "1d20";
    }

    return `1d20 ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
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

  function getSkillReferenceDetailCards(row: SkillRow): SkillReferenceDetailCard[] {
    return [
      {
        label: "Source",
        value: formatReferenceSourceLabel(
          [...row.proficiencySourceLabels, ...row.bonusEntries.map((entry) => entry.label)],
          "Ability modifier only"
        )
      },
      {
        label: "Formula",
        value: formatSkillFormula(row)
      }
    ];
  }

  function openKeywordReference(
    keyword: string,
    indicators?: FeatureIndicator[],
    detailCards?: SkillReferenceDetailCard[],
    rollModifier?: number,
    rollDescription?: string
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
      rollDescription
    });
  }

  function rollSelectedSkillReference() {
    if (!selectedKeyword || typeof selectedKeyword.rollModifier !== "number") {
      return;
    }

    const rollFormula = formatD20Formula(selectedKeyword.rollModifier);

    openDiceRoller({
      title: selectedKeyword.name,
      formula: rollFormula,
      formulaDisplay: rollFormula,
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
                          const hasAdditionalBonuses = row.bonusEntries.length > 0;
                          const skillDetailCards = getSkillReferenceDetailCards(row);

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
                                      formatSkillFormula(row)
                                    )
                                  }
                                >
                                  <span className={styles.skillNameContent}>
                                    <span>{row.name}</span>
                                    {hasAdditionalBonuses ? (
                                      <span
                                        title={row.bonusEntries
                                          .map((entry) => entry.label)
                                          .join(", ")}
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
