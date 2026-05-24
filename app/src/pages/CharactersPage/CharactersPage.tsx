import CharacterList from "../../components/CharactersPage/CharacterList";
import { downloadPortableCharacterSheetExport } from "../../components/CharactersPage/CharacterList/characterExport";
import { captureAppError } from "../../lib/sentry";
import { showToast, useAppDispatch, useAppSelector } from "../../store";
import type { CharacterRosterEntry } from "./characterRoster";
import { removeCharacterRosterEntry } from "./characterRoster";
import { getCharacterLimitForAuth } from "./characterLimits";
import { markPortableCharacterSheetDeleting } from "./portableCharacterSheet";
import {
  loadStoredPortableCharacterSheetByMatch,
  upsertStoredPortableCharacterSheet
} from "./portableCharacterSheetStorage";
import { resolvePortableCharacterSheetForRosterEntry } from "./resolvePortableCharacterSheet";
import { useCharacterRosterEntries } from "./useCharacterRosterEntries";
import styles from "./CharactersPage.module.css";

function CharactersPage() {
  const dispatch = useAppDispatch();
  const { status, user } = useAppSelector((state) => state.auth);
  const ownerId = status === "authenticated" && user ? user.id : null;
  const characters = useCharacterRosterEntries(ownerId);
  const characterLimit = getCharacterLimitForAuth(status, user?.role);

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

  async function handleDownloadCharacter(character: CharacterRosterEntry) {
    try {
      const portableRecord = await resolvePortableCharacterSheetForRosterEntry(character, {
        ownerId
      });

      if (!portableRecord) {
        dispatch(
          showToast({
            text: "Character sheet is not available on this device.",
            type: "error"
          })
        );
        return;
      }

      downloadPortableCharacterSheetExport(portableRecord);
    } catch (error) {
      captureAppError(error, {
        area: "characters",
        action: "export",
        extra: {
          clientId: character.clientId,
          localId: character.id,
          remoteId: character.remoteId
        }
      });
      dispatch(
        showToast({
          text: "Unable to export character sheet.",
          type: "error"
        })
      );
    }
  }

  return (
    <section className={styles.page}>
      <CharacterList
        characters={characters}
        characterLimit={characterLimit}
        onDownloadCharacter={handleDownloadCharacter}
        onDeleteCharacter={handleDeleteCharacter}
      />
    </section>
  );
}

export default CharactersPage;
