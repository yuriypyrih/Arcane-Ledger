import { type FormEvent, useId, useState } from "react";
import {
  updatePartyGroupLiveEncounterInitiative,
  type PartyMembershipRecord
} from "../../../../api/partyGroups";
import { getDmToolsApiErrorMessage } from "../../../../pages/DmToolsPage/dmToolsApiErrors";
import {
  clampInitiative,
  INITIATIVE_MAX,
  INITIATIVE_MIN
} from "../../../../pages/DmToolsPage/liveEncounterInitiative";
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
import styles from "../GameplayForm/PartyInitiativeSubmit.module.css";

type InitiativeRerollModalProps = {
  character: Character;
  currentInitiative: number;
  membership: PartyMembershipRecord;
  onClose: () => void;
  pendingInitiative: number | null;
};

/**
 * Shown when a player rolls initiative again while combat already has their result. The new value is
 * sent to the GM as a request and only replaces the first one if the GM approves.
 */
function InitiativeRerollModal({
  character,
  currentInitiative,
  membership,
  onClose,
  pendingInitiative
}: InitiativeRerollModalProps) {
  const titleId = useId();
  const dispatch = useAppDispatch();
  const [manualValue, setManualValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bonus = getInitiativeForCharacter(character);
  const signedBonus = bonus >= 0 ? `+${bonus}` : String(bonus);

  async function submit(initiative: number) {
    setIsSubmitting(true);
    setError(null);

    try {
      await updatePartyGroupLiveEncounterInitiative(
        membership.partyGroupId,
        { characterId: membership.characterId, initiative },
        { suppressFailureToast: true }
      );
      dispatch(
        showToast({
          text: `Re-roll (${initiative}) sent to your GM for approval.`,
          type: "success",
          position: "bottom-middle",
          dismissMs: 4_000
        })
      );
      onClose();
    } catch (submitError) {
      setError(getDmToolsApiErrorMessage(submitError, "Unable to send the re-roll to your GM."));
      setIsSubmitting(false);
    }
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

  return (
    <SheetModal titleId={titleId} onClose={onClose} isBusy={isSubmitting}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>You already rolled initiative</OverlayTitle>
          <OverlaySummary>
            {`You rolled ${currentInitiative} this combat. Rolling again needs your GM's approval.`}
            {pendingInitiative !== null
              ? ` A re-roll of ${pendingInitiative} is already waiting; a new one replaces it.`
              : ""}
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close re-roll prompt" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody>
        <ActionButton
          loading={isSubmitting}
          onClick={() => void submit(clampInitiative(rollD20("normal").total + bonus))}
        >
          {`Roll d20 ${signedBonus} and ask the GM`}
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
            Ask the GM
          </ActionButton>
        </form>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </OverlayBody>

      <OverlayFooter>
        <ActionButton variant="GHOST" fullWidth={false} onClick={onClose}>
          Keep my roll
        </ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}

export default InitiativeRerollModal;
