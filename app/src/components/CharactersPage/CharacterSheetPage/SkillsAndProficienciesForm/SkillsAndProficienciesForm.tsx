import clsx from "clsx";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import type { Character } from "../../../../types";
import { getKeywordDescription } from "../../../../pages/CharactersPage/keywordDescriptions";
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
  isWeaponMasteryProficiency,
  type ProficiencyDisplayEntry
} from "../../../../pages/CharactersPage/proficiency";
import { formatD20Formula } from "../../../../pages/CharactersPage/shared";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getRollModeFromIndicators } from "../../../RollStatePill/rollState";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import SheetSurface from "../SheetSurface";
import ProficiencyEditorModal, { type ProficiencyEditorTab } from "./ProficiencyEditorModal";
import SkillEditorModal from "./SkillEditorModal";
import SkillRowsGrid from "./SkillRowsGrid";
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
  const [isSkillEditorOpen, setIsSkillEditorOpen] = useState(false);
  const [isProficiencyModalOpen, setIsProficiencyModalOpen] = useState(false);
  const [proficiencyEditorInitialTab, setProficiencyEditorInitialTab] =
    useState<ProficiencyEditorTab>("weapons");
  const [selectedKeyword, setSelectedKeyword] = useState<SelectedSkillReference | null>(null);
  const [isSkillReferenceDiceRollerSettingsOpen, setIsSkillReferenceDiceRollerSettingsOpen] =
    useState(false);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  useBodyScrollLock(
    Boolean(selectedKeyword) ||
      isSkillEditorOpen ||
      isProficiencyModalOpen ||
      isSkillReferenceDiceRollerSettingsOpen
  );

  const displayedWeaponProficiencyEntries = getDisplayWeaponProficiencyEntries(
    character.weaponProficiencies,
    character.className
  );
  const displayedLanguageProficiencyEntries = getDisplayLanguageProficiencyEntries(
    character.languageProficiencies
  );

  const proficiencyCategorySections: ProficiencyCategorySection[] = [
    {
      title: "Skill Proficiencies",
      entries: getDisplaySkillProficiencyEntries(character.skillProficiencies)
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
      title: "Armor Training",
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

  function openProficiencyEditor(tab: ProficiencyEditorTab = "weapons") {
    setProficiencyEditorInitialTab(tab);
    setIsProficiencyModalOpen(true);
  }

  function closeSelectedKeyword() {
    setIsSkillReferenceDiceRollerSettingsOpen(false);
    setSelectedKeyword(null);
  }

  function formatReferenceSourceLabel(sourceLabels: string[], fallback: string): string {
    const normalizedLabels = [
      ...new Set(sourceLabels.map((label) => label.trim()).filter(Boolean))
    ];

    return normalizedLabels.length > 0 ? normalizedLabels.join(", ") : fallback;
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
      <div key={section.title} className={styles.proficiencySubsection}>
        <p className={styles.skillGroupSubtitle}>{section.title}</p>
        <ul className={styles.proficiencyPillGrid}>
          {section.entries.map((entry) => {
            const label = getProficiencyLabel(entry.proficiency);
            const keyword = getProficiencyKeyword(entry.proficiency);

            return (
              <SheetSurface
                as="li"
                key={`${section.title}:${entry.proficiency}:${entry.sourceLabels.join("|")}:${entry.proficiencyLevel}`}
                borderSize="md"
                hoverBorder
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
              </SheetSurface>
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
          <p className={shared.eyebrow}>SKILLS AND PROFICIENCIES</p>
        </div>
      </div>

      <div className={styles.skillStack}>
        <div className={styles.skillGroup}>
          <div className={styles.skillGroupHeader}>
            <p className={styles.skillGroupTitle}>Skills</p>
            <button
              type="button"
              className={shared.editButton}
              disabled={isProficiencyModalOpen}
              onClick={() => setIsSkillEditorOpen(true)}
              aria-label="Edit skills"
            >
              <Pencil size={16} />
              Edit
            </button>
          </div>
          <SkillRowsGrid
            character={character}
            skillProficiencies={character.skillProficiencies}
            onOpenSkillReference={openKeywordReference}
          />
        </div>

        <div className={clsx(styles.skillGroup, styles.proficiencyGroup)}>
          <div className={styles.skillGroupHeader}>
            <p className={styles.skillGroupTitle}>Proficiencies</p>
            <button
              type="button"
              className={shared.editButton}
              disabled={isSkillEditorOpen || isProficiencyModalOpen}
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

      {isSkillEditorOpen ? (
        <SkillEditorModal
          character={character}
          onClose={() => setIsSkillEditorOpen(false)}
          onOpenSkillReference={openKeywordReference}
          onPersistCharacter={onPersistCharacter}
        />
      ) : null}

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
