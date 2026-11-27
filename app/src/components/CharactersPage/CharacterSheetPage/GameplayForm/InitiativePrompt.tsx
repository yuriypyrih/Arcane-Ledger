import { type FormEvent, useCallback, useEffect, useId, useState } from "react";
import type { CampaignLiveEncounterTrackerRecord } from "../../../../api/campaigns";
import {
  getPartyGroupLiveEncounter,
  updatePartyGroupLiveEncounterInitiative,
  type PartyMembershipRecord
} from "../../../../api/partyGroups";
import { usePartyEvents } from "../../../../lib/useCampaignEvents";
import { getDmToolsApiErrorMessage } from "../../../../pages/DmToolsPage/dmToolsApiErrors";
import {
  clampInitiative,
  INITIATIVE_MAX,
  INITIATIVE_MIN
} from "../../../../pages/DmToolsPage/liveEncounterInitiative";
import { normalizeLiveEncounterTracker } from "../../../../pages/DmToolsPage/liveEncounterTrackerUtils";
import { getInitiativeForCharacter } from "../../../../pages/CharactersPage/gameplay";
import { showToast, useAppDispatch } from "../../../../store";
import type { Character } from "../../../../types";
import { rollD20 } from "../../../../utils/dice";
import ActionButton from "../../../ActionButton";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import { applyInitiativeRollCharacterEffects } from "../StatsForm/initiativeRoll";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import styles from "./PartyInitiativeSubmit.module.css";

type InitiativePromptProps = {
  character: Character;
  membership: PartyMembershipRecord;
  onPersistCharacter: PersistCharacterUpdater;
};

function getMyParticipant(tracker: CampaignLiveEncounterTrackerRecord | null, characterId: string) {
  return tracker?.status.state === "valid"
    ? [...tracker.partyMembers, ...tracker.initiativeOrder].find(
        (participant) =>
          participant.kind === "party-member" && participant.characterId === characterId
      )
    : undefined;
}

/**
 * Pops up on the character sheet when the GM's combat is running and this character has no initiative yet.
 * The player rolls d20 + their sheet initiative or enters a result rolled elsewhere; either goes to the tracker.
 */
function InitiativePrompt({ character, membership, onPersistCharacter }: InitiativePromptProps) {
  const titleId = useId();
  const dispatch = useAppDispatch();
  const { characterId, partyGroupId } = membership;
  const [tracker, setTracker] = useState<CampaignLiveEncounterTrackerRecord | null>(null);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const [manualValue, setManualValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    getPartyGroupLiveEncounter(partyGroupId, { suppressFailureToast: true })
      .then(({ liveEncounterTracker }) =>
        setTracker(
          liveEncounterTracker ? normalizeLiveEncounterTracker(liveEncounterTracker) : null
        )
      )
      .catch(() => undefined);
  }, [partyGroupId]);

  useEffect(refresh, [refresh]);
  usePartyEvents(partyGroupId, refresh);

  const participant = getMyParticipant(tracker, characterId);
  const trackerKey = tracker ? `${tracker.preparedEncounterId}:${tracker.createdAt}` : null;
  const needsInitiative = Boolean(participant) && (participant?.initiative ?? null) === null;
  const bonus = getInitiativeForCharacter(character);

  const submit = useCallback(
    async (initiative: number) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const { liveEncounterTracker } = await updatePartyGroupLiveEncounterInitiative(
          partyGroupId,
          { characterId, initiative },
          { suppressFailureToast: true }
        );

        setTracker(
          liveEncounterTracker ? normalizeLiveEncounterTracker(liveEncounterTracker) : null
        );
        // Same side effects as the sheet's own initiative roll: marks the character as in combat.
        onPersistCharacter((currentCharacter) =>
          applyInitiativeRollCharacterEffects(currentCharacter, {
            usePersistentRageOnInitiative: false,
            usePurpleDragonRookRallyingCryOnInitiative: false,
            useZhentarimRuffianFamilyFirstOnInitiative: false,
            useTandemFootworkOnInitiative: false,
            useUncannyMetabolismOnInitiative: false,
            zhentarimRuffianFamilyFirstAvailable: false,
            tandemFootworkAvailable: false
          })
        );
        dispatch(
          showToast({
            text: `Initiative ${initiative} sent to the GM.`,
            type: "success",
            position: "bottom-middle",
            dismissMs: 3_000
          })
        );
      } catch (submitError) {
        setError(getDmToolsApiErrorMessage(submitError, "Unable to submit initiative."));
      } finally {
        setIsSubmitting(false);
      }
    },
    [characterId, dispatch, onPersistCharacter, partyGroupId]
  );

  if (!needsInitiative || !trackerKey || dismissedKey === trackerKey) {
    return null;
  }

  function handleRoll() {
    void submit(clampInitiative(rollD20("normal").total + bonus));
  }

  function handleManual(event: FormEvent) {
    event.preventDefault();

    const value = Number(manualValue);

    if (manualValue.trim() === "" || !Number.isInteger(value)) {
      setError("Enter a whole number.");
      return;
    }

    void submit(clampInitiative(value));
  }

  const signedBonus = bonus >= 0 ? `+${bonus}` : String(bonus);

  return (
    <SheetModal titleId={titleId} onClose={() => setDismissedKey(trackerKey)} isBusy={isSubmitting}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Roll for initiative</OverlayTitle>
          <OverlaySummary>
            The GM started {tracker?.preparedEncounterName ?? "combat"}. Roll or enter your result.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton
          label="Close initiative prompt"
          onClick={() => setDismissedKey(trackerKey)}
        />
      </OverlayHeader>

      <OverlayBody>
        <ActionButton onClick={handleRoll} loading={isSubmitting}>
          {`Roll d20 ${signedBonus}`}
        </ActionButton>
        <form className={styles.form} onSubmit={handleManual}>
          <label className={styles.label}>
            Or enter a result
            <input
              className={styles.input}
              type="number"
              inputMode="numeric"
              min={INITIATIVE_MIN}
              max={INITIATIVE_MAX}
              step={1}
              value={manualValue}
              onChange={(event) => setManualValue(event.target.value)}
            />
          </label>
          <ActionButton
            type="submit"
            variant="OUTLINE"
            fullWidth={false}
            size="sm"
            disabled={isSubmitting}
          >
            Submit
          </ActionButton>
        </form>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </OverlayBody>

      <OverlayFooter>
        <ActionButton variant="GHOST" fullWidth={false} onClick={() => setDismissedKey(trackerKey)}>
          Later
        </ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}

export default InitiativePrompt;
