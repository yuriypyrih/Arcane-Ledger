import { type FormEvent, useState } from "react";
import type { CampaignLiveEncounterTrackerRecord } from "../../../../api/campaigns";
import { updatePartyGroupLiveEncounterInitiative } from "../../../../api/partyGroups";
import { getDmToolsApiErrorMessage } from "../../../../pages/DmToolsPage/dmToolsApiErrors";
import {
  clampInitiative,
  INITIATIVE_MAX,
  INITIATIVE_MIN
} from "../../../../pages/DmToolsPage/liveEncounterInitiative";
import ActionButton from "../../../ActionButton";
import styles from "./PartyInitiativeSubmit.module.css";

type PartyInitiativeSubmitProps = {
  characterId: string;
  onUpdated: (tracker: CampaignLiveEncounterTrackerRecord | null) => void;
  partyGroupId: string;
  tracker: CampaignLiveEncounterTrackerRecord;
};

/** Lets a player send the initiative they rolled to the GM's tracker, once. The GM can change it later. */
function PartyInitiativeSubmit({
  characterId,
  onUpdated,
  partyGroupId,
  tracker
}: PartyInitiativeSubmitProps) {
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const member = [...tracker.partyMembers, ...tracker.initiativeOrder].find(
    (participant) => participant.kind === "party-member" && participant.characterId === characterId
  );

  if (!member || (member.initiative !== null && member.initiative !== undefined)) {
    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const value = Number(draft);

    if (draft.trim() === "" || !Number.isInteger(value)) {
      setError("Enter a whole number.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { liveEncounterTracker } = await updatePartyGroupLiveEncounterInitiative(
        partyGroupId,
        { characterId, initiative: clampInitiative(value) },
        { suppressFailureToast: true }
      );

      onUpdated(liveEncounterTracker);
      setDraft("");
    } catch (submitError) {
      setError(getDmToolsApiErrorMessage(submitError, "Unable to submit initiative."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
      <label className={styles.label}>
        Your initiative
        <input
          className={styles.input}
          type="number"
          inputMode="numeric"
          min={INITIATIVE_MIN}
          max={INITIATIVE_MAX}
          step={1}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <ActionButton type="submit" fullWidth={false} size="sm" loading={isSubmitting}>
        Submit
      </ActionButton>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

export default PartyInitiativeSubmit;
