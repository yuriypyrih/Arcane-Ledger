import { useState } from "react";
import CharacterList from "../../components/CharactersPage/CharacterList";
import { captureAppError } from "../../lib/sentry";
import { showToast, useAppDispatch, useAppSelector } from "../../store";
import JoinPartyGroupModal from "../DmToolsPage/JoinPartyGroupModal";
import { usePartyMemberships } from "../DmToolsPage/usePartyMemberships";
import { removeCharacterRosterEntry } from "./characterRoster";
import { getCharacterLimitForAuth } from "./characterLimits";
import { markPortableCharacterSheetDeleting } from "./portableCharacterSheet";
import {
  loadStoredPortableCharacterSheetByMatch,
  upsertStoredPortableCharacterSheet
} from "./portableCharacterSheetStorage";
import { resolvePortableCharacterSheetForRosterEntry } from "./resolvePortableCharacterSheet";
import { useCharacterSharing } from "./useCharacterSharing";
import { useCharacterRosterEntries } from "./useCharacterRosterEntries";
import styles from "./CharactersPage.module.css";

function CharactersPage() {
  const dispatch = useAppDispatch();
  const { status, user } = useAppSelector((state) => state.auth);
  const membershipsByCharacterId = useAppSelector(
    (state) => state.dmTools.membershipsByCharacterId
  );
  const ownerId = status === "authenticated" && user ? user.id : null;
  const characters = useCharacterRosterEntries(ownerId);
  const characterLimit = getCharacterLimitForAuth(status, user?.role);
  const [joinPartyModalOpen, setJoinPartyModalOpen] = useState(false);
  const {
    duplicateCharacter: handleDuplicateCharacter,
    importCharacter: handleImportCharacter,
    shareCharacter: handleShareCharacter
  } = useCharacterSharing({
    characters,
    ownerId,
    status,
    user
  });
  usePartyMemberships();

  function handleJoinPartyGroup() {
    if (status !== "authenticated") {
      dispatch(
        showToast({
          text: "Sign in to join a party group.",
          type: "warning"
        })
      );
      return;
    }

    setJoinPartyModalOpen(true);
  }

  async function handleDeleteCharacter(characterId: number) {
    const deletedCharacter = characters.find((character) => character.id === characterId);
    const remoteId = deletedCharacter?.remoteId;

    if (!deletedCharacter) {
      return;
    }

    if (status === "authenticated" && user) {
      let localRecord = loadStoredPortableCharacterSheetByMatch({
        clientId: deletedCharacter?.clientId,
        localId: characterId,
        remoteId
      });

      if (!localRecord && remoteId) {
        try {
          localRecord = await resolvePortableCharacterSheetForRosterEntry(deletedCharacter, {
            ownerId
          });
        } catch (error) {
          captureAppError(error, {
            area: "characters",
            action: "prepare-delete",
            extra: {
              clientId: deletedCharacter.clientId,
              localId: characterId,
              remoteId
            }
          });
          dispatch(
            showToast({
              text: "Unable to prepare character for cloud delete.",
              type: "error"
            })
          );
          return;
        }
      }

      if (localRecord) {
        try {
          upsertStoredPortableCharacterSheet(
            markPortableCharacterSheetDeleting(localRecord, user.id)
          );
        } catch (error) {
          captureAppError(error, {
            area: "characters",
            action: "mark-delete",
            extra: {
              clientId: deletedCharacter.clientId,
              localId: characterId,
              remoteId
            }
          });
          dispatch(
            showToast({
              text: "Unable to queue character deletion.",
              type: "error"
            })
          );
        }
        return;
      }
    }

    removeCharacterRosterEntry({
      clientId: deletedCharacter?.clientId,
      localId: characterId,
      remoteId
    });
  }

  return (
    <section className={styles.page}>
      <CharacterList
        canShareCharacters={Boolean(ownerId)}
        characters={characters}
        characterLimit={characterLimit}
        partyMembershipsByCharacterId={membershipsByCharacterId}
        onDeleteCharacter={handleDeleteCharacter}
        onDuplicateCharacter={handleDuplicateCharacter}
        onImportCharacter={handleImportCharacter}
        onJoinPartyGroup={handleJoinPartyGroup}
        onShareCharacter={handleShareCharacter}
      />
      {joinPartyModalOpen ? (
        <JoinPartyGroupModal characters={characters} onClose={() => setJoinPartyModalOpen(false)} />
      ) : null}
    </section>
  );
}

export default CharactersPage;
