import type { PortableCharacterSheet } from "../../types";
import { captureAppError } from "../../lib/sentry";
import {
  ensurePortableCharacterSheetSyncMetadata,
  getPortableCharacterSheetLocalId,
  isPortableCharacterSheet,
  normalizeCharacterSyncMetadata
} from "./portableCharacterSheet";
import { CHARACTERS_STORAGE_KEY } from "./storageKeys";

export const CHARACTER_STORAGE_CHANGED_EVENT = "arcane-ledger:characters-storage-changed";

let storedCharacterRecordsCache: unknown[] | null = null;

export function dispatchCharacterStorageChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(CHARACTER_STORAGE_CHANGED_EVENT));
}

export function loadRawStoredCharacterRecords(): unknown[] {
  if (storedCharacterRecordsCache) {
    return storedCharacterRecordsCache;
  }

  if (typeof window === "undefined") {
    return [];
  }

  const serializedCharacters = window.localStorage.getItem(CHARACTERS_STORAGE_KEY);
  if (!serializedCharacters) {
    storedCharacterRecordsCache = [];
    return storedCharacterRecordsCache;
  }

  try {
    const parsedCharacters = JSON.parse(serializedCharacters) as unknown;
    storedCharacterRecordsCache = Array.isArray(parsedCharacters) ? parsedCharacters : [];

    return storedCharacterRecordsCache;
  } catch (error) {
    captureAppError(error, {
      area: "characters",
      action: "read-storage",
      extra: {
        storageKey: CHARACTERS_STORAGE_KEY
      }
    });
    storedCharacterRecordsCache = [];
    return storedCharacterRecordsCache;
  }
}

export function replaceRawStoredCharacterRecords(characters: unknown[]) {
  if (typeof window === "undefined") {
    return;
  }

  storedCharacterRecordsCache = characters;
  try {
    window.localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(characters));
  } catch (error) {
    captureAppError(error, {
      area: "characters",
      action: "write-storage",
      extra: {
        recordCount: characters.length,
        storageKey: CHARACTERS_STORAGE_KEY
      }
    });
    throw error;
  }
  dispatchCharacterStorageChanged();
}

export function clearRawStoredCharacters() {
  storedCharacterRecordsCache = [];

  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CHARACTERS_STORAGE_KEY);
  dispatchCharacterStorageChanged();
}

export function getRawStoredCharacterId(character: unknown): number | null {
  return getPortableCharacterSheetLocalId(character);
}

function getPortableCharacterSheetMatchKey(record: PortableCharacterSheet) {
  const sync = normalizeCharacterSyncMetadata(record.metadata?.sync);

  if (sync?.remoteId) {
    return `remote:${sync.remoteId}`;
  }

  if (sync?.clientId) {
    return `client:${sync.clientId}`;
  }

  return `local:${record.identity.localId}`;
}

function doesPortableCharacterSheetMatch(
  record: PortableCharacterSheet,
  match: {
    clientId?: string | null;
    localId?: number | null;
    remoteId?: string | null;
  }
) {
  const sync = normalizeCharacterSyncMetadata(record.metadata?.sync);

  return (
    (match.remoteId && sync?.remoteId === match.remoteId) ||
    (match.clientId && sync?.clientId === match.clientId) ||
    (match.localId !== null &&
      match.localId !== undefined &&
      getPortableCharacterSheetLocalId(record) === match.localId)
  );
}

export function loadStoredPortableCharacterSheetByMatch(match: {
  clientId?: string | null;
  localId?: number | null;
  remoteId?: string | null;
}): PortableCharacterSheet | null {
  const matchingRecord = loadRawStoredCharacterRecords().find((record) => {
    if (!isPortableCharacterSheet(record)) {
      return false;
    }

    return doesPortableCharacterSheetMatch(record, match);
  });

  return matchingRecord && isPortableCharacterSheet(matchingRecord)
    ? ensurePortableCharacterSheetSyncMetadata(matchingRecord)
    : null;
}

export function upsertStoredPortableCharacterSheet(record: PortableCharacterSheet) {
  const nextRecord = ensurePortableCharacterSheetSyncMetadata(record);
  const records = loadRawStoredCharacterRecords();
  const nextSync = normalizeCharacterSyncMetadata(nextRecord.metadata?.sync);
  const nextMatch = {
    clientId: nextSync?.clientId,
    localId: nextRecord.identity.localId,
    remoteId: nextSync?.remoteId
  };
  let didReplaceRecord = false;
  const nextRecords = records.map((storedRecord) => {
    if (!isPortableCharacterSheet(storedRecord)) {
      return storedRecord;
    }

    if (
      getPortableCharacterSheetMatchKey(storedRecord) !== getPortableCharacterSheetMatchKey(nextRecord) &&
      !doesPortableCharacterSheetMatch(storedRecord, nextMatch)
    ) {
      return storedRecord;
    }

    didReplaceRecord = true;
    return nextRecord;
  });

  replaceRawStoredCharacterRecords(didReplaceRecord ? nextRecords : [nextRecord, ...records]);
  return nextRecord;
}

export function removeStoredPortableCharacterSheetByMatch(match: {
  clientId?: string | null;
  localId?: number | null;
  remoteId?: string | null;
}) {
  const records = loadRawStoredCharacterRecords();
  const nextRecords = records.filter((record) => {
    if (!isPortableCharacterSheet(record)) {
      return getPortableCharacterSheetLocalId(record) !== match.localId;
    }

    return !doesPortableCharacterSheetMatch(record, match);
  });

  if (nextRecords.length !== records.length) {
    replaceRawStoredCharacterRecords(nextRecords);
  }
}

export function loadStoredPortableCharacterSheetSnapshot(): {
  records: PortableCharacterSheet[];
  hasLegacyRecords: boolean;
} {
  const rawRecords = loadRawStoredCharacterRecords();

  return {
    records: rawRecords
      .filter(isPortableCharacterSheet)
      .map((record) => ensurePortableCharacterSheetSyncMetadata(record)),
    hasLegacyRecords: rawRecords.some((record) => !isPortableCharacterSheet(record))
  };
}
