import clsx from "clsx";
import { CircleHelp, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import type { Character } from "../../../../types";
import { getKeywordDescription } from "../../../../pages/CharactersPage/keywordDescriptions";
import type { FeatureIndicator } from "../../../../pages/CharactersPage/classFeatures";
import { getCharacterRuntime } from "../../../../pages/CharactersPage/characterRuntime/characterRuntime";
import { getProficiencyKeyword } from "../../../../pages/CharactersPage/proficiency";
import { formatD20Formula } from "../../../../pages/CharactersPage/shared";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getRollModeFromIndicators } from "../../../RollStatePill/rollState";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import SheetActionButton from "../SheetActionButton";
import ProficiencyEditorModal, { type ProficiencyEditorTab } from "./ProficiencyEditorModal";
import ProficiencySummaryPills from "./ProficiencySummaryPills";
import SkillEditorModal from "./SkillEditorModal";
import SkillRowsGrid from "./SkillRowsGrid";
import SkillsAndProficienciesGuideModal from "./SkillsAndProficienciesGuideModal";
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

function SkillsAndProficienciesForm({
  character,
  className,
  onPersistCharacter
}: SkillsAndProficienciesFormProps) {
  const [isSkillEditorOpen, setIsSkillEditorOpen] = useState(false);
  const [isProficiencyModalOpen, setIsProficiencyModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [proficiencyEditorInitialTab, setProficiencyEditorInitialTab] =
    useState<ProficiencyEditorTab>("weapons");
  const [selectedKeyword, setSelectedKeyword] = useState<SelectedSkillReference | null>(null);
  const [isSkillReferenceDiceRollerSettingsOpen, setIsSkillReferenceDiceRollerSettingsOpen] =
    useState(false);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();
  const combatSummary = useMemo(() => getCharacterRuntime(character).combatSummary, [character]);

  useBodyScrollLock(
    Boolean(selectedKeyword) ||
      isSkillEditorOpen ||
      isProficiencyModalOpen ||
      isGuideOpen ||
      isSkillReferenceDiceRollerSettingsOpen
  );

  const visibleProficiencySections = combatSummary.skills.proficiencySections;

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
    const description = getKeywordDescription(keyword) ?? `No description for - ${keyword}`;

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

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <div className={shared.eyebrowHelpRow}>
            <p className={clsx(shared.eyebrow, shared.eyebrowInHelpRow)}>
              SKILLS AND PROFICIENCIES
            </p>
            <button
              type="button"
              className={shared.helpButton}
              onClick={() => setIsGuideOpen(true)}
              aria-label="Open skills and proficiencies guide"
              title="Open skills and proficiencies guide"
            >
              <CircleHelp size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.skillStack}>
        <div className={styles.skillGroup}>
          <div className={styles.skillGroupHeader}>
            <p className={styles.skillGroupTitle}>Skills</p>
            <SheetActionButton
              disabled={isProficiencyModalOpen}
              onClick={() => setIsSkillEditorOpen(true)}
              aria-label="Edit skills"
            >
              <Pencil size={16} />
              Edit
            </SheetActionButton>
          </div>
          <SkillRowsGrid
            skillSummary={combatSummary.skills}
            skillProficiencies={character.skillProficiencies}
            onOpenSkillReference={openKeywordReference}
          />
        </div>

        <div className={clsx(styles.skillGroup, styles.proficiencyGroup)}>
          <div className={styles.skillGroupHeader}>
            <p className={styles.skillGroupTitle}>Proficiencies</p>
            <SheetActionButton
              disabled={isSkillEditorOpen || isProficiencyModalOpen}
              onClick={() => openProficiencyEditor("weapons")}
              aria-label="Edit proficiencies"
            >
              <Pencil size={16} />
              Edit
            </SheetActionButton>
          </div>
          <ProficiencySummaryPills
            sections={visibleProficiencySections}
            emptyClassName={shared.emptyText}
            onEntryClick={(entry) =>
              openKeywordReference(getProficiencyKeyword(entry.proficiency), undefined, [
                {
                  label: "Source",
                  value: formatReferenceSourceLabel(entry.sourceLabels, "Manual")
                }
              ])
            }
          />
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

      {isGuideOpen ? (
        <SkillsAndProficienciesGuideModal onClose={() => setIsGuideOpen(false)} />
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
