import { useMemo, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import type { Character } from "../../../../types";
import {
  applyClassDefinitions,
  createClassDefinitionsDraft,
  createDeclaredClass,
  setEntryRulesEnforced,
  type ClassDefinitionsDraft
} from "../../../../pages/CharactersPage/classDefinitions";
import { areCharacterClassRulesEnforced } from "../../../../pages/CharactersPage/customClass";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import ActionButton from "../../../ActionButton";
import InlineToggleButton from "../InlineToggleButton";
import RadioContainerOption from "../RadioContainerOption";
import ClassDefinitionRow from "./ClassDefinitionRow";
import styles from "./ClassDefinitionsEditor.module.css";

type Props = {
  character: Character;
  onCancel: () => void;
  onSave: (draft: ClassDefinitionsDraft) => void;
};

export default function SubclassEditorModal({ character, onCancel, onSave }: Props) {
  const [draft, setDraft] = useState(() => createClassDefinitionsDraft(character));
  const [error, setError] = useState("");
  const preview = useMemo(() => {
    try {
      return applyClassDefinitions(character, draft);
    } catch {
      return null;
    }
  }, [character, draft]);
  const original = useMemo(
    () => JSON.stringify(createClassDefinitionsDraft(character)),
    [character]
  );
  const changed = JSON.stringify(draft) !== original;
  const ruleClasses = draft.progression.classes.filter(
    (entry) => entry.className && entry.className !== "Custom"
  );
  const rulesEnforced = ruleClasses.every(areCharacterClassRulesEnforced);
  function change(next: ClassDefinitionsDraft) {
    setDraft(next);
    setError("");
  }
  return (
    <SheetModal titleId="character-subclass-editor-title" onClose={onCancel}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Build</OverlayEyebrow>
          <OverlayTitle id="character-subclass-editor-title">Edit Class and Subclass</OverlayTitle>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close subclass editor" onClick={onCancel} />
      </OverlayHeader>
      <OverlayBody className={styles.body}>
        {draft.progression.classes.map((entry, index) => (
          <ClassDefinitionRow
            key={entry.id}
            character={character}
            preview={preview ?? character}
            draft={draft}
            entry={entry}
            index={index}
            rulesEnforced={rulesEnforced}
            onChange={change}
          />
        ))}
        <InlineToggleButton
          className={styles.add}
          label="Add Multiclass"
          icon={<Plus size={15} aria-hidden="true" />}
          disabled={draft.progression.classes.length >= 100}
          onClick={() =>
            change({
              ...draft,
              progression: {
                ...draft.progression,
                classes: [...draft.progression.classes, createDeclaredClass()]
              }
            })
          }
        />
        <hr className={styles.divider} />
        <RadioContainerOption
          header="Class rules enforcement"
          subheader="Apply build rules to all classes"
          selected={ruleClasses.length > 0 && rulesEnforced}
          disabled={ruleClasses.length === 0}
          onSelect={() =>
            change({
              ...draft,
              progression: {
                ...draft.progression,
                classes: draft.progression.classes.map((entry) =>
                  entry.className && entry.className !== "Custom"
                    ? setEntryRulesEnforced(character, entry, !rulesEnforced)
                    : entry
                )
              }
            })
          }
          indicatorType="checkbox"
        />
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </OverlayBody>
      <OverlayFooter className={styles.footer}>
        <ActionButton
          variant="OUTLINE"
          icon={<X size={18} aria-hidden="true" />}
          onClick={onCancel}
        >
          Cancel
        </ActionButton>
        <ActionButton
          icon={<Check size={18} aria-hidden="true" />}
          disabled={!preview || !changed}
          onClick={() => {
            try {
              onSave(draft);
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : "Unable to save class changes.");
            }
          }}
        >
          Save
        </ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}
