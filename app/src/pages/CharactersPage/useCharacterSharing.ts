import {
  importCharacterSheets,
  importSharedCharacter,
  saveCharacterSheet,
  shareCharacterSheet
} from "../../api/characters";
import { ApiRequestFailedError } from "../../api/client";
import { dispatchCharacterSyncConflict } from "../../characterSync/characterSyncConflicts";
import {
  createPortableCharacterSheetSyncPayload,
  getPortableCharacterSheetSync
} from "../../characterSync/characterSyncRecords";
import { captureAppError } from "../../lib/sentry";
import { showToast, useAppDispatch } from "../../store";
import type { AuthStatus, AuthUser } from "../../types/auth";
import { createDuplicatePortableCharacterSheet } from "./characterDuplication";
import type { CharacterRosterEntry } from "./characterRoster";
import {
  ensurePortableCharacterSheetSyncMetadata,
  stripPortableCharacterSheetLocalSyncMetadata,
  withPortableCharacterSheetLocalId
} from "./portableCharacterSheet";
import { upsertStoredPortableCharacterSheet } from "./portableCharacterSheetStorage";
import {
  resolvePortableCharacterSheetForRosterEntry,
  storeCloudCharacterSheetDocument
} from "./resolvePortableCharacterSheet";

type UseCharacterSharingOptions = {
  characters: CharacterRosterEntry[];
  ownerId: string | null;
  status: AuthStatus;
  user: AuthUser | null;
};

function createImportedCharacterLocalId(characters: CharacterRosterEntry[]) {
  const usedIds = new Set(characters.map((character) => character.id));
  let localId = Date.now();

  while (usedIds.has(localId)) {
    localId += 1;
  }

  return localId;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiRequestFailedError || error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function shouldCaptureCharacterSharingError(error: unknown) {
  return !(error instanceof ApiRequestFailedError) || error.status === undefined || error.status >= 500;
}

function getRevisionConflictServerRevision(error: unknown) {
  if (!(error instanceof ApiRequestFailedError) || !error.details) {
    return undefined;
  }

  const details = error.details as { serverRevision?: unknown };
  const serverRevision = Number(details.serverRevision);

  return Number.isFinite(serverRevision) && serverRevision > 0 ? serverRevision : undefined;
}

function isRevisionConflictError(error: unknown) {
  return (
    error instanceof ApiRequestFailedError &&
    error.status === 409 &&
    error.code === "REVISION_CONFLICT"
  );
}

export function useCharacterSharing({
  characters,
  ownerId,
  status,
  user
}: UseCharacterSharingOptions) {
  const dispatch = useAppDispatch();

  async function syncCharacterForSharing(character: CharacterRosterEntry) {
    if (status !== "authenticated" || !user || !ownerId) {
      throw new Error("Sign in to share a character.");
    }

    const portableRecord = await resolvePortableCharacterSheetForRosterEntry(character, {
      ownerId
    });

    if (!portableRecord) {
      throw new Error("Character sheet is not available on this device.");
    }

    const sync = getPortableCharacterSheetSync(portableRecord);
    const remoteId = sync?.remoteId ?? character.remoteId;

    if (sync?.syncStatus === "conflict") {
      throw new Error("Resolve this character's sync conflict before sharing.");
    }

    if (sync?.syncStatus === "deleting") {
      throw new Error("This character is queued for deletion and cannot be shared.");
    }

    if (remoteId && sync?.syncStatus === "synced") {
      return remoteId;
    }

    try {
      if (remoteId) {
        const { character: savedCharacter } = await saveCharacterSheet(
          remoteId,
          createPortableCharacterSheetSyncPayload(portableRecord, {
            includeBaseRevision: true,
            ownerId
          }),
          { suppressFailureToast: true }
        );

        return storeCloudCharacterSheetDocument(savedCharacter, {
          localId: portableRecord.identity.localId
        }).metadata?.sync?.remoteId ?? savedCharacter.id;
      }

      const { characters: importedCharacters } = await importCharacterSheets(
        [
          createPortableCharacterSheetSyncPayload(portableRecord, {
            ownerId
          })
        ],
        { suppressFailureToast: true }
      );
      const importedCharacter = importedCharacters[0];

      if (!importedCharacter) {
        throw new Error("Character sync did not return a cloud sheet.");
      }

      return storeCloudCharacterSheetDocument(importedCharacter, {
        localId: portableRecord.identity.localId
      }).metadata?.sync?.remoteId ?? importedCharacter.id;
    } catch (error) {
      if (isRevisionConflictError(error)) {
        dispatchCharacterSyncConflict({
          ...(sync?.clientId ? { clientId: sync.clientId } : {}),
          localId: portableRecord.identity.localId,
          ...(remoteId ? { remoteId } : {}),
          serverRevision: getRevisionConflictServerRevision(error),
          message: "Resolve this character's sync conflict before sharing."
        });
        throw new Error("Resolve this character's sync conflict before sharing.");
      }

      throw error;
    }
  }

  async function shareCharacter(character: CharacterRosterEntry) {
    try {
      const remoteId = await syncCharacterForSharing(character);
      const { link } = await shareCharacterSheet(remoteId, { suppressFailureToast: true });

      return link;
    } catch (error) {
      if (
        !(error instanceof Error && error.message.includes("sync conflict")) &&
        shouldCaptureCharacterSharingError(error)
      ) {
        captureAppError(error, {
          area: "characters",
          action: "share",
          extra: {
            clientId: character.clientId,
            localId: character.id,
            remoteId: character.remoteId
          }
        });
      }

      const message = getApiErrorMessage(error, "Unable to generate a share link.");

      dispatch(
        showToast({
          text: message,
          type: "error"
        })
      );
      throw new Error(message);
    }
  }

  async function importCharacter(link: string) {
    const localId = createImportedCharacterLocalId(characters);

    try {
      const result = await importSharedCharacter(link, localId, { suppressFailureToast: true });

      if (result.mode === "cloud") {
        const importedRecord = storeCloudCharacterSheetDocument(result.character, { localId });

        dispatch(
          showToast({
            text: "Character imported to your account.",
            type: "success"
          })
        );
        return importedRecord.identity.localId;
      }

      const importedRecord = upsertStoredPortableCharacterSheet(
        ensurePortableCharacterSheetSyncMetadata(
          withPortableCharacterSheetLocalId(
            stripPortableCharacterSheetLocalSyncMetadata(result.sheet),
            localId
          ),
          { syncStatus: "local-only" }
        )
      );

      dispatch(
        showToast({
          text: "Character imported to local storage.",
          type: "success"
        })
      );
      return importedRecord.identity.localId;
    } catch (error) {
      if (shouldCaptureCharacterSharingError(error)) {
        captureAppError(error, {
          area: "characters",
          action: "shared-import",
          extra: {
            link
          }
        });
      }
      const message = getApiErrorMessage(error, "Unable to import character.");

      dispatch(
        showToast({
          text: message,
          type: "error"
        })
      );
      throw new Error(message);
    }
  }

  async function duplicateCharacter(character: CharacterRosterEntry) {
    const localId = createImportedCharacterLocalId(characters);

    try {
      const portableRecord = await resolvePortableCharacterSheetForRosterEntry(character, {
        ownerId
      });

      if (!portableRecord) {
        throw new Error("Character sheet is not available on this device.");
      }

      const duplicateRecord = createDuplicatePortableCharacterSheet(portableRecord, localId);

      if (status === "authenticated" && user && ownerId) {
        const syncedDuplicateRecord = ensurePortableCharacterSheetSyncMetadata(duplicateRecord, {
          ownerId,
          syncStatus: "dirty"
        });
        const { characters: importedCharacters } = await importCharacterSheets(
          [
            createPortableCharacterSheetSyncPayload(syncedDuplicateRecord, {
              ownerId
            })
          ],
          { suppressFailureToast: true }
        );
        const importedCharacter = importedCharacters[0];

        if (!importedCharacter) {
          throw new Error("Character duplicate did not return a cloud sheet.");
        }

        const duplicatedRecord = storeCloudCharacterSheetDocument(importedCharacter, { localId });

        dispatch(
          showToast({
            text: "Character duplicated to your account.",
            type: "success"
          })
        );
        return duplicatedRecord.identity.localId;
      }

      const duplicatedRecord = upsertStoredPortableCharacterSheet(
        ensurePortableCharacterSheetSyncMetadata(duplicateRecord, {
          syncStatus: "local-only"
        })
      );

      dispatch(
        showToast({
          text: "Character duplicated in local storage.",
          type: "success"
        })
      );
      return duplicatedRecord.identity.localId;
    } catch (error) {
      if (shouldCaptureCharacterSharingError(error)) {
        captureAppError(error, {
          area: "characters",
          action: "duplicate",
          extra: {
            clientId: character.clientId,
            localId: character.id,
            remoteId: character.remoteId
          }
        });
      }

      const message = getApiErrorMessage(error, "Unable to duplicate character.");

      dispatch(
        showToast({
          text: message,
          type: "error"
        })
      );
      throw new Error(message);
    }
  }

  return {
    duplicateCharacter,
    importCharacter,
    shareCharacter
  };
}
