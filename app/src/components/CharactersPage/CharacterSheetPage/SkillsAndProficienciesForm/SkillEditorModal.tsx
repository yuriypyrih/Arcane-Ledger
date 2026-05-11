import { useRef, useState } from "react";
import type { Character, SkillProficiencyEntry } from "../../../../types";
import { PROF_LEVEL } from "../../../../types";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  getSkillProficiencyForName,
  upsertManualSkillEntry
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
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import SkillRowsGrid, { type OpenSkillReferenceHandler } from "./SkillRowsGrid";
import styles from "./SkillsAndProficienciesForm.module.css";

type SkillEditorModalProps = {
  character: Character;
  onClose: () => void;
  onOpenSkillReference: OpenSkillReferenceHandler;
  onPersistCharacter: PersistCharacterUpdater;
};

function SkillEditorModal({
  character,
  onClose,
  onOpenSkillReference,
  onPersistCharacter
}: SkillEditorModalProps) {
  const [skillProficienciesDraft, setSkillProficienciesDraftState] = useState<
    SkillProficiencyEntry[]
  >(() => character.skillProficiencies);
  const skillProficienciesDraftRef = useRef(skillProficienciesDraft);

  function setSkillProficienciesDraft(
    draftOrUpdater:
      | SkillProficiencyEntry[]
      | ((currentDraft: SkillProficiencyEntry[]) => SkillProficiencyEntry[])
  ) {
    const nextDraft =
      typeof draftOrUpdater === "function"
        ? draftOrUpdater(skillProficienciesDraftRef.current)
        : draftOrUpdater;

    skillProficienciesDraftRef.current = nextDraft;
    setSkillProficienciesDraftState(nextDraft);
  }

  function saveAndClose() {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      skillProficiencies: skillProficienciesDraftRef.current
    }));
    onClose();
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

  return (
    <SheetModal
      titleId="character-skill-editor-title"
      onClose={saveAndClose}
      size="medium"
      panelClassName={styles.skillEditorModalPanel}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitleRow>
            <OverlayTitle id="character-skill-editor-title">Edit Skills</OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary className={shared.helperText}>
            Manual skill overrides are saved when this editor closes.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close skill editor" onClick={saveAndClose} />
      </OverlayHeader>

      <OverlayBody className={styles.skillEditorBody}>
        <div className={styles.skillEditorScrollArea}>
          <SkillRowsGrid
            character={character}
            skillProficiencies={skillProficienciesDraft}
            editable
            onOpenSkillReference={onOpenSkillReference}
            onSkillLevelChange={updateSkillLevel}
          />
        </div>
      </OverlayBody>
    </SheetModal>
  );
}

export default SkillEditorModal;
