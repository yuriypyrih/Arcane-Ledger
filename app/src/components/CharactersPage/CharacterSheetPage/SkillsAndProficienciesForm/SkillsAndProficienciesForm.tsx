import clsx from "clsx";
import { Pencil, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import SelectInput from "../../FormInputs/SelectInput";
import TextInput from "../../FormInputs/TextInput";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import type {
  ArmorProficiencyEntry,
  Character,
  LanguageProficiency,
  LanguageProficiencyEntry,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../../types";
import {
  ARMOR_PROFICIENCY,
  exoticLanguageEntries,
  LANGUAGE_PROFICIENCY,
  PROF_LEVEL,
  standardLanguageEntries,
  WEAPON_PROFICIENCY
} from "../../../../types";
import { getKeywordDescription } from "../../../../pages/CharactersPage/keywordDescriptions";
import { getSkillIndicatorsForCharacter } from "../../../../pages/CharactersPage/classFeatures";
import type { FeatureIndicator } from "../../../../pages/CharactersPage/classFeatures";
import {
  armorProficiencyOptions,
  getArmorLevelFromEntries,
  getDisplayArmorProficiencyEntries,
  getDisplayLanguageProficiencyEntries,
  getDisplaySkillProficiencyEntries,
  getDisplayToolProficiencyEntries,
  getDisplayWeaponProficiencyEntries,
  getLanguageLevelFromEntries,
  getProficiencyKeyword,
  getProficiencyLabel,
  getResolvedSkillProficiencyEntry,
  getSkillLevelFromEntries,
  getSkillProficiencyForName,
  hasLockedSkillEntry,
  hasLockedWeaponEntry,
  isCustomLanguageProficiency,
  addManualCustomLanguageEntry,
  getToolLevelFromEntries,
  getWeaponProficiencyOptionsForClass,
  getWeaponProficiencyTypeLabel,
  getWeaponLevelFromEntries,
  isWeaponMasteryProficiency,
  setManualArmorEntry,
  setManualLanguageEntry,
  setManualToolEntry,
  setManualWeaponEntry,
  skillsOptions,
  toolProficiencyOptions,
  upsertManualSkillEntry,
  type ProficiencyDisplayEntry,
  type ToolProficiency
} from "../../../../pages/CharactersPage/proficiency";
import { getSkillRowsByAbility } from "../../../../pages/CharactersPage/skills";
import type { SkillRow } from "../../../../pages/CharactersPage/skills";
import { formatAbilityModifier } from "../../../../pages/CharactersPage/gameplay";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { skillColumnLayout } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import RollStatePill from "../../../RollStatePill/RollStatePill";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./SkillsAndProficienciesForm.module.css";

type SkillsAndProficienciesFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type SelectedKeyword = {
  name: string;
  description: string;
  indicators?: FeatureIndicator[];
  detailCards?: Array<{
    label: string;
    value: string;
  }>;
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
  const [languageProficienciesDraft, setLanguageProficienciesDraft] = useState<
    LanguageProficiencyEntry[]
  >(() => character.languageProficiencies);
  const [customLanguageNameDraft, setCustomLanguageNameDraft] = useState("");
  const [customLanguageDescriptionDraft, setCustomLanguageDescriptionDraft] = useState("");
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
        setLanguageProficienciesDraft(character.languageProficiencies);
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
  const displayedLanguageProficiencies = isProficiencyModalOpen
    ? languageProficienciesDraft
    : character.languageProficiencies;

  const displayedWeaponProficiencyEntries = getDisplayWeaponProficiencyEntries(
    displayedWeaponProficiencies,
    className
  );
  const displayedLanguageProficiencyEntries = getDisplayLanguageProficiencyEntries(
    displayedLanguageProficiencies
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
      entries: getDisplayArmorProficiencyEntries(displayedArmorProficiencies)
    },
    {
      title: "Tool Proficiencies",
      entries: getDisplayToolProficiencyEntries(displayedToolProficiencies)
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
    const terms = [`${formatAbilityModifier(row.abilityModifier)} ${row.ability}`];

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

  function syncProficiencyDraftsFromCharacter() {
    setSkillProficienciesDraft(character.skillProficiencies);
    setWeaponProficienciesDraft(character.weaponProficiencies);
    setArmorProficienciesDraft(character.armorProficiencies);
    setToolProficienciesDraft(character.toolProficiencies);
    setLanguageProficienciesDraft(character.languageProficiencies);
    setCustomLanguageNameDraft("");
    setCustomLanguageDescriptionDraft("");
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
      languageProficiencies: languageProficienciesDraft
    }));

    setIsProficiencyModalOpen(false);
  }

  function updateSkillLevel(skillName: string, nextLevel: PROF_LEVEL) {
    const skillProficiency = getSkillProficiencyForName(skillName);

    if (!skillProficiency) {
      return;
    }

    if (hasLockedSkillEntry(skillProficienciesDraft, skillProficiency)) {
      return;
    }

    setSkillProficienciesDraft((currentProficiencies) =>
      upsertManualSkillEntry(currentProficiencies, skillProficiency, nextLevel)
    );
  }

  function updateSkillProficiency(skillName: string, isSelected: boolean) {
    updateSkillLevel(
      skillName,
      isSelected ? PROF_LEVEL.PROFICIENT : PROF_LEVEL.NONE
    );
  }

  function updateWeaponProficiency(
    proficiency: WEAPON_PROFICIENCY,
    isSelected: boolean
  ) {
    if (hasLockedWeaponEntry(weaponProficienciesDraft, proficiency)) {
      return;
    }

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

  function updateLanguageProficiency(proficiency: LANGUAGE_PROFICIENCY, isSelected: boolean) {
    setLanguageProficienciesDraft((currentProficiencies) =>
      setManualLanguageEntry(
        currentProficiencies,
        proficiency,
        isSelected ? PROF_LEVEL.PROFICIENT : PROF_LEVEL.NONE
      )
    );
  }

  function addCustomLanguage() {
    const normalizedName = customLanguageNameDraft.trim();

    if (!normalizedName) {
      return;
    }

    setLanguageProficienciesDraft((currentProficiencies) =>
      addManualCustomLanguageEntry(
        currentProficiencies,
        normalizedName,
        customLanguageDescriptionDraft.trim()
      )
    );
    setCustomLanguageNameDraft("");
    setCustomLanguageDescriptionDraft("");
  }

  function removeLanguage(proficiency: LanguageProficiency) {
    setLanguageProficienciesDraft((currentProficiencies) =>
      setManualLanguageEntry(currentProficiencies, proficiency, PROF_LEVEL.NONE)
    );
  }

  function openKeywordReference(
    keyword: string,
    indicators?: FeatureIndicator[],
    detailCards?: Array<{ label: string; value: string }>
  ) {
    const description = getKeywordDescription(keyword);

    if (!description) {
      return;
    }

    setSelectedKeyword({
      name: keyword,
      description,
      indicators: indicators?.length ? indicators : undefined,
      detailCards
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

  function renderToggleEditor<TOption extends string>(
    options: readonly TOption[],
    isSelected: (option: TOption) => boolean,
    onToggle: (option: TOption, isSelected: boolean) => void,
    optionsConfig?: {
      compact?: boolean;
      getLabel?: (option: TOption) => string;
      renderMeta?: (option: TOption) => string | null;
      isDisabled?: (option: TOption) => boolean;
    }
  ) {
    return (
      <div
        className={clsx(
          styles.editorGrid,
          optionsConfig?.compact && styles.editorGridCompact
        )}
      >
        {options.map((option) => {
          const label =
            optionsConfig?.getLabel?.(option) ??
            getProficiencyLabel(option as Parameters<typeof getProficiencyLabel>[0]);
          const meta = optionsConfig?.renderMeta?.(option) ?? null;
          const selected = isSelected(option);
          const disabled = optionsConfig?.isDisabled?.(option) ?? false;

          return (
            <label
              key={option}
              className={clsx(
                styles.editorCard,
                optionsConfig?.compact && styles.editorCardCompact,
                styles.editorToggleCard,
                selected && styles.editorCardActive,
                disabled && styles.editorToggleCardDisabled
              )}
              onClick={(event) => {
                event.preventDefault();
                if (disabled) {
                  return;
                }
                onToggle(option, !selected);
              }}
            >
              <span className={styles.editorLabelRow}>
                <span className={styles.editorLabel}>{label}</span>
                {meta ? <span className={styles.editorMeta}>{meta}</span> : null}
              </span>
              <span className={styles.editorCheckboxRow}>
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={disabled}
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
    return renderToggleEditor(
      skillsOptions,
      (skillName) => {
        const proficiency = getSkillProficiencyForName(skillName);

        return proficiency
          ? getSkillLevelFromEntries(skillProficienciesDraft, proficiency) !== PROF_LEVEL.NONE
          : false;
      },
      updateSkillProficiency,
      {
        getLabel: (skillName) => skillName,
        isDisabled: (skillName) => {
          const proficiency = getSkillProficiencyForName(skillName);

          return proficiency ? hasLockedSkillEntry(skillProficienciesDraft, proficiency) : false;
        }
      }
    );
  }

  function renderLanguageToggleEditor(options: readonly LANGUAGE_PROFICIENCY[]) {
    return renderToggleEditor(
      options,
      (proficiency) =>
        getLanguageLevelFromEntries(languageProficienciesDraft, proficiency) !== PROF_LEVEL.NONE,
      updateLanguageProficiency
    );
  }

  function renderLanguageEditor() {
    const customLanguageEntries = displayedLanguageProficiencyEntries.filter((entry) =>
      isCustomLanguageProficiency(entry.proficiency)
    );

    return (
      <div className={styles.languageEditorStack}>
        <div className={styles.languageEditorGroup}>
          <p className={styles.skillGroupSubtitle}>Standard Languages</p>
          {renderLanguageToggleEditor(standardLanguageEntries.map((entry) => entry.proficiency))}
        </div>
        <div className={styles.languageEditorGroup}>
          <p className={styles.skillGroupSubtitle}>Exotic Languages</p>
          {renderLanguageToggleEditor(exoticLanguageEntries.map((entry) => entry.proficiency))}
        </div>
        <div className={styles.languageEditorGroup}>
          <p className={styles.skillGroupSubtitle}>Custom Language</p>
          <div className={styles.customLanguageForm}>
            <TextInput
              value={customLanguageNameDraft}
              onChange={(event) => setCustomLanguageNameDraft(event.target.value)}
              placeholder="Language name"
            />
            <TextInput
              value={customLanguageDescriptionDraft}
              onChange={(event) => setCustomLanguageDescriptionDraft(event.target.value)}
              placeholder="Optional description"
            />
            <button
              type="button"
              className={shared.editButton}
              onClick={addCustomLanguage}
              disabled={customLanguageNameDraft.trim().length === 0}
            >
              Add language
            </button>
          </div>
          {customLanguageEntries.length > 0 ? (
            <ul className={styles.customLanguageList}>
              {customLanguageEntries.map((entry) => {
                const matchingDraftEntry = languageProficienciesDraft.find(
                  (draftEntry) => draftEntry.proficiency === entry.proficiency
                );

                return (
                  <li key={String(entry.proficiency)} className={styles.customLanguageItem}>
                    <div className={styles.customLanguageContent}>
                      <strong>{getProficiencyLabel(entry.proficiency)}</strong>
                      {matchingDraftEntry?.customDescription ? (
                        <small>{matchingDraftEntry.customDescription}</small>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className={styles.customLanguageRemoveButton}
                      onClick={() => removeLanguage(entry.proficiency)}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    );
  }

  function renderWeaponEditor() {
    const availableWeaponProficiencyOptions = getWeaponProficiencyOptionsForClass(className);
    const broadWeaponOptions = availableWeaponProficiencyOptions.filter(
      (proficiency) => !isWeaponMasteryProficiency(proficiency)
    );
    const masteryWeaponOptions = availableWeaponProficiencyOptions.filter((proficiency) =>
      isWeaponMasteryProficiency(proficiency)
    );
    const isWeaponSelected = (proficiency: WEAPON_PROFICIENCY) =>
      getWeaponLevelFromEntries(weaponProficienciesDraft, proficiency) !== PROF_LEVEL.NONE;
    const isWeaponDisabled = (proficiency: WEAPON_PROFICIENCY) =>
      hasLockedWeaponEntry(weaponProficienciesDraft, proficiency);

    return (
      <div className={styles.editorSectionStack}>
        {renderToggleEditor(
          broadWeaponOptions,
          isWeaponSelected,
          updateWeaponProficiency,
          {
            compact: true,
            renderMeta: getWeaponProficiencyTypeLabel,
            isDisabled: isWeaponDisabled
          }
        )}
        <div className={styles.editorDivider} role="presentation">
          <span className={styles.editorDividerLine} />
          <span className={styles.editorDividerLabel}>Weapon masteries</span>
          <span className={styles.editorDividerLine} />
        </div>
        {renderToggleEditor(
          masteryWeaponOptions,
          isWeaponSelected,
          updateWeaponProficiency,
          {
            compact: true,
            renderMeta: getWeaponProficiencyTypeLabel,
            isDisabled: isWeaponDisabled
          }
        )}
      </div>
    );
  }

  function renderProficiencyEditorContent() {
    switch (activeProficiencyTab) {
      case "skills":
        return renderSkillEditor();
      case "weapons":
        return renderWeaponEditor();
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
        return renderLanguageEditor();
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
                          const resolvedSkillProficiency = skillProficiency
                            ? getResolvedSkillProficiencyEntry(
                                displayedSkillProficiencies,
                                skillProficiency
                              )
                            : null;
                          const currentSkillLevel =
                            resolvedSkillProficiency?.proficiencyLevel ?? PROF_LEVEL.NONE;
                          const skillDetailCards = [
                            {
                              label: "Formula",
                              value: formatSkillFormula(row)
                            },
                            ...(row.proficiencySourceLabels.length > 0
                              ? [
                                  {
                                    label: "Source",
                                    value: row.proficiencySourceLabels.join(", ")
                                  },
                                  {
                                    label: "Override",
                                    value: row.proficiencyLocked ? "Enforced" : "Overridable"
                                  }
                                ]
                              : [])
                          ];

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
                              <div className={styles.skillRowContent}>
                                <button
                                  type="button"
                                  className={styles.skillNameButton}
                                  onClick={() =>
                                    openKeywordReference(
                                      row.name,
                                      skillIndicators[row.name],
                                      skillDetailCards
                                    )
                                  }
                                >
                                  {row.name}
                                </button>
                                {(skillIndicators[row.name]?.length ?? 0) > 0 ? (
                                  <span className={styles.skillIndicators}>
                                    {skillIndicators[row.name]?.map((indicator) => (
                                      <RollStatePill
                                        key={`${row.name}-${indicator.label}-${indicator.tone}`}
                                        tone={indicator.tone}
                                        label={indicator.label}
                                      />
                                    ))}
                                  </span>
                                ) : null}
                              </div>
                              {isSkillTableEditing ? (
                                <SelectInput
                                  className={styles.skillLevelSelect}
                                  value={currentSkillLevel}
                                  disabled={row.proficiencyLocked}
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
            <div className={clsx(sheetStyles.spellDrawerHeader, styles.referenceDrawerHeader)}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Reference</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="character-skill-reference-title">{selectedKeyword.name}</h3>
                </div>
                <p className={sheetStyles.spellDrawerSummary}>{selectedKeyword.description}</p>
              </div>
              {selectedKeyword.indicators?.length ? (
                <div className={styles.referenceIndicatorStack}>
                  {selectedKeyword.indicators.map((indicator, index) => (
                    <RollStatePill
                      key={`${selectedKeyword.name}-${indicator.label}-${indicator.tone}-${indicator.source}-${index}`}
                      tone={indicator.tone}
                      label={indicator.label}
                      detailText={`From ${indicator.source}`}
                    />
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedKeyword(null)}
                aria-label="Close skill details"
              >
                <X size={18} />
              </button>
            </div>
            {selectedKeyword.detailCards?.length ? (
              <div className={sheetStyles.spellDrawerBody}>
                <div className={sheetStyles.spellDrawerDetails}>
                  {selectedKeyword.detailCards.map((detailCard) => (
                    <div
                      key={`${selectedKeyword.name}-${detailCard.label}`}
                      className={sheetStyles.spellDrawerDetailCard}
                    >
                      <span>{detailCard.label}</span>
                      <strong>{detailCard.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </article>
  );
}

export default SkillsAndProficienciesForm;
