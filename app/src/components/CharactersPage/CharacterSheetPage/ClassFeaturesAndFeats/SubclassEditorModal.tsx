import { useMemo, useState } from "react";
import {
  getSelectedSubclassForCharacter,
  getSubclassOptionsForClassName,
  normalizeSubclassId
} from "../../../../pages/CharactersPage/subclasses";
import type { Character } from "../../../../types";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  SheetModal
} from "../../../Overlay";
import ActionButton from "../../../ActionButton";
import SelectInput from "../../FormInputs/SelectInput";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./FeatEditorModal.module.css";

type SubclassEditorModalProps = {
  character: Character;
  onCancel: () => void;
  onSave: (subclassId: string) => void;
};

function SubclassEditorModal({ character, onCancel, onSave }: SubclassEditorModalProps) {
  const selectedSubclass = getSelectedSubclassForCharacter(character);
  const [draftSubclassId, setDraftSubclassId] = useState(selectedSubclass?.id ?? "");
  const subclassOptions = useMemo(
    () => getSubclassOptionsForClassName(character.className),
    [character.className]
  );
  const normalizedSubclassId = normalizeSubclassId(draftSubclassId, character.className) ?? "";
  const isReady = subclassOptions.length === 0 || normalizedSubclassId.length > 0;

  function saveSubclass() {
    if (!isReady) {
      return;
    }

    onSave(normalizedSubclassId);
  }

  return (
    <SheetModal
      titleId="character-subclass-editor-title"
      onClose={onCancel}
      size="small"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Build</OverlayEyebrow>
          <div className={styles.heading}>
            <h3 id="character-subclass-editor-title" className={styles.headingTitle}>
              Edit Subclass
            </h3>
            <OverlaySummary className={shared.helperText}>
              Choose the subclass used for class feature progression.
            </OverlaySummary>
          </div>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close subclass editor" onClick={onCancel} />
      </OverlayHeader>

      <OverlayBody className={styles.scrollArea}>
        <div className={styles.singleFieldGrid}>
          <label className={styles.field}>
            Subclass
            <SelectInput
              compact
              value={draftSubclassId}
              disabled={subclassOptions.length === 0}
              onChange={(event) => setDraftSubclassId(event.target.value)}
            >
              <option value="">
                {subclassOptions.length > 0 ? "Select a subclass" : "No subclass options"}
              </option>
              {subclassOptions.map((subclass) => (
                <option key={subclass.id} value={subclass.id}>
                  {subclass.name}
                </option>
              ))}
            </SelectInput>
          </label>
        </div>

        {!isReady ? <p className={styles.validation}>Choose a subclass before saving.</p> : null}
      </OverlayBody>

      <OverlayFooter className={styles.footer}>
        <ActionButton variant="OUTLINE" fullWidth={false} onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton fullWidth={false} onClick={saveSubclass} disabled={!isReady}>
          Save
        </ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}

export default SubclassEditorModal;
