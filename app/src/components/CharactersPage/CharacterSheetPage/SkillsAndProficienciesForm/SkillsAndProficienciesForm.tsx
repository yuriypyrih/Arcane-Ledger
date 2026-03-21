import clsx from "clsx";
import { Pencil, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import SelectInput from "../../FormInputs/SelectInput";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import type {
  ArmorProficiencyEntry,
  Character,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../../types";
import {
  ARMOR_PROFICIENCY,
  PROF_LEVEL,
  WEAPON_PROFICIENCY
} from "../../../../types";
import { getKeywordDescription } from "../../../../pages/CharactersPage/keywordDescriptions";
import {
  armorProficiencyOptions,
  getArmorLevelFromEntries,
  getDisplayArmorProficiencyEntries,
  getDisplaySkillLevels,
  getDisplaySkillProficiencyEntries,
  getDisplayToolProficiencyEntries,
  getDisplayWeaponProficiencyEntries,
  getProficiencyKeyword,
  getProficiencyLabel,
  getSkillLevelFromEntries,
  getSkillProficiencyForName,
  getToolLevelFromEntries,
  getWeaponLevelFromEntries,
  setManualArmorEntry,
  setManualToolEntry,
  setManualWeaponEntry,
  skillsOptions,
  toolProficiencyOptions,
  upsertManualSkillEntry,
  weaponProficiencyOptions,
  type ProficiencyDisplayEntry,
  type ToolProficiency
} from "../../../../pages/CharactersPage/proficiency";
import { getSkillRowsByAbility } from "../../../../pages/CharactersPage/skills";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { skillColumnLayout } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./SkillsAndProficienciesForm.module.css";

type SkillsAndProficienciesFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type SelectedKeyword = {
  name: string;
  description: string;
};

type ProficiencyEditorTab = "skills" | "weapons" | "armor" | "tools" | "languages";

type ProficiencyCategorySection = {
  title: string;
  entries: ProficiencyDisplayEntry[];
};

const proficiencyEditorTabs: Array<{ id: ProficiencyEditorTab; label: string }> = [
  { id: "skills", label: "Skills" },
  { id: "weapons", label: "Weapons" },
  { id: "armor", label: "Armor" },
  { id: "tools", label: "Tools" },
  { id: "languages", label: "Languages" }
];

function SkillsAndProficienciesForm({
  className,
  onPersistCharacter
}: SkillsAndProficienciesFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [isSkillTableEditing, setIsSkillTableEditing] = useState(false);
  const [isProficiencyModalOpen, setIsProficiencyModalOpen] = useState(false);
  const [activeProficiencyTab, setActiveProficiencyTab] =
    useState<ProficiencyEditorTab>("weapons");
  const [skillProficienciesDraft, setSkillProficienciesDraft] = useState<SkillProficiencyEntry[]>(
    () => character.skillProficiencies
  );
  const [weaponProficienciesDraft, setWeaponProficienciesDraft] = useState<
    WeaponProficiencyEntry[]
  >(() => character.weaponProficiencies);
  const [armorProficienciesDraft, setArmorProficienciesDraft] = useState<ArmorProficiencyEntry[]>(
    () => character.armorProficiencies
  );
  const [toolProficienciesDraft, setToolProficienciesDraft] = useState<ToolProficiencyEntry[]>(
    () => character.toolProficiencies
  );
  const [selectedKeyword, setSelectedKeyword] = useState<SelectedKeyword | null>(null);

  useBodyScrollLock(Boolean(selectedKeyword) || isProficiencyModalOpen);

  useEffect(() => {
    if (!selectedKeyword && !isProficiencyModalOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (selectedKeyword) {
        setSelectedKeyword(null);
        return;
      }

      if (isProficiencyModalOpen) {
        setSkillProficienciesDraft(character.skillProficiencies);
        setWeaponProficienciesDraft(character.weaponProficiencies);
        setArmorProficienciesDraft(character.armorProficiencies);
        setToolProficienciesDraft(character.toolProficiencies);
        setIsProficiencyModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [character, isProficiencyModalOpen, selectedKeyword]);

  const displayedSkillProficiencies =
    isSkillTableEditing || isProficiencyModalOpen
      ? skillProficienciesDraft
      : character.skillProficiencies;
  const displayedWeaponProficiencies = isProficiencyModalOpen
    ? weaponProficienciesDraft
    : character.weaponProficiencies;
  const displayedArmorProficiencies = isProficiencyModalOpen
    ? armorProficienciesDraft
    : character.armorProficiencies;
  const displayedToolProficiencies = isProficiencyModalOpen
    ? toolProficienciesDraft
    : character.toolProficiencies;

  const displayedSkillLevels = getDisplaySkillLevels(displayedSkillProficiencies);
  const skillRowsByAbility = getSkillRowsByAbility(
    character,
    displayedSkillLevels.proficient,
    displayedSkillLevels.expert
  );
  const skillRowsByAbilityMap = new Map(skillRowsByAbility.map((group) => [group.ability, group]));

  const proficiencyCategorySections: ProficiencyCategorySection[] = [
    {
      title: "Skill Proficiencies",
      entries: getDisplaySkillProficiencyEntries(displayedSkillProficiencies)
    },
    {
      title: "Weapon Proficiencies",
      entries: getDisplayWeaponProficiencyEntries(displayedWeaponProficiencies)
    },
    {
      title: "Armor Proficiencies",
      entries: getDisplayArmorProficiencyEntries(displayedArmorProficiencies)
    },
    {
      title: "Tool Proficiencies",
      entries: getDisplayToolProficiencyEntries(displayedToolProficiencies)
    }
  ];

  const visibleProficiencySections = proficiencyCategorySections.filter(
    (section) => section.entries.length > 0
  );

  function syncProficiencyDraftsFromCharacter() {
    setSkillProficienciesDraft(character.skillProficiencies);
    setWeaponProficienciesDraft(character.weaponProficiencies);
    setArmorProficienciesDraft(character.armorProficiencies);
    setToolProficienciesDraft(character.toolProficiencies);
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
    syncProficiencyDraftsFromCharacter();
    setActiveProficiencyTab(tab);
    setIsProficiencyModalOpen(true);
  }

  function cancelProficiencyEditing() {
    syncProficiencyDraftsFromCharacter();
    setIsProficiencyModalOpen(false);
  }

  function saveProficiencyEditing() {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      skillProficiencies: skillProficienciesDraft,
      weaponProficiencies: weaponProficienciesDraft,
      armorProficiencies: armorProficienciesDraft,
      toolProficiencies: toolProficienciesDraft,
      languageProficiencies: []
    }));

    setIsProficiencyModalOpen(false);
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

  function updateWeaponProficiency(
    proficiency: WEAPON_PROFICIENCY,
    isSelected: boolean
  ) {
    setWeaponProficienciesDraft((currentProficiencies) =>
      setManualWeaponEntry(
        currentProficiencies,
        proficiency,
        isSelected ? PROF_LEVEL.PROFICIENT : PROF_LEVEL.NONE
      )
    );
  }

  function updateArmorProficiency(
    proficiency: ARMOR_PROFICIENCY,
    isSelected: boolean
  ) {
    setArmorProficienciesDraft((currentProficiencies) =>
      setManualArmorEntry(
        currentProficiencies,
        proficiency,
        isSelected ? PROF_LEVEL.PROFICIENT : PROF_LEVEL.NONE
      )
    );
  }

  function updateToolProficiency(proficiency: ToolProficiency, isSelected: boolean) {
    setToolProficienciesDraft((currentProficiencies) =>
      setManualToolEntry(
        currentProficiencies,
        proficiency,
        isSelected ? PROF_LEVEL.PROFICIENT : PROF_LEVEL.NONE
      )
    );
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

  function renderProficiencyPills(
    section: ProficiencyCategorySection
  ) {
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
                  onClick={() => openKeywordReference(keyword)}
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

  function renderToggleEditor<TProficiency extends Parameters<typeof getProficiencyLabel>[0]>(
    options: readonly TProficiency[],
    isSelected: (proficiency: TProficiency) => boolean,
    onToggle: (proficiency: TProficiency, isSelected: boolean) => void
  ) {
    return (
      <div className={styles.editorGrid}>
        {options.map((proficiency) => {
          const label = getProficiencyLabel(proficiency);
          const selected = isSelected(proficiency);

          return (
            <label
              key={proficiency}
              className={clsx(
                styles.editorCard,
                styles.editorToggleCard,
                selected && styles.editorCardActive
              )}
              onClick={(event) => {
                event.preventDefault();
                onToggle(proficiency, !selected);
              }}
            >
              <span className={styles.editorLabel}>{label}</span>
              <span className={styles.editorCheckboxRow}>
                <input
                  type="checkbox"
                  checked={selected}
                  readOnly
                  tabIndex={-1}
                  className={styles.editorCheckbox}
                  aria-hidden="true"
                />
                <span className={styles.editorState}>
                  {selected ? "Included" : "Not included"}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    );
  }

  function renderSkillEditor() {
    return (
      <div className={styles.editorGrid}>
        {skillsOptions.map((skillName) => {
          const proficiency = getSkillProficiencyForName(skillName);

          if (!proficiency) {
            return null;
          }

          const currentSkillLevel = getSkillLevelFromEntries(skillProficienciesDraft, proficiency);

          return (
            <div key={skillName} className={styles.editorCard}>
              <span className={styles.editorLabel}>{skillName}</span>
              <SelectInput
                className={styles.editorSelect}
                value={currentSkillLevel}
                onChange={(event) =>
                  updateSkillLevel(skillName, event.target.value as PROF_LEVEL)
                }
              >
                <option value={PROF_LEVEL.NONE}>None</option>
                <option value={PROF_LEVEL.PROFICIENT}>Proficient</option>
                <option value={PROF_LEVEL.EXPERT}>Expert</option>
              </SelectInput>
            </div>
          );
        })}
      </div>
    );
  }

  function renderProficiencyEditorContent() {
    switch (activeProficiencyTab) {
      case "skills":
        return renderSkillEditor();
      case "weapons":
        return renderToggleEditor(
          weaponProficiencyOptions,
          (proficiency) =>
            getWeaponLevelFromEntries(weaponProficienciesDraft, proficiency) !== PROF_LEVEL.NONE,
          updateWeaponProficiency
        );
      case "armor":
        return renderToggleEditor(
          armorProficiencyOptions,
          (proficiency) =>
            getArmorLevelFromEntries(armorProficienciesDraft, proficiency) !== PROF_LEVEL.NONE,
          updateArmorProficiency
        );
      case "tools":
        return renderToggleEditor(
          toolProficiencyOptions,
          (proficiency) =>
            getToolLevelFromEntries(toolProficienciesDraft, proficiency) !== PROF_LEVEL.NONE,
          updateToolProficiency
        );
      case "languages":
        return <p className={shared.emptyText}>Empty</p>;
      default:
        return null;
    }
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
                          const currentSkillLevel = skillProficiency
                            ? getSkillLevelFromEntries(displayedSkillProficiencies, skillProficiency)
                            : PROF_LEVEL.NONE;

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
                                {row.totalModifier >= 0 ? `+${row.totalModifier}` : row.totalModifier}
                              </strong>
                              <button
                                type="button"
                                className={styles.skillNameButton}
                                onClick={() => openKeywordReference(row.name)}
                              >
                                {row.name}
                              </button>
                              {isSkillTableEditing ? (
                                <SelectInput
                                  className={styles.skillLevelSelect}
                                  value={currentSkillLevel}
                                  onChange={(event) =>
                                    updateSkillLevel(row.name, event.target.value as PROF_LEVEL)
                                  }
                                >
                                  <option value={PROF_LEVEL.NONE}>None</option>
                                  <option value={PROF_LEVEL.PROFICIENT}>Proficient</option>
                                  <option value={PROF_LEVEL.EXPERT}>Expert</option>
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
              <button
                type="button"
                className={shared.saveButton}
                onClick={saveSkillTableEdits}
              >
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
        <div
          className={sheetStyles.spellManagementBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            cancelProficiencyEditing();
          }}
        >
          <section
            className={clsx(sheetStyles.spellManagementModal, styles.proficiencyEditorModal)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-proficiency-editor-title"
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellManagementHeader}>
              <div className={styles.modalHeading}>
                <h3 id="character-proficiency-editor-title">Edit Proficiencies</h3>
                <p className={shared.helperText}>
                  Changes here are stored as manual overrides when you save.
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={cancelProficiencyEditing}
                aria-label="Close proficiency editor"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.tabRow} role="tablist" aria-label="Proficiency categories">
              {proficiencyEditorTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeProficiencyTab === tab.id}
                  className={clsx(
                    styles.tabButton,
                    activeProficiencyTab === tab.id && styles.tabButtonActive
                  )}
                  onClick={() => setActiveProficiencyTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={styles.editorScrollArea}>{renderProficiencyEditorContent()}</div>

            <div className={shared.formActions}>
              <button
                type="button"
                className={shared.saveButton}
                onClick={saveProficiencyEditing}
              >
                <Save size={16} />
                Save
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                onClick={cancelProficiencyEditing}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </section>
        </div>
      ) : null}

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
