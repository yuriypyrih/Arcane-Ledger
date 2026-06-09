import type { CharacterSheetCloudDocument, CharacterSheetSyncPayload } from "../api/characters";
import { captureAppError } from "../lib/sentry";
import {
  applyCloudSyncMetadataToPortableCharacterSheet,
  createHydratedCharacterInputFromPortableSheet,
  ensurePortableCharacterSheetSyncMetadata,
  normalizeCharacterBackgroundTextureMetadata,
  normalizeCharacterAvatarMetadata,
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
  const syncedRecord = applyCloudSyncMetadataToPortableCharacterSheet(record.sheet, {
    ownerId: record.ownerId,
    remoteId: record.id,
    remoteRevision: record.revision,
    clientId: record.clientId,
    syncedAt: record.updatedAt ?? undefined
  });
  const avatar = normalizeCharacterAvatarMetadata(record.avatar);
  const backgroundTexture = normalizeCharacterBackgroundTextureMetadata(record.backgroundTexture);
  const {
    avatar: _avatar,
    backgroundTexture: _backgroundTexture,
    ...metadataWithoutCloudFields
  } = syncedRecord.metadata ?? {
    sheetSizeBytes: 0
  };

  return {
    ...syncedRecord,
    metadata: {
      ...metadataWithoutCloudFields,
      sheetSizeBytes: metadataWithoutCloudFields.sheetSizeBytes ?? 0,
      ...(avatar ? { avatar } : {}),
      ...(backgroundTexture ? { backgroundTexture } : {})
    }
  };
}

async function withEncounterStatBlockSummary(
  record: PortableCharacterSheet
): Promise<PortableCharacterSheet> {
  try {
    const [{ normalizeCharacter }, { createEncounterStatBlockSummary }] = await Promise.all([
      import("../pages/CharactersPage/storage"),
      import("../pages/CharactersPage/encounterStatBlockSummary")
    ]);
    const character = normalizeCharacter(createHydratedCharacterInputFromPortableSheet(record));

    if (!character) {
      throw new Error("Unable to generate encounter stat block summary for sync.");
    }

    return {
      ...record,
      summary: {
        ...record.summary,
        encounterStatBlock: createEncounterStatBlockSummary(character)
      }
    };
  } catch (error) {
    captureAppError(error, {
      area: "character-sync",
      action: "encounter-stat-block-summary",
      level: "warning",
      extra: {
        localId: record.identity.localId,
        clientId: normalizeCharacterSyncMetadata(record.metadata?.sync)?.clientId
      }
    });

    return record;
  }
}

export async function createPortableCharacterSheetSyncPayload(
  record: PortableCharacterSheet,
  options: { force?: boolean; ownerId?: string; includeBaseRevision?: boolean } = {}
): Promise<CharacterSheetSyncPayload> {
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
    sheet: stripPortableCharacterSheetLocalSyncMetadata(
      await withEncounterStatBlockSummary(syncedRecord)
    )
  };
}
