import { type FormEvent, useState } from "react";
import type { EncounterTemplateCreatureRecord } from "../../api/encounterTemplates";
import ActionButton from "../../components/ActionButton";
import styles from "./CreatureImageUrlField.module.css";

type CreatureImageUrlFieldProps = {
  creature: EncounterTemplateCreatureRecord;
  onUpdate: (
    update: (creature: EncounterTemplateCreatureRecord) => EncounterTemplateCreatureRecord
  ) => void | Promise<void>;
};

function toHttpsUrl(value: string) {
  try {
    const url = new URL(value.trim());

    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null;
  } catch {
    return null;
  }
}

/** GM-only: a picture link for this creature, shown on the trackers and the table view. */
function CreatureImageUrlField({ creature, onUpdate }: CreatureImageUrlFieldProps) {
  const [draft, setDraft] = useState(creature.imageUrl ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(nextUrl: string | null) {
    setIsSaving(true);
    setError(null);

    try {
      await onUpdate((current) => {
        const { imageUrl: _previous, ...rest } = current;

        return nextUrl ? { ...rest, imageUrl: nextUrl } : rest;
      });
      setDraft(nextUrl ?? "");
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmed = draft.trim();

    if (!trimmed) {
      void save(null);
      return;
    }

    const url = toHttpsUrl(trimmed);

    if (!url || url.length > 500) {
      setError("Use a full https:// link (up to 500 characters).");
      return;
    }

    void save(url);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label} htmlFor={`creature-image-${creature.id}`}>
        Picture link{" "}
        <span className={styles.hint}>
          (GM only to set; players always see it, so leave it empty for hidden monsters)
        </span>
      </label>
      <div className={styles.row}>
        <input
          id={`creature-image-${creature.id}`}
          className={styles.input}
          type="url"
          inputMode="url"
          placeholder="https://…"
          value={draft}
          maxLength={500}
          onChange={(event) => setDraft(event.target.value)}
        />
        <ActionButton type="submit" fullWidth={false} size="sm" loading={isSaving}>
          Save
        </ActionButton>
        {creature.imageUrl ? (
          <ActionButton
            type="button"
            variant="OUTLINE"
            fullWidth={false}
            size="sm"
            disabled={isSaving}
            onClick={() => void save(null)}
          >
            Remove
          </ActionButton>
        ) : null}
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

export default CreatureImageUrlField;
