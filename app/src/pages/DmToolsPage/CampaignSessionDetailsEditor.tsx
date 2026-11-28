import { type FormEvent, useState } from "react";
import type { CampaignPreparedEncounterRecord } from "../../api/campaigns";
import { updateGameSession, type GameSessionRecord } from "../../api/gameSessions";
import { notifySessionLogReminderChanged } from "../../lib/sessionLogReminder";
import ActionButton from "../../components/ActionButton";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import dmStyles from "./DmToolsPage.module.css";
import styles from "./CampaignSessionsSection.module.css";

type CampaignSessionDetailsEditorProps = {
  /** Open the editor straight away, for a session that needs its log written. */
  defaultOpen?: boolean;
  preparedEncounters: CampaignPreparedEncounterRecord[];
  session: GameSessionRecord;
  onSaved: () => void;
};

const RECAP_MAX_LENGTH = 20000;

function CampaignSessionDetailsEditor({
  defaultOpen = false,
  preparedEncounters,
  session,
  onSaved
}: CampaignSessionDetailsEditorProps) {
  const isPlanned = session.status === "planned";
  const [duration, setDuration] = useState(session.durationMinutes?.toString() ?? "");
  const [recap, setRecap] = useState(session.recap);
  const [linkedIds, setLinkedIds] = useState(session.linkedPreparedEncounterIds);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleEncounter(encounterId: string) {
    setLinkedIds((current) =>
      current.includes(encounterId)
        ? current.filter((id) => id !== encounterId)
        : [...current, encounterId]
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await updateGameSession(
        session.id,
        {
          recap,
          ...(isPlanned
            ? {
                durationMinutes: duration ? Number(duration) : null,
                linkedPreparedEncounterIds: linkedIds
              }
            : {})
        },
        { suppressFailureToast: true }
      );
      onSaved();
      // A log written here clears the bell's reminder to write it.
      notifySessionLogReminderChanged();
    } catch (saveError) {
      setError(getDmToolsApiErrorMessage(saveError, "Unable to save session details."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <details
      className={styles.details}
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary>{session.status === "ended" ? "Session log" : "Details"}</summary>
      <form className={styles.detailsForm} onSubmit={(event) => void handleSubmit(event)}>
        {isPlanned ? (
          <>
            <label className={styles.field}>
              Duration (minutes)
              <input
                className={styles.input}
                type="number"
                min={15}
                max={1440}
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />
            </label>
            {preparedEncounters.length > 0 ? (
              <fieldset className={styles.field}>
                <legend>Linked encounters</legend>
                {preparedEncounters.map((encounter) => (
                  <label key={encounter.id} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={linkedIds.includes(encounter.id)}
                      onChange={() => toggleEncounter(encounter.id)}
                    />
                    {encounter.name}
                  </label>
                ))}
              </fieldset>
            ) : null}
          </>
        ) : null}
        <label className={styles.field}>
          {session.status === "ended"
            ? "What happened (your players can read this)"
            : "Session log (players can read this after the session)"}
          <textarea
            className={styles.input}
            rows={5}
            maxLength={RECAP_MAX_LENGTH}
            value={recap}
            onChange={(event) => setRecap(event.target.value)}
          />
        </label>
        {error ? <p className={dmStyles.modalError}>{error}</p> : null}
        <ActionButton type="submit" fullWidth={false} size="sm" loading={isSaving}>
          {session.status === "ended" ? "Save log" : "Save details"}
        </ActionButton>
      </form>
    </details>
  );
}

export default CampaignSessionDetailsEditor;
