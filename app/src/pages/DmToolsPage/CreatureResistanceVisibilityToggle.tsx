import { useState } from "react";
import { DEFENSE_FIELDS, getDefenseEntryId, type DefenseFieldKey } from "./creatureDefenses";
import styles from "./CreatureResistanceVisibilityToggle.module.css";

export type ResistanceVisibilityChange = {
  revealedDefenses: string[] | undefined;
  show: boolean;
};

type CreatureResistanceVisibilityToggleProps = {
  /** The creature's saved entries per field. */
  entries: Record<DefenseFieldKey, string[]>;
  isVisible: boolean;
  /** Entry ids players may see; undefined means every entry. */
  revealedDefenses: string[] | undefined;
  onChange: (change: ResistanceVisibilityChange) => void | Promise<void>;
};

/** GM-only: lets players see this creature's resistances, immunities and vulnerabilities, entry by entry. */
function CreatureResistanceVisibilityToggle({
  entries,
  isVisible,
  revealedDefenses,
  onChange
}: CreatureResistanceVisibilityToggleProps) {
  const [isSaving, setIsSaving] = useState(false);
  const allIds = DEFENSE_FIELDS.flatMap(({ key }) =>
    entries[key].map((entry) => getDefenseEntryId(key, entry))
  );
  const revealed = revealedDefenses ?? allIds;

  async function handleChange(change: ResistanceVisibilityChange) {
    setIsSaving(true);

    try {
      await onChange(change);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={isVisible}
          disabled={isSaving}
          onChange={(event) =>
            void handleChange({
              show: event.target.checked,
              revealedDefenses: event.target.checked ? (revealedDefenses ?? []) : revealedDefenses
            })
          }
        />
        <span>
          Show resistances &amp; immunities to players
          <span className={styles.hint}> (you choose which entries)</span>
        </span>
      </label>
      {isVisible && allIds.length > 0 ? (
        <div className={styles.entries} role="group" aria-label="Entries players can see">
          {DEFENSE_FIELDS.filter(({ key }) => entries[key].length > 0).map(({ key, label }) => (
            <div key={key} className={styles.entryGroup}>
              <span className={styles.groupLabel}>{label}</span>
              {entries[key].map((entry) => {
                const id = getDefenseEntryId(key, entry);

                return (
                  <label key={id} className={styles.entry}>
                    <input
                      type="checkbox"
                      checked={revealed.includes(id)}
                      disabled={isSaving}
                      onChange={(event) =>
                        void handleChange({
                          show: true,
                          revealedDefenses: event.target.checked
                            ? [...revealed, id]
                            : revealed.filter((revealedId) => revealedId !== id)
                        })
                      }
                    />
                    {entry}
                  </label>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default CreatureResistanceVisibilityToggle;
