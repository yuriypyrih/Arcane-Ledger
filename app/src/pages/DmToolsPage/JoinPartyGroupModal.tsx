import { Users } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { joinPartyGroup } from "../../api/partyGroups";
import ActionButton from "../../components/ActionButton";
import SelectInput from "../../components/CharactersPage/FormInputs/SelectInput";
import TextInput from "../../components/CharactersPage/FormInputs/TextInput";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../components/Overlay";
import {
  showToast,
  upsertPartyGroupRecord,
  upsertPartyMembership,
  useAppDispatch,
  useAppSelector
} from "../../store";
import type { CharacterRosterEntry } from "../CharactersPage/characterRoster";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import styles from "./DmToolsPage.module.css";

type JoinPartyGroupModalProps = {
  characters: CharacterRosterEntry[];
  onClose: () => void;
};

type JoinableCharacterRosterEntry = CharacterRosterEntry & {
  remoteId: string;
};

function isJoinableCharacter(
  character: CharacterRosterEntry,
  membershipsByCharacterId: Record<string, unknown>
): character is JoinableCharacterRosterEntry {
  return (
    Boolean(character.remoteId) &&
    character.syncStatus !== "deleting" &&
    !membershipsByCharacterId[character.remoteId ?? ""]
  );
}

function formatCharacterOptionLabel(character: JoinableCharacterRosterEntry): string {
  const ancestryAndClass = [character.species, character.className]
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .join(" ");

  return `${character.name} - Lv ${character.level}${ancestryAndClass ? ` ${ancestryAndClass}` : ""}`;
}

function JoinPartyGroupModal({ characters, onClose }: JoinPartyGroupModalProps) {
  const dispatch = useAppDispatch();
  const membershipsByCharacterId = useAppSelector(
    (state) => state.dmTools.membershipsByCharacterId
  );
  const [invite, setInvite] = useState("");
  const [characterId, setCharacterId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const eligibleCharacters = useMemo(
    () =>
      characters.filter((character) => isJoinableCharacter(character, membershipsByCharacterId)),
    [characters, membershipsByCharacterId]
  );
  const canSubmit = invite.trim().length > 0 && characterId.length > 0 && !isJoining;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setError(null);
    setIsJoining(true);

    try {
      const { membership, partyGroup } = await joinPartyGroup(invite.trim(), characterId, {
        suppressFailureToast: true
      });

      dispatch(upsertPartyGroupRecord(partyGroup));
      dispatch(upsertPartyMembership(membership));
      dispatch(
        showToast({
          text: "Character added to the Party",
          type: "success",
          position: "top-middle"
        })
      );
      onClose();
    } catch (joinError) {
      setError(getDmToolsApiErrorMessage(joinError, "Unable to join party group."));
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <SheetModal
      titleId="join-party-group-modal-title"
      onClose={onClose}
      isBusy={isJoining}
      busyLabel="Joining party group"
      size="small"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id="join-party-group-modal-title">Join Party Group</OverlayTitle>
          <OverlaySummary>Paste an invite URL and choose the character joining the party.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton
          label="Close join party group modal"
          disabled={isJoining}
          onClick={onClose}
        />
      </OverlayHeader>

      <form onSubmit={handleSubmit}>
        <OverlayBody>
          <label className={styles.modalField}>
            <span className={styles.modalFieldLabel}>Invite URL</span>
            <TextInput
              disabled={isJoining}
              invalid={Boolean(error)}
              value={invite}
              onChange={(event) => {
                setInvite(event.target.value);
                setError(null);
              }}
            />
          </label>

          <label className={styles.modalField}>
            <span className={styles.modalFieldLabel}>Character</span>
            <SelectInput
              disabled={isJoining || eligibleCharacters.length === 0}
              value={characterId}
              onChange={(event) => {
                setCharacterId(event.target.value);
                setError(null);
              }}
            >
              <option value="">-</option>
              {eligibleCharacters.map((character) => (
                <option key={character.remoteId} value={character.remoteId}>
                  {formatCharacterOptionLabel(character)}
                </option>
              ))}
            </SelectInput>
          </label>

          {eligibleCharacters.length === 0 ? (
            <p className={styles.modalCopy}>
              No eligible account characters are available. Characters already in a party are hidden.
            </p>
          ) : null}
          {error ? <p className={styles.modalError}>{error}</p> : null}
        </OverlayBody>

        <OverlayFooter>
          <div className={styles.modalFooterActions}>
            <ActionButton
              type="submit"
              icon={<Users size={16} aria-hidden="true" />}
              disabled={!canSubmit}
              loading={isJoining}
              loadingLabel="Joining party group"
              fullWidth
            >
              Join Party Group
            </ActionButton>
          </div>
        </OverlayFooter>
      </form>
    </SheetModal>
  );
}

export default JoinPartyGroupModal;
