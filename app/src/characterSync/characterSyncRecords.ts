import type { CharacterSheetCloudDocument, CharacterSheetSyncPayload } from "../api/characters";
import {
  applyCloudSyncMetadataToPortableCharacterSheet,
  ensurePortableCharacterSheetSyncMetadata,
  normalizeCharacterSyncMetadata,
  stripPortableCharacterSheetLocalSyncMetadata
} from "../pages/CharactersPage/portableCharacterSheet";
import type { PortableCharacterSheet, CharacterSheetSyncStatus } from "../types";

const locallyPreferredSyncStatuses = new Set<CharacterSheetSyncStatus>([
  "dirty",
  "syncing",
  "deleting",
  "conflict",
  "error"
]);

export function getPortableCharacterSheetSync(record: PortableCharacterSheet) {
  return normalizeCharacterSyncMetadata(record.metadata?.sync);
}

export function isPortableCharacterSheetOwnedBy(record: PortableCharacterSheet, ownerId: string) {
  return getPortableCharacterSheetSync(record)?.ownerId === ownerId;
}

export function getUnclaimedPortableCharacterSheets(
  records: PortableCharacterSheet[],
  ownerId: string
) {
  return records.filter((record) => !isPortableCharacterSheetOwnedBy(record, ownerId));
}

export function isPortableCharacterSheetCloudDirty(record: PortableCharacterSheet) {
  const sync = getPortableCharacterSheetSync(record);

  return Boolean(sync?.ownerId && locallyPreferredSyncStatuses.has(sync.syncStatus));
}

function getRecordMergeKey(record: PortableCharacterSheet) {
  const sync = getPortableCharacterSheetSync(record);

  if (sync?.remoteId) {
    return `remote:${sync.remoteId}`;
  }

  if (sync?.clientId) {
    return `client:${sync.clientId}`;
  }

  return `local:${record.identity.localId}`;
}

export function mergeCurrentUserPortableCharacterSheets(options: {
  ownerId: string;
  localRecords: PortableCharacterSheet[];
  cloudRecords: PortableCharacterSheet[];
}) {
  const mergedRecords = new Map<string, PortableCharacterSheet>();

  options.cloudRecords.forEach((record) => {
    mergedRecords.set(getRecordMergeKey(record), record);
  });

  options.localRecords
    .filter((record) => isPortableCharacterSheetOwnedBy(record, options.ownerId))
    .forEach((record) => {
      const key = getRecordMergeKey(record);
      const existingRecord = mergedRecords.get(key);

      if (!existingRecord || isPortableCharacterSheetCloudDirty(record)) {
        mergedRecords.set(key, record);
      }
    });

  return [...mergedRecords.values()];
}

export function applyCloudDocumentToPortableCharacterSheet(record: CharacterSheetCloudDocument) {
  return applyCloudSyncMetadataToPortableCharacterSheet(record.sheet, {
    ownerId: record.ownerId,
    remoteId: record.id,
    remoteRevision: record.revision,
    clientId: record.clientId,
    syncedAt: record.updatedAt ?? undefined
  });
}

export function createPortableCharacterSheetSyncPayload(
  record: PortableCharacterSheet,
  options: { force?: boolean; ownerId?: string; includeBaseRevision?: boolean } = {}
): CharacterSheetSyncPayload {
  const syncedRecord = ensurePortableCharacterSheetSyncMetadata(record, {
    ownerId: options.ownerId
  });
  const sync = getPortableCharacterSheetSync(syncedRecord);

  if (!sync) {
    throw new Error("Portable character sheet is missing sync metadata.");
  }

  return {
    clientId: sync.clientId,
    ...(options.force ? { force: true } : {}),
    localId: syncedRecord.identity.localId,
    ...(options.includeBaseRevision && sync.remoteRevision
      ? { baseRevision: sync.remoteRevision }
      : {}),
    sheet: stripPortableCharacterSheetLocalSyncMetadata(syncedRecord)
  };
}
