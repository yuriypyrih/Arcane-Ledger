import clsx from "clsx";
import { useState } from "react";
import type { Character, LanguageProficiency } from "../../../../types";
import {
  ARMOR_PROFICIENCY,
  exoticLanguageEntries,
  LANGUAGE_PROFICIENCY,
  PROF_LEVEL,
  SAVING_THROW_PROFICIENCY,
  standardLanguageEntries,
  WEAPON_PROFICIENCY
} from "../../../../types";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  addManualCustomLanguageEntry,
  armorProficiencyOptions,
  getArmorLevelFromEntries,
  getDisplayLanguageProficiencyEntries,
  getEditableWeaponProficiencyOptions,
  getLanguageLevelFromEntries,
  getProficiencyLabel,
  getSavingThrowLevelFromEntries,
  getSkillLevelFromEntries,
  getSkillProficiencyForName,
  getToolLevelFromEntries,
  getWeaponLevelFromEntries,
  getWeaponProficiencyTypeLabel,
  groupedToolProficiencyOptions,
  hasLockedArmorEntry,
  hasLockedLanguageEntry,
  hasLockedSavingThrowEntry,
  hasLockedSkillEntry,
  hasLockedToolEntry,
  hasLockedWeaponEntry,
  isCustomLanguageProficiency,
  isWeaponMasteryProficiency,
  savingThrowProficiencyOptions,
  setManualArmorEntry,
  setManualLanguageEntry,
  setManualSavingThrowEntry,
  setManualToolEntry,
  setManualWeaponEntry,
  skillsOptions,
  upsertManualSkillEntry,
  type ToolProficiency
} from "../../../../pages/CharactersPage/proficiency";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../Overlay";
import TextInput from "../../FormInputs/TextInput";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import RadioContainerOption from "../RadioContainerOption";
import styles from "./ProficiencyEditorModal.module.css";

export type ProficiencyEditorTab =
  | "skills"
  | "savingThrows"
  | "weapons"
  | "armor"
  | "tools"
  | "languages";

type ProficiencyEditorModalProps = {
  character: Character;
  initialTab: ProficiencyEditorTab;
  onClose: () => void;
  onPersistCharacter: PersistCharacterUpdater;
};

type ToggleEditorOptions<TOption extends string> = {
  compact?: boolean;
  twoColumn?: boolean;
  getLabel?: (option: TOption) => string;
  renderMeta?: (option: TOption) => string | null;
  isDisabled?: (option: TOption) => boolean;
};

const proficiencyEditorTabs: Array<{ id: ProficiencyEditorTab; label: string }> = [
  { id: "skills", label: "Skills" },
  { id: "savingThrows", label: "Saving Throws" },
  { id: "weapons", label: "Weapons" },
  { id: "armor", label: "Armor" },
  { id: "tools", label: "Tools" },
  { id: "languages", label: "Languages" }
];

function ProficiencyEditorModal({
  character,
  initialTab,
  onClose,
  onPersistCharacter
}: ProficiencyEditorModalProps) {
  const [activeTab, setActiveTab] = useState<ProficiencyEditorTab>(initialTab);
  const [customLanguageNameDraft, setCustomLanguageNameDraft] = useState("");
  const [customLanguageDescriptionDraft, setCustomLanguageDescriptionDraft] = useState("");

  const displayedLanguageProficiencyEntries = getDisplayLanguageProficiencyEntries(
    character.languageProficiencies
  );

  function updateSkillLevel(skillName: string, nextLevel: PROF_LEVEL) {
    const skillProficiency = getSkillProficiencyForName(skillName);

    if (!skillProficiency) {
      return;
    }

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      skillProficiencies: upsertManualSkillEntry(
        currentCharacter.skillProficiencies,
        skillProficiency,
        nextLevel
      )
    }));
  }

  function updateSkillProficiency(skillName: string, isSelected: boolean) {
    updateSkillLevel(skillName, isSelected ? PROF_LEVEL.PROFICIENT : PROF_LEVEL.NONE);
  }

  function updateWeaponProficiency(proficiency: WEAPON_PROFICIENCY, isSelected: boolean) {
    onPersistCharacter((currentCharacter) => {
      if (hasLockedWeaponEntry(currentCharacter.weaponProficiencies, proficiency)) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        weaponProficiencies: setManualWeaponEntry(
          currentCharacter.weaponProficiencies,
          proficiency,
          isSelected ? PROF_LEVEL.PROFICIENT : PROF_LEVEL.NONE
        )
      };
    });
  }

  function updateSavingThrowProficiency(
    proficiency: SAVING_THROW_PROFICIENCY,
    isSelected: boolean
  ) {
    onPersistCharacter((currentCharacter) => {
      if (hasLockedSavingThrowEntry(currentCharacter.savingThrowProficiencies, proficiency)) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        savingThrowProficiencies: setManualSavingThrowEntry(
          currentCharacter.savingThrowProficiencies,
          proficiency,
          isSelected ? PROF_LEVEL.PROFICIENT : PROF_LEVEL.NONE
        )
      };
    });
  }

  function updateArmorProficiency(proficiency: ARMOR_PROFICIENCY, isSelected: boolean) {
    onPersistCharacter((currentCharacter) => {
      if (hasLockedArmorEntry(currentCharacter.armorProficiencies, proficiency)) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        armorProficiencies: setManualArmorEntry(
          currentCharacter.armorProficiencies,
          proficiency,
          isSelected ? PROF_LEVEL.PROFICIENT : PROF_LEVEL.NONE
        )
      };
    });
  }

  function updateToolProficiency(proficiency: ToolProficiency, isSelected: boolean) {
    onPersistCharacter((currentCharacter) => {
      if (hasLockedToolEntry(currentCharacter.toolProficiencies, proficiency)) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        toolProficiencies: setManualToolEntry(
          currentCharacter.toolProficiencies,
          proficiency,
          isSelected ? PROF_LEVEL.PROFICIENT : PROF_LEVEL.NONE
        )
      };
    });
  }

  function updateLanguageProficiency(proficiency: LANGUAGE_PROFICIENCY, isSelected: boolean) {
    onPersistCharacter((currentCharacter) => {
      if (hasLockedLanguageEntry(currentCharacter.languageProficiencies, proficiency)) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        languageProficiencies: setManualLanguageEntry(
          currentCharacter.languageProficiencies,
          proficiency,
          isSelected ? PROF_LEVEL.PROFICIENT : PROF_LEVEL.NONE
        )
      };
    });
  }

  function addCustomLanguage() {
    const normalizedName = customLanguageNameDraft.trim();

    if (!normalizedName) {
      return;
    }

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      languageProficiencies: addManualCustomLanguageEntry(
        currentCharacter.languageProficiencies,
        normalizedName,
        customLanguageDescriptionDraft.trim()
      )
    }));
    setCustomLanguageNameDraft("");
    setCustomLanguageDescriptionDraft("");
  }

  function removeLanguage(proficiency: LanguageProficiency) {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      languageProficiencies: setManualLanguageEntry(
        currentCharacter.languageProficiencies,
        proficiency,
        PROF_LEVEL.NONE
      )
    }));
  }

  function renderToggleEditor<TOption extends string>(
    options: readonly TOption[],
    isSelected: (option: TOption) => boolean,
    onToggle: (option: TOption, isSelected: boolean) => void,
    optionsConfig?: ToggleEditorOptions<TOption>
  ) {
    return (
      <div
        className={clsx(
          styles.editorGrid,
          optionsConfig?.compact && styles.editorGridCompact,
          optionsConfig?.twoColumn && styles.editorGridTwoColumn
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
            <RadioContainerOption
              key={option}
              header={label}
              selected={selected}
              onSelect={() => {
                if (disabled) {
                  return;
                }

                onToggle(option, !selected);
              }}
              breakdown={meta}
              disabled={disabled}
              indicatorType="checkbox"
              className={clsx(
                styles.editorOption,
                optionsConfig?.compact && styles.editorOptionCompact
              )}
            />
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
          ? getSkillLevelFromEntries(character.skillProficiencies, proficiency) !== PROF_LEVEL.NONE
          : false;
      },
      updateSkillProficiency,
      {
        getLabel: (skillName) => skillName,
        isDisabled: (skillName) => {
          const proficiency = getSkillProficiencyForName(skillName);

          return proficiency
            ? hasLockedSkillEntry(character.skillProficiencies, proficiency)
            : false;
        }
      }
    );
  }

  function renderLanguageToggleEditor(options: readonly LANGUAGE_PROFICIENCY[]) {
    return renderToggleEditor(
      options,
      (proficiency) =>
        getLanguageLevelFromEntries(character.languageProficiencies, proficiency) !==
        PROF_LEVEL.NONE,
      updateLanguageProficiency,
      {
        isDisabled: (proficiency) =>
          displayedLanguageProficiencyEntries.some(
            (entry) => entry.proficiency === proficiency && entry.locked
          )
      }
    );
  }

  function renderSavingThrowEditor() {
    return renderToggleEditor(
      savingThrowProficiencyOptions,
      (proficiency) =>
        getSavingThrowLevelFromEntries(character.savingThrowProficiencies, proficiency) !==
        PROF_LEVEL.NONE,
      updateSavingThrowProficiency,
      {
        isDisabled: (proficiency) =>
          hasLockedSavingThrowEntry(character.savingThrowProficiencies, proficiency)
      }
    );
  }

  function renderLanguageEditor() {
    const standardLanguageOptions = standardLanguageEntries.map((entry) => entry.proficiency);
    const exoticLanguageOptions = exoticLanguageEntries.map((entry) => entry.proficiency);
    const customLanguageEntries = displayedLanguageProficiencyEntries.filter((entry) =>
      isCustomLanguageProficiency(entry.proficiency)
    );
    const grantedLanguageEntries = displayedLanguageProficiencyEntries.filter(
      (entry) =>
        !isCustomLanguageProficiency(entry.proficiency) &&
        entry.locked &&
        !standardLanguageOptions.includes(entry.proficiency as LANGUAGE_PROFICIENCY) &&
        !exoticLanguageOptions.includes(entry.proficiency as LANGUAGE_PROFICIENCY)
    );

    return (
      <div className={styles.languageEditorStack}>
        <div className={styles.languageEditorGroup}>
          <p className={styles.groupSubtitle}>Standard Languages</p>
          {renderLanguageToggleEditor(standardLanguageOptions)}
        </div>
        <div className={styles.languageEditorGroup}>
          <p className={styles.groupSubtitle}>Exotic Languages</p>
          {renderLanguageToggleEditor(exoticLanguageOptions)}
        </div>
        {grantedLanguageEntries.length > 0 ? (
          <div className={styles.languageEditorGroup}>
            <p className={styles.groupSubtitle}>Granted Languages</p>
            {renderToggleEditor(
              grantedLanguageEntries.map((entry) => entry.proficiency as LANGUAGE_PROFICIENCY),
              (proficiency) =>
                getLanguageLevelFromEntries(character.languageProficiencies, proficiency) !==
                PROF_LEVEL.NONE,
              updateLanguageProficiency,
              {
                compact: true,
                twoColumn: true,
                renderMeta: (proficiency) =>
                  grantedLanguageEntries
                    .find((entry) => entry.proficiency === proficiency)
                    ?.sourceLabels.join(", ") ?? null,
                isDisabled: () => true
              }
            )}
          </div>
        ) : null}
        <div className={styles.languageEditorGroup}>
          <p className={styles.groupSubtitle}>Custom Language</p>
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
              className={styles.addLanguageButton}
              onClick={addCustomLanguage}
              disabled={customLanguageNameDraft.trim().length === 0}
            >
              Add language
            </button>
          </div>
          {customLanguageEntries.length > 0 ? (
            <ul className={styles.customLanguageList}>
              {customLanguageEntries.map((entry) => {
                const matchingCharacterEntry = character.languageProficiencies.find(
                  (currentEntry) => currentEntry.proficiency === entry.proficiency
                );

                return (
                  <li key={String(entry.proficiency)} className={styles.customLanguageItem}>
                    <div className={styles.customLanguageContent}>
                      <strong>{getProficiencyLabel(entry.proficiency)}</strong>
                      {matchingCharacterEntry?.customDescription ? (
                        <small>{matchingCharacterEntry.customDescription}</small>
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
    const availableWeaponProficiencyOptions = getEditableWeaponProficiencyOptions().filter(
      (proficiency) => proficiency !== WEAPON_PROFICIENCY.MARTIAL_MELEE_NO_HEAVY_OR_TWO_HANDED
    );
    const broadWeaponOptions = availableWeaponProficiencyOptions.filter(
      (proficiency) => !isWeaponMasteryProficiency(proficiency)
    );
    const masteryWeaponOptions = availableWeaponProficiencyOptions.filter((proficiency) =>
      isWeaponMasteryProficiency(proficiency)
    );
    const isWeaponSelected = (proficiency: WEAPON_PROFICIENCY) =>
      getWeaponLevelFromEntries(character.weaponProficiencies, proficiency) !== PROF_LEVEL.NONE;
    const isWeaponDisabled = (proficiency: WEAPON_PROFICIENCY) =>
      hasLockedWeaponEntry(character.weaponProficiencies, proficiency);

    return (
      <div className={styles.editorSectionStack}>
        {renderToggleEditor(broadWeaponOptions, isWeaponSelected, updateWeaponProficiency, {
          compact: true,
          twoColumn: true,
          renderMeta: getWeaponProficiencyTypeLabel,
          isDisabled: isWeaponDisabled
        })}
        <div className={styles.editorDivider} role="presentation">
          <span className={styles.editorDividerLine} />
          <span className={styles.editorDividerLabel}>Weapon masteries</span>
          <span className={styles.editorDividerLine} />
        </div>
        {renderToggleEditor(masteryWeaponOptions, isWeaponSelected, updateWeaponProficiency, {
          compact: true,
          twoColumn: true,
          renderMeta: getWeaponProficiencyTypeLabel,
          isDisabled: isWeaponDisabled
        })}
      </div>
    );
  }

  function renderProficiencyEditorContent() {
    switch (activeTab) {
      case "skills":
        return renderSkillEditor();
      case "savingThrows":
        return renderSavingThrowEditor();
      case "weapons":
        return renderWeaponEditor();
      case "armor":
        return renderToggleEditor(
          armorProficiencyOptions,
          (proficiency) =>
            getArmorLevelFromEntries(character.armorProficiencies, proficiency) !== PROF_LEVEL.NONE,
          updateArmorProficiency,
          {
            isDisabled: (proficiency) =>
              hasLockedArmorEntry(character.armorProficiencies, proficiency)
          }
        );
      case "tools":
        return renderToggleEditor(
          groupedToolProficiencyOptions,
          (proficiency) =>
            getToolLevelFromEntries(character.toolProficiencies, proficiency) !== PROF_LEVEL.NONE,
          updateToolProficiency,
          {
            isDisabled: (proficiency) =>
              hasLockedToolEntry(character.toolProficiencies, proficiency)
          }
        );
      case "languages":
        return renderLanguageEditor();
      default:
        return null;
    }
  }

  return (
    <SheetModal
      titleId="character-proficiency-editor-title"
      onClose={onClose}
      panelClassName={styles.modalPanel}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitleRow>
            <OverlayTitle id="character-proficiency-editor-title">Edit Proficiencies</OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary className={shared.helperText}>
            Changes here are applied immediately as manual overrides.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close proficiency editor" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <div className={styles.tabRow} role="tablist" aria-label="Proficiency categories">
          {proficiencyEditorTabs.map((tab) => (
            <button
              key={tab.id}
              id={`character-proficiency-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`character-proficiency-tab-panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={clsx(styles.tabButton, activeTab === tab.id && styles.tabButtonActive)}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          id={`character-proficiency-tab-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`character-proficiency-tab-${activeTab}`}
          className={styles.editorScrollArea}
        >
          {renderProficiencyEditorContent()}
        </div>
      </OverlayBody>
    </SheetModal>
  );
}

export default ProficiencyEditorModal;
