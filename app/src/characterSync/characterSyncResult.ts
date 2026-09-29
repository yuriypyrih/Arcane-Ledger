import type { PortableCharacterSheet } from "../types";
import { markPortableCharacterSheetSyncError } from "../pages/CharactersPage/portableCharacterSheet";
import {
  getPortableCharacterSheetSync,
  isPortableCharacterSheetOwnedBy
} from "./characterSyncRecords";

export function getSyncRecordKey(record: PortableCharacterSheet) {
  const sync = getPortableCharacterSheetSync(record);

  return sync?.clientId ?? `local-${record.identity.localId}`;
}

export function replaceSyncedRecord(options: {
  nextRecord: PortableCharacterSheet;
  ownerId: string;
  records: PortableCharacterSheet[];
  sentLocalRevision: number;
  targetKey: string;
}) {
  return options.records.map((record) => {
    if (
      getSyncRecordKey(record) !== options.targetKey ||
      !isPortableCharacterSheetOwnedBy(record, options.ownerId)
    ) {
      return record;
    }

    const currentSync = getPortableCharacterSheetSync(record);
    const nextSync = getPortableCharacterSheetSync(options.nextRecord);

    // A queued delete must not become dirty/synced again when an older upload settles.
    // An import may still supply the remote id needed to finish that delete.
    if (currentSync?.syncStatus === "deleting" && nextSync?.syncStatus !== "deleting") {
      return nextSync?.syncStatus === "synced"
        ? {
            ...record,
            metadata: {
              ...record.metadata!,
              sync: {
                ...currentSync,
                remoteId: nextSync.remoteId,
                remoteRevision: nextSync.remoteRevision
              }
            }
          }
        : record;
    }

    if (
      currentSync &&
      nextSync &&
      currentSync.localRevision > options.sentLocalRevision &&
      (nextSync.syncStatus === "conflict" || nextSync.syncStatus === "error")
    ) {
      return markPortableCharacterSheetSyncError(
        record,
        nextSync.lastSyncError ?? "Unable to sync character sheet.",
        nextSync.syncStatus
      );
    }

    if (
      currentSync &&
      nextSync &&
      currentSync.localRevision > options.sentLocalRevision &&
      nextSync.syncStatus === "synced"
    ) {
      return {
        ...record,
        metadata: {
          ...(record.metadata ?? {}),
          sheetSizeBytes: record.metadata?.sheetSizeBytes ?? record.summary.sheetSizeBytes ?? 0,
          sync: {
            ...currentSync,
            ownerId: options.ownerId,
            remoteId: nextSync.remoteId,
            remoteRevision: nextSync.remoteRevision,
            syncStatus: "dirty" as const,
            lastSyncedAt: nextSync.lastSyncedAt
          }
        }
      };
    }

    return options.nextRecord;
  });
}
