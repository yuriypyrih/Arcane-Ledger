import type { FormEvent } from "react";
import type { CharacterDraft } from "../../../../types";
import styles from "./CharacterForm.module.css";

type CharacterFormProps = {
  draft: CharacterDraft;
  isEditing: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDraftChange: (draft: CharacterDraft) => void;
  onCancel: () => void;
};

function CharacterForm({
  draft,
  isEditing,
  onSubmit,
  onDraftChange,
  onCancel
}: CharacterFormProps) {
  return (
    <form className={styles.formCard} onSubmit={onSubmit}>
      <div>
        <p className={styles.eyebrow}>Character sheets</p>
        <h2 className={styles.title}>{isEditing ? "Edit character" : "Create a character"}</h2>
      </div>

      <label className={styles.field}>
        <span>Name</span>
        <input
          className={styles.input}
          value={draft.name}
          onChange={(event) => onDraftChange({ ...draft, name: event.target.value })}
          placeholder="Mira Nightbloom"
        />
      </label>

      <label className={styles.field}>
        <span>Class</span>
        <input
          className={styles.input}
          value={draft.className}
          onChange={(event) => onDraftChange({ ...draft, className: event.target.value })}
          placeholder="Cleric"
        />
      </label>

      <label className={styles.field}>
        <span>Level</span>
        <input
          className={styles.input}
          type="number"
          min={1}
          value={draft.level}
          onChange={(event) =>
            onDraftChange({
              ...draft,
              level: Number(event.target.value || 1)
            })
          }
        />
      </label>

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton}>
          {isEditing ? "Update Character" : "Save Character"}
        </button>
        {isEditing ? (
          <button type="button" className={styles.secondaryButton} onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default CharacterForm;
