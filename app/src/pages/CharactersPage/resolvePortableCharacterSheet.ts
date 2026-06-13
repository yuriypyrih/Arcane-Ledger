import {
  getCharacterSheet,
  listCharacterSheets,
  type CharacterSheetCloudDocument,
  type CharacterSheetRosterDocument
} from "../../api/characters";
import { ApiOfflineError } from "../../api/client";
import {
  getCharacterSheetUnavailableCode,
  getCharacterSheetUnavailableMessageForCode,
  isCharacterSheetUnavailableError,
  type CharacterSheetUnavailableCode
} from "../../api/characterSheetErrors";
import { dispatchCharacterSyncConflict } from "../../characterSync/characterSyncConflicts";
import {
  applyCloudDocumentToPortableCharacterSheet,
  getPortableCharacterSheetSync
} from "../../characterSync/characterSyncRecords";
import type { PortableCharacterSheet } from "../../types";
import {
  detachPortableCharacterSheetCloudSync,
  markPortableCharacterSheetSyncError,
  withPortableCharacterSheetLocalId
} from "./portableCharacterSheet";
import {
  loadStoredPortableCharacterSheetByMatch,
  upsertStoredPortableCharacterSheet
} from "./portableCharacterSheetStorage";
import {
  loadCharacterRosterCache,
  saveCharacterRosterCache,
  upsertCharacterRosterCacheDocument,
  type CharacterRosterEntry
} from "./characterRoster";

const locallyPreferredSyncStatuses = new Set([
  "dirty",
  "error",
  "conflict",
  "syncing",
  "deleting"
]);

export class CharacterSheetCloudUnavailableError extends Error {
  readonly code: CharacterSheetUnavailableCode;
  readonly localId: number;

  constructor(code: CharacterSheetUnavailableCode, localId: number) {
    super(getCharacterSheetUnavailableMessageForCode(code));
    this.name = "CharacterSheetCloudUnavailableError";
    this.code = code;
    this.localId = localId;
  }
}

export function isCharacterSheetCloudUnavailableError(
  error: unknown
): error is CharacterSheetCloudUnavailableError {
  return error instanceof CharacterSheetCloudUnavailableError;
}

function getRosterDocumentLocalId(document: CharacterSheetRosterDocument) {
  return document.localId ?? document.summary.localId;
}

function findRosterDocument(
  documents: CharacterSheetRosterDocument[],
  options: {
    clientId?: string | null;
    localId?: number | null;
    remoteId?: string | null;
  }
) {
  return documents.find(
    (document) =>
      (options.remoteId && document.id === options.remoteId) ||
      (options.clientId && document.clientId === options.clientId) ||
      (options.localId && getRosterDocumentLocalId(document) === options.localId)
  );
}

function isServerRevisionNewer(
  document: Pick<CharacterSheetCloudDocument, "revision">,
  localRecord: PortableCharacterSheet | null
) {
  const sync = localRecord ? getPortableCharacterSheetSync(localRecord) : undefined;
  const localRemoteRevision = sync?.remoteRevision ?? 0;

  return document.revision > localRemoteRevision;
}

function isLocalRecordDirty(record: PortableCharacterSheet | null) {
  const sync = record ? getPortableCharacterSheetSync(record) : undefined;

  return Boolean(sync?.syncStatus && locallyPreferredSyncStatuses.has(sync.syncStatus));
}

function toRosterDocument(document: CharacterSheetCloudDocument): CharacterSheetRosterDocument {
  const { sheet: _sheet, ...rosterDocument } = document;

  return rosterDocument;
}

export async function refreshCharacterCloudRoster(ownerId: string) {
  const roster = await listCharacterSheets({ suppressFailureToast: true });

  saveCharacterRosterCache(ownerId, roster.characters);
  return roster.characters;
}

async function refreshCharacterCloudRosterBestEffort(ownerId: string) {
  try {
    return await refreshCharacterCloudRoster(ownerId);
  } catch {
    return [];
  }
}

export function storeCloudCharacterSheetDocument(
  document: CharacterSheetCloudDocument,
  options: { localId?: number | null } = {}
) {
  const portableRecord = applyCloudDocumentToPortableCharacterSheet(document);
  const stableRecord =
    options.localId && Number.isFinite(options.localId) && options.localId > 0
      ? withPortableCharacterSheetLocalId(portableRecord, options.localId)
      : portableRecord;

  const storedRecord = upsertStoredPortableCharacterSheet(stableRecord);

  upsertCharacterRosterCacheDocument(document.ownerId, toRosterDocument(document));
  return storedRecord;
}

function markLocalRecordConflict(
  record: PortableCharacterSheet,
  options: { message: string; serverRevision?: number }
) {
  const conflictRecord = markPortableCharacterSheetSyncError(record, options.message, "conflict");
  const sync = getPortableCharacterSheetSync(conflictRecord);

  upsertStoredPortableCharacterSheet(conflictRecord);
  dispatchCharacterSyncConflict({
    ...(sync?.clientId ? { clientId: sync.clientId } : {}),
    localId: conflictRecord.identity.localId,
    message: options.message,
    ...(sync?.remoteId ? { remoteId: sync.remoteId } : {}),
    ...(options.serverRevision ? { serverRevision: options.serverRevision } : {})
  });
  return conflictRecord;
}

function detachUnavailableCloudRecord(
  record: PortableCharacterSheet,
  code: CharacterSheetUnavailableCode
) {
  return upsertStoredPortableCharacterSheet(
    detachPortableCharacterSheetCloudSync(
      record,
      getCharacterSheetUnavailableMessageForCode(code)
    )
  );
}

function loadLatestLocalRecordForOpen(options: {
  characterId: number;
  clientId?: string | null;
  remoteId?: string | null;
}) {
  return loadStoredPortableCharacterSheetByMatch({
    clientId: options.clientId,
    localId: options.characterId,
    remoteId: options.remoteId
  });
}

async function recoverCloudCharacterSheetForOpen(options: {
  characterId: number;
  clientId?: string | null;
  ownerId: string;
}) {
  const rosterDocuments = await refreshCharacterCloudRosterBestEffort(options.ownerId);
  const rosterDocument = findRosterDocument(rosterDocuments, {
    clientId: options.clientId,
    localId: options.characterId
  });

  if (!rosterDocument) {
    return null;
  }

  try {
    return (await getCharacterSheet(rosterDocument.id, { suppressFailureToast: true })).character;
  } catch (error) {
    if (isCharacterSheetUnavailableError(error)) {
      return null;
    }

    throw error;
  }
}

async function fetchCloudCharacterSheetForOpen(options: {
  cachedRosterEntry?: CharacterRosterEntry;
  characterId: number;
  localSync?: ReturnType<typeof getPortableCharacterSheetSync>;
  ownerId: string;
}) {
  const directRemoteId = options.localSync?.remoteId ?? options.cachedRosterEntry?.remoteId;

  if (directRemoteId) {
    return (await getCharacterSheet(directRemoteId, { suppressFailureToast: true })).character;
  }

  const rosterDocuments = await refreshCharacterCloudRoster(options.ownerId);
  const rosterDocument =
    findRosterDocument(rosterDocuments, {
      clientId: options.localSync?.clientId ?? options.cachedRosterEntry?.clientId,
      localId: options.characterId,
      remoteId: options.localSync?.remoteId ?? options.cachedRosterEntry?.remoteId
    }) ??
    (options.cachedRosterEntry?.remoteId
      ? rosterDocuments.find((document) => document.id === options.cachedRosterEntry?.remoteId)
      : undefined);

  if (!rosterDocument) {
    return null;
  }

  return (await getCharacterSheet(rosterDocument.id, { suppressFailureToast: true })).character;
}

export async function resolvePortableCharacterSheetForOpen(
  characterId: number,
  options: { ownerId?: string | null } = {}
): Promise<PortableCharacterSheet | null> {
  if (!Number.isFinite(characterId) || characterId <= 0) {
    return null;
  }

  const localRecord = loadStoredPortableCharacterSheetByMatch({ localId: characterId });
  const localSync = localRecord ? getPortableCharacterSheetSync(localRecord) : undefined;

  if (!options.ownerId) {
    return localRecord;
  }

  const cachedRosterEntry = loadCharacterRosterCache(options.ownerId).find(
    (entry) => entry.id === characterId
  );
  let cloudDocument: CharacterSheetCloudDocument | null;

  try {
    cloudDocument = await fetchCloudCharacterSheetForOpen({
      cachedRosterEntry,
      characterId,
      localSync,
      ownerId: options.ownerId
    });
  } catch (error) {
    if (error instanceof ApiOfflineError) {
      return localRecord;
    }

    const unavailableCode = getCharacterSheetUnavailableCode(error);

    if (unavailableCode) {
      const recoveredCloudDocument = await recoverCloudCharacterSheetForOpen({
        characterId,
        clientId: localSync?.clientId ?? cachedRosterEntry?.clientId,
        ownerId: options.ownerId
      });

      if (recoveredCloudDocument) {
        return storeCloudCharacterSheetDocument(recoveredCloudDocument, { localId: characterId });
      }

      if (localRecord) {
        detachUnavailableCloudRecord(localRecord, unavailableCode);
      }

      throw new CharacterSheetCloudUnavailableError(unavailableCode, characterId);
    }

    throw error;
  }

  const latestLocalRecord = loadLatestLocalRecordForOpen({
    characterId,
    clientId: localSync?.clientId ?? cachedRosterEntry?.clientId ?? cloudDocument?.clientId,
    remoteId: localSync?.remoteId ?? cachedRosterEntry?.remoteId ?? cloudDocument?.id
  });

  if (!cloudDocument) {
    return latestLocalRecord;
  }

  if (!latestLocalRecord) {
    if (localRecord) {
      return null;
    }

    return storeCloudCharacterSheetDocument(cloudDocument, { localId: characterId });
  }

  if (!isServerRevisionNewer(cloudDocument, latestLocalRecord)) {
    return latestLocalRecord;
  }

  if (isLocalRecordDirty(latestLocalRecord)) {
    return markLocalRecordConflict(latestLocalRecord, {
      message: "This character has unsynced local changes and a newer cloud revision.",
      serverRevision: cloudDocument.revision
    });
  }

  return storeCloudCharacterSheetDocument(cloudDocument, { localId: characterId });
}

export async function resolvePortableCharacterSheetForRosterEntry(
  entry: CharacterRosterEntry,
  options: { ownerId?: string | null } = {}
) {
  const localRecord = loadStoredPortableCharacterSheetByMatch({
    clientId: entry.clientId,
    localId: entry.id,
    remoteId: entry.remoteId
  });

  if (localRecord) {
    return localRecord;
  }

  if (!options.ownerId || !entry.remoteId) {
    return null;
  }

  const { character } = await getCharacterSheet(entry.remoteId, { suppressFailureToast: true });

  return storeCloudCharacterSheetDocument(character, { localId: entry.id });
}
