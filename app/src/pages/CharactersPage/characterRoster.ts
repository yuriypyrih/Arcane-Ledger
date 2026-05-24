import type { CharacterSheetRosterDocument } from "../../api/characters";
import { captureAppError } from "../../lib/sentry";
import type { CharacterSheetSyncStatus, PortableCharacterSheet } from "../../types";
import { normalizeCharacterSyncMetadata } from "./portableCharacterSheet";
import {
  CHARACTER_STORAGE_CHANGED_EVENT,
  loadStoredPortableCharacterSheetSnapshot,
  removeStoredPortableCharacterSheetByMatch
} from "./portableCharacterSheetStorage";

const CHARACTER_ROSTER_CACHE_KEY = "arcane-ledger.character-roster";

export const CHARACTER_ROSTER_CHANGED_EVENT = "arcane-ledger:character-roster-changed";

export type CharacterRosterEntry = {
  id: number;
  background: string;
  className: string;
  clientId?: string;
  hasLocalSheet: boolean;
  level: number;
  localRevision?: number;
  name: string;
  ownerId?: string;
  remoteId?: string;
  remoteRevision?: number;
  avatarUrl?: string;
  sheetSizeBytes?: number;
  source: "local" | "cloud";
  species: string;
  subclassId?: string | null;
  syncStatus?: CharacterSheetSyncStatus;
  updatedAt?: string | null;
};

type CharacterRosterCache = {
  entries: CharacterRosterEntry[];
  ownerId: string;
  updatedAt: string;
};

function dispatchCharacterRosterChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(CHARACTER_ROSTER_CHANGED_EVENT));
}

function readPositiveInteger(value: unknown): number | null {
  const numberValue = Math.floor(Number(value));

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

function normalizeString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function getStoredRosterCache(): CharacterRosterCache | null {
  if (typeof window === "undefined") {
    return null;
  }

  const serializedCache = window.localStorage.getItem(CHARACTER_ROSTER_CACHE_KEY);

  if (!serializedCache) {
    return null;
  }

  try {
    const parsedCache = JSON.parse(serializedCache) as CharacterRosterCache;

    return parsedCache && Array.isArray(parsedCache.entries) ? parsedCache : null;
  } catch (error) {
    captureAppError(error, {
      area: "characters",
      action: "read-roster-cache",
      extra: {
        storageKey: CHARACTER_ROSTER_CACHE_KEY
      }
    });
    return null;
  }
}

function saveStoredRosterCache(cache: CharacterRosterCache) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CHARACTER_ROSTER_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    captureAppError(error, {
      area: "characters",
      action: "write-roster-cache",
      extra: {
        entryCount: cache.entries.length,
        ownerId: cache.ownerId,
        storageKey: CHARACTER_ROSTER_CACHE_KEY
      }
    });
    throw error;
  }
  dispatchCharacterRosterChanged();
}

function getRosterEntryKey(entry: Pick<CharacterRosterEntry, "clientId" | "id" | "remoteId">) {
  if (entry.remoteId) {
    return `remote:${entry.remoteId}`;
  }

  if (entry.clientId) {
    return `client:${entry.clientId}`;
  }

  return `local:${entry.id}`;
}

function isSameRosterEntry(
  entry: Pick<CharacterRosterEntry, "clientId" | "id" | "remoteId">,
  match: { clientId?: string | null; localId?: number | null; remoteId?: string | null }
) {
  return (
    (match.remoteId && entry.remoteId === match.remoteId) ||
    (match.clientId && entry.clientId === match.clientId) ||
    (match.localId !== null && match.localId !== undefined && entry.id === match.localId)
  );
}

function createRosterEntryFromPortableSheet(record: PortableCharacterSheet): CharacterRosterEntry {
  const sync = normalizeCharacterSyncMetadata(record.metadata?.sync);

  return {
    id: record.summary.localId,
    background: normalizeString(record.summary.background, "Unknown"),
    className: normalizeString(record.summary.className, "Unknown"),
    ...(sync?.clientId ? { clientId: sync.clientId } : {}),
    hasLocalSheet: true,
    level: readPositiveInteger(record.summary.level) ?? 1,
    ...(sync?.localRevision ? { localRevision: sync.localRevision } : {}),
    name: normalizeString(record.summary.name, "Unnamed Character"),
    ...(sync?.ownerId ? { ownerId: sync.ownerId } : {}),
    ...(sync?.remoteId ? { remoteId: sync.remoteId } : {}),
    ...(sync?.remoteRevision ? { remoteRevision: sync.remoteRevision } : {}),
    ...(record.metadata?.avatar?.imageUrl ? { avatarUrl: record.metadata.avatar.imageUrl } : {}),
    ...(record.summary.sheetSizeBytes ? { sheetSizeBytes: record.summary.sheetSizeBytes } : {}),
    source: "local",
    species: normalizeString(record.summary.species, "Unknown"),
    ...(record.summary.subclassId ? { subclassId: record.summary.subclassId } : {}),
    ...(sync?.syncStatus ? { syncStatus: sync.syncStatus } : {}),
    updatedAt: sync?.lastLocalChangeAt ?? sync?.lastSyncedAt ?? null
  };
}

function claimRosterLocalId(
  preferredId: number | null,
  usedLocalIds: Set<number>,
  fallbackSeed: number
) {
  let localId = preferredId && !usedLocalIds.has(preferredId) ? preferredId : fallbackSeed;

  while (!Number.isFinite(localId) || localId <= 0 || usedLocalIds.has(localId)) {
    localId += 1;
  }

  usedLocalIds.add(localId);
  return localId;
}

function createRosterEntryFromCloudDocument(
  document: CharacterSheetRosterDocument,
  options: {
    existingEntries: CharacterRosterEntry[];
    localEntries: CharacterRosterEntry[];
    usedLocalIds: Set<number>;
  }
): CharacterRosterEntry {
  const matchingLocalEntry = options.localEntries.find((entry) =>
    isSameRosterEntry(entry, {
      clientId: document.clientId,
      localId: document.localId ?? document.summary.localId,
      remoteId: document.id
    })
  );
  const matchingCachedEntry = options.existingEntries.find((entry) =>
    isSameRosterEntry(entry, {
      clientId: document.clientId,
      localId: document.localId ?? document.summary.localId,
      remoteId: document.id
    })
  );
  const localId = claimRosterLocalId(
    matchingLocalEntry?.id ??
      matchingCachedEntry?.id ??
      readPositiveInteger(document.localId) ??
      readPositiveInteger(document.summary.localId),
    options.usedLocalIds,
    Date.now()
  );

  return {
    id: localId,
    background: normalizeString(document.summary.background, "Unknown"),
    className: normalizeString(document.summary.className, "Unknown"),
    clientId: document.clientId,
    hasLocalSheet: Boolean(matchingLocalEntry),
    level: readPositiveInteger(document.summary.level) ?? 1,
    name: normalizeString(document.summary.name, "Unnamed Character"),
    ownerId: document.ownerId,
    remoteId: document.id,
    remoteRevision: document.revision,
    ...(document.avatar?.imageUrl ? { avatarUrl: document.avatar.imageUrl } : {}),
    ...(document.summary.sheetSizeBytes ? { sheetSizeBytes: document.summary.sheetSizeBytes } : {}),
    source: matchingLocalEntry ? "local" : "cloud",
    species: normalizeString(document.summary.species, "Unknown"),
    ...(document.summary.subclassId ? { subclassId: document.summary.subclassId } : {}),
    syncStatus: matchingLocalEntry?.syncStatus ?? "synced",
    updatedAt: document.updatedAt
  };
}

export function getLocalCharacterRosterSnapshot() {
  const snapshot = loadStoredPortableCharacterSheetSnapshot();

  return {
    entries: snapshot.records.map(createRosterEntryFromPortableSheet),
    hasLegacyRecords: snapshot.hasLegacyRecords,
    records: snapshot.records
  };
}

export function loadCharacterRosterCache(ownerId?: string | null): CharacterRosterEntry[] {
  const cache = getStoredRosterCache();

  if (!cache || (ownerId && cache.ownerId !== ownerId)) {
    return [];
  }

  return cache.entries;
}

export function saveCharacterRosterCache(
  ownerId: string,
  documents: CharacterSheetRosterDocument[]
) {
  const localEntries = getLocalCharacterRosterSnapshot().entries;
  const existingEntries = loadCharacterRosterCache(ownerId);
  const usedLocalIds = new Set(localEntries.map((entry) => entry.id));
  const entries = documents.map((document) =>
    createRosterEntryFromCloudDocument(document, {
      existingEntries,
      localEntries,
      usedLocalIds
    })
  );

  saveStoredRosterCache({
    ownerId,
    entries,
    updatedAt: new Date().toISOString()
  });
  return entries;
}

export function upsertCharacterRosterCacheDocument(
  ownerId: string,
  document: CharacterSheetRosterDocument
) {
  const existingEntries = loadCharacterRosterCache(ownerId);
  const localEntries = getLocalCharacterRosterSnapshot().entries;
  const entriesWithoutDocument = existingEntries.filter(
    (entry) =>
      !isSameRosterEntry(entry, {
        clientId: document.clientId,
        localId: document.localId ?? document.summary.localId,
        remoteId: document.id
      })
  );
  const usedLocalIds = new Set([
    ...localEntries.map((entry) => entry.id),
    ...entriesWithoutDocument.map((entry) => entry.id)
  ]);
  const nextEntry = createRosterEntryFromCloudDocument(document, {
    existingEntries,
    localEntries,
    usedLocalIds
  });
  const nextEntries = [nextEntry, ...entriesWithoutDocument];

  saveStoredRosterCache({
    ownerId,
    entries: nextEntries,
    updatedAt: new Date().toISOString()
  });
  return nextEntry;
}

export function clearCharacterRosterCache() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CHARACTER_ROSTER_CACHE_KEY);
  dispatchCharacterRosterChanged();
}

export function removeCharacterRosterEntry(match: {
  clientId?: string | null;
  localId?: number | null;
  remoteId?: string | null;
}) {
  removeStoredPortableCharacterSheetByMatch(match);

  const cache = getStoredRosterCache();

  if (!cache) {
    return;
  }

  const nextEntries = cache.entries.filter((entry) => !isSameRosterEntry(entry, match));

  if (nextEntries.length !== cache.entries.length) {
    saveStoredRosterCache({
      ...cache,
      entries: nextEntries,
      updatedAt: new Date().toISOString()
    });
  }
}

export function loadCharacterRosterEntries(ownerId?: string | null): CharacterRosterEntry[] {
  const { entries: localEntries } = getLocalCharacterRosterSnapshot();
  const deletingEntries = localEntries.filter((entry) => entry.syncStatus === "deleting");
  const visibleLocalEntries = ownerId
    ? localEntries.filter(
        (entry) => entry.syncStatus !== "deleting" && (!entry.ownerId || entry.ownerId === ownerId)
      )
    : localEntries.filter((entry) => entry.syncStatus !== "deleting" && !entry.ownerId);
  const rosterEntriesByKey = new Map<string, CharacterRosterEntry>();

  visibleLocalEntries.forEach((entry) => {
    rosterEntriesByKey.set(getRosterEntryKey(entry), entry);
  });

  if (ownerId) {
    loadCharacterRosterCache(ownerId).forEach((entry) => {
      const key = getRosterEntryKey(entry);
      const isLocallyDeleting = deletingEntries.some((deletingEntry) =>
        isSameRosterEntry(entry, {
          clientId: deletingEntry.clientId,
          localId: deletingEntry.id,
          remoteId: deletingEntry.remoteId
        })
      );

      if (entry.syncStatus !== "deleting" && !isLocallyDeleting && !rosterEntriesByKey.has(key)) {
        rosterEntriesByKey.set(key, entry);
      }
    });
  }

  return [...rosterEntriesByKey.values()].sort((firstEntry, secondEntry) => {
    const firstTime = firstEntry.updatedAt ? Date.parse(firstEntry.updatedAt) : firstEntry.id;
    const secondTime = secondEntry.updatedAt ? Date.parse(secondEntry.updatedAt) : secondEntry.id;

    return secondTime - firstTime;
  });
}

export async function migrateLegacyCharacterRosterRecords() {
  const snapshot = loadStoredPortableCharacterSheetSnapshot();

  if (!snapshot.hasLegacyRecords) {
    return false;
  }

  const { loadStoredPortableCharacterSheets, replaceStoredPortableCharacterSheets } =
    await import("./storage");
  const portableRecords = loadStoredPortableCharacterSheets();

  replaceStoredPortableCharacterSheets(portableRecords);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHARACTER_STORAGE_CHANGED_EVENT));
  }
  return true;
}
