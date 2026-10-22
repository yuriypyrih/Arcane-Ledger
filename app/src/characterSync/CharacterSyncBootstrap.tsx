import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "react-redux";
import { useCharacterSyncSession } from "./useCharacterSyncSession";
import { getSyncRecordKey, replaceSyncedRecord } from "./characterSyncResult";
import {
  deleteCharacterSheet,
  getCharacterSheet,
  importCharacterSheets,
  listFullCharacterSheets,
  listCharacterSheets,
  saveCharacterSheet
} from "../api/characters";
import type { CharacterSheetCloudDocument, CharacterSheetRosterDocument } from "../api/characters";
import { ApiOfflineError, ApiRequestFailedError } from "../api/client";
import {
  getCharacterSheetUnavailableMessage,
  isCharacterSheetUnavailableError
} from "../api/characterSheetErrors";
import { captureAppError } from "../lib/sentry";
import {
  detachPortableCharacterSheetCloudSync,
  ensurePortableCharacterSheetSyncMetadata,
  markPortableCharacterSheetDeletingError,
  markPortableCharacterSheetSyncError
} from "../pages/CharactersPage/portableCharacterSheet";
import {
  removeCharacterRosterEntry,
  saveCharacterRosterCache
} from "../pages/CharactersPage/characterRoster";
import {
  CHARACTER_STORAGE_CHANGED_EVENT,
  loadStoredPortableCharacterSheetByMatch,
  loadStoredPortableCharacterSheetSnapshot,
  replaceRawStoredCharacterRecords
} from "../pages/CharactersPage/portableCharacterSheetStorage";
import { storeCloudCharacterSheetDocument } from "../pages/CharactersPage/resolvePortableCharacterSheet";
import {
  setActiveCharacterSheet,
  showToast,
  useAppDispatch,
  useAppSelector,
  type RootState
} from "../store";
import type { PortableCharacterSheet } from "../types";
import CharacterSyncConflictModal from "./CharacterSyncConflictModal";
import {
  CHARACTER_SYNC_CONFLICT_EVENT,
  type CharacterSyncConflictEventDetail,
  dispatchCharacterSyncConflict
} from "./characterSyncConflicts";
import {
  CHARACTER_SYNC_REQUEST_EVENT,
  type CharacterSyncRequestEventDetail,
  dispatchCharacterSyncRequestComplete,
  isCharacterSyncLocked
} from "./characterSyncRequests";
import {
  applyCloudDocumentToPortableCharacterSheet,
  createPortableCharacterSheetSyncPayload,
  getPortableCharacterSheetSync,
  getUnclaimedPortableCharacterSheets,
  isPortableCharacterSheetOwnedBy,
  mergeCurrentUserPortableCharacterSheets,
  reconcilePortableCharacterSheetsWithCloudSnapshot
} from "./characterSyncRecords";
import UnclaimedCharactersModal from "./UnclaimedCharactersModal";

const cloudSyncDebounceMs = 20_000;

type ClaimPromptState = {
  availableSlots: number;
  cloudRecords: PortableCharacterSheet[];
  cloudRosterDocuments: CharacterSheetRosterDocument[];
  currentCount: number;
  error: string | null;
  limit: number;
  localSnapshot: PortableCharacterSheet[];
  ownerId: string;
  unclaimedRecords: PortableCharacterSheet[];
};

type ConflictPromptState = {
  error: string | null;
  record: PortableCharacterSheet;
  serverRevision?: number;
};

function isRetryableDirtyStatus(record: PortableCharacterSheet) {
  const sync = getPortableCharacterSheetSync(record);

  return (
    sync?.syncStatus === "dirty" ||
    sync?.syncStatus === "error" ||
    sync?.syncStatus === "conflict" ||
    sync?.syncStatus === "deleting"
  );
}

function createRosterDocumentFromCloudDocument(
  document: CharacterSheetCloudDocument
): CharacterSheetRosterDocument {
  const { sheet: _sheet, ...rosterDocument } = document;

  return rosterDocument;
}

async function fetchCloudPortableCharacterSheets() {
  const cloudSnapshot = await listFullCharacterSheets({ suppressFailureToast: true });
  const rosterDocuments = cloudSnapshot.characters.map(createRosterDocumentFromCloudDocument);

  return {
    cloudRecords: cloudSnapshot.characters.map((character) =>
      applyCloudDocumentToPortableCharacterSheet(character)
    ),
    cloudRosterDocuments: rosterDocuments,
    count: cloudSnapshot.count,
    limit: cloudSnapshot.limit
  };
}

async function loadSyncableStoredPortableCharacterSheets() {
  const snapshot = loadStoredPortableCharacterSheetSnapshot();

  if (!snapshot.hasLegacyRecords) {
    return snapshot.records;
  }

  const { loadStoredPortableCharacterSheets } = await import("../pages/CharactersPage/storage");

  return loadStoredPortableCharacterSheets();
}

function getImportCapacity(options: {
  cloudRecords: PortableCharacterSheet[];
  limit: number;
  localRecords: PortableCharacterSheet[];
  ownerId: string;
}) {
  const currentUserRecords = mergeCurrentUserPortableCharacterSheets({
    ownerId: options.ownerId,
    localRecords: options.localRecords,
    cloudRecords: options.cloudRecords
  });

  return {
    availableSlots: Math.max(0, options.limit - currentUserRecords.length),
    currentCount: currentUserRecords.length
  };
}

function getSyncErrorMessage(error: unknown) {
  if (error instanceof ApiRequestFailedError) {
    return error.message;
  }

  return "Unable to sync character sheet.";
}

function getRevisionConflictServerRevision(error: unknown) {
  if (!(error instanceof ApiRequestFailedError) || !error.details) {
    return undefined;
  }

  const details = error.details as { serverRevision?: unknown };
  const serverRevision = Number(details.serverRevision);

  return Number.isFinite(serverRevision) && serverRevision > 0 ? serverRevision : undefined;
}

function getHandledSyncErrorLevel(error: unknown) {
  return error instanceof ApiRequestFailedError && error.status !== undefined && error.status < 500
    ? "warning"
    : "error";
}

function captureCharacterSyncError(
  error: unknown,
  options: {
    action: string;
    clientId?: string;
    localId?: number;
    remoteId?: string;
    syncStatus?: string;
  }
) {
  if (error instanceof ApiOfflineError) {
    return;
  }

  captureAppError(error, {
    area: "character-sync",
    action: options.action,
    level: getHandledSyncErrorLevel(error),
    tags: {
      syncStatus: options.syncStatus
    },
    extra: {
      clientId: options.clientId,
      localId: options.localId,
      remoteId: options.remoteId
    }
  });
}

async function refreshCharacterCloudRosterBestEffort(
  ownerId: string,
  isCurrentSession: () => boolean
) {
  try {
    const roster = await listCharacterSheets({ suppressFailureToast: true });
    if (isCurrentSession()) saveCharacterRosterCache(ownerId, roster.characters);
  } catch {
    // The stale remote id is still handled locally even if roster refresh is unavailable.
  }
}

function detachUnavailableCloudSync(record: PortableCharacterSheet, error: unknown) {
  return detachPortableCharacterSheetCloudSync(record, getCharacterSheetUnavailableMessage(error));
}

function CharacterSyncBootstrap() {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const createSessionGuard = useCharacterSyncSession();
  const { status, user } = useAppSelector((state) => state.auth);
  const [claimPrompt, setClaimPrompt] = useState<ClaimPromptState | null>(null);
  const [conflictPrompt, setConflictPrompt] = useState<ConflictPromptState | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);
  const initializedSessionRef = useRef<(() => boolean) | null>(null);
  const initializingSessionRef = useRef<(() => boolean) | null>(null);
  const syncTimerRef = useRef<number | null>(null);
  const syncPromiseRef = useRef<Promise<void> | null>(null);

  const clearSyncTimer = useCallback(() => {
    if (syncTimerRef.current === null) {
      return;
    }

    window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = null;
  }, []);

  const updateActiveCharacterIfOpen = useCallback(
    async (record: PortableCharacterSheet, isCurrentSession: () => boolean) => {
      const active = store.getState().activeCharacterSheet;
      if (active.characterId !== record.identity.localId || active.dirty || !isCurrentSession()) {
        return;
      }

      const { normalizeCharacter } = await import("../pages/CharactersPage/storage");
      // Navigation and unsaved edits can happen while the normalizer is loading.
      if (!isCurrentSession() || store.getState().activeCharacterSheet !== active) return;
      const latestRecord = loadStoredPortableCharacterSheetByMatch({
        localId: record.identity.localId
      });
      if (!latestRecord || getPortableCharacterSheetSync(latestRecord)?.syncStatus === "deleting")
        return;
      dispatch(
        setActiveCharacterSheet({
          character: normalizeCharacter(latestRecord),
          characterId: latestRecord.identity.localId
        })
      );
    },
    [dispatch, store]
  );

  const replaceStoredCharacterRecords = useCallback(
    async (records: PortableCharacterSheet[], isCurrentSession: () => boolean) => {
      if (!isCurrentSession()) return;
      replaceRawStoredCharacterRecords(records);
      const activeCharacterId = store.getState().activeCharacterSheet.characterId;
      if (activeCharacterId === null) return;
      const activeRecord = records.find((record) => record.identity.localId === activeCharacterId);
      if (activeRecord) {
        await updateActiveCharacterIfOpen(activeRecord, isCurrentSession);
      } else if (!store.getState().activeCharacterSheet.dirty) {
        dispatch(setActiveCharacterSheet({ character: null, characterId: null }));
      }
    },
    [dispatch, store, updateActiveCharacterIfOpen]
  );

  const syncDirtyCharacterRecords = useCallback(async () => {
    if (status !== "authenticated" || !user) return;
    const isCurrentSession = createSessionGuard(user.id);
    while (syncPromiseRef.current) await syncPromiseRef.current;
    if (!isCurrentSession()) return;

    const syncPromise = (async () => {
      const ownerId = user.id;
      const syncableRecords = (await loadSyncableStoredPortableCharacterSheets()).filter(
        (record) =>
          isPortableCharacterSheetOwnedBy(record, ownerId) &&
          isRetryableDirtyStatus(record) &&
          !isCharacterSyncLocked(record.identity.localId)
      );

      if (!isCurrentSession() || syncableRecords.length === 0) {
        return;
      }

      try {
        let records = await loadSyncableStoredPortableCharacterSheets();

        for (const candidate of syncableRecords) {
          if (!isCurrentSession()) return;
          const record = loadStoredPortableCharacterSheetByMatch({
            clientId: getPortableCharacterSheetSync(candidate)?.clientId,
            localId: candidate.identity.localId
          });
          if (
            !record ||
            !isPortableCharacterSheetOwnedBy(record, ownerId) ||
            isCharacterSyncLocked(record.identity.localId)
          )
            continue;
          const sync = getPortableCharacterSheetSync(record);

          if (!sync) {
            continue;
          }

          if (sync.syncStatus === "conflict") {
            dispatchCharacterSyncConflict({
              clientId: sync.clientId,
              localId: record.identity.localId,
              remoteId: sync.remoteId,
              serverRevision: sync.remoteRevision
            });
            continue;
          }

          const targetKey = getSyncRecordKey(record);
          const sentLocalRevision = sync.localRevision;
          let nextRecord: PortableCharacterSheet;

          if (sync.syncStatus === "deleting") {
            try {
              if (sync.remoteId) {
                await deleteCharacterSheet(sync.remoteId, { suppressFailureToast: true });
              }

              if (!isCurrentSession()) return;
              removeCharacterRosterEntry({
                clientId: sync.clientId,
                localId: record.identity.localId,
                remoteId: sync.remoteId
              });
            } catch (error) {
              if (!isCurrentSession()) return;
              if (error instanceof ApiOfflineError) {
                return;
              }

              if (isCharacterSheetUnavailableError(error)) {
                await refreshCharacterCloudRosterBestEffort(ownerId, isCurrentSession);
                if (!isCurrentSession()) return;
                removeCharacterRosterEntry({
                  clientId: sync.clientId,
                  localId: record.identity.localId,
                  remoteId: sync.remoteId
                });
                continue;
              }

              captureCharacterSyncError(error, {
                action: "delete",
                clientId: sync.clientId,
                localId: record.identity.localId,
                remoteId: sync.remoteId,
                syncStatus: sync.syncStatus
              });
              nextRecord = markPortableCharacterSheetDeletingError(
                record,
                getSyncErrorMessage(error)
              );

              records = replaceSyncedRecord({
                records: await loadSyncableStoredPortableCharacterSheets(),
                targetKey,
                nextRecord,
                sentLocalRevision,
                ownerId
              });
              await replaceStoredCharacterRecords(records, isCurrentSession);
            }

            continue;
          }

          try {
            const payload = await createPortableCharacterSheetSyncPayload(record, {
              includeBaseRevision: Boolean(sync.remoteId),
              ownerId
            });
            if (!isCurrentSession()) return;
            if (sync.remoteId) {
              const { character } = await saveCharacterSheet(sync.remoteId, payload, {
                suppressFailureToast: true
              });
              nextRecord = applyCloudDocumentToPortableCharacterSheet(character);
            } else {
              const { characters } = await importCharacterSheets([payload], {
                suppressFailureToast: true
              });
              const importedCharacter = characters[0];

              if (!importedCharacter) {
                throw new Error("Import did not return a character sheet.");
              }

              nextRecord = applyCloudDocumentToPortableCharacterSheet(importedCharacter);
            }
          } catch (error) {
            if (!isCurrentSession()) return;
            if (error instanceof ApiOfflineError) {
              return;
            }

            if (isCharacterSheetUnavailableError(error)) {
              await refreshCharacterCloudRosterBestEffort(ownerId, isCurrentSession);
              if (!isCurrentSession()) return;
              nextRecord = detachUnavailableCloudSync(record, error);
            } else {
              const syncStatus =
                error instanceof ApiRequestFailedError && error.status === 409
                  ? "conflict"
                  : "error";
              if (syncStatus !== "conflict") {
                captureCharacterSyncError(error, {
                  action: sync.remoteId ? "save" : "import",
                  clientId: sync.clientId,
                  localId: record.identity.localId,
                  remoteId: sync.remoteId,
                  syncStatus: sync.syncStatus
                });
              }
              nextRecord = markPortableCharacterSheetSyncError(
                record,
                getSyncErrorMessage(error),
                syncStatus
              );

              const latest = loadStoredPortableCharacterSheetByMatch({
                clientId: sync.clientId,
                localId: record.identity.localId
              });
              if (
                syncStatus === "conflict" &&
                latest &&
                getPortableCharacterSheetSync(latest)?.syncStatus !== "deleting"
              ) {
                dispatchCharacterSyncConflict({
                  clientId: sync.clientId,
                  localId: record.identity.localId,
                  remoteId: sync.remoteId,
                  serverRevision: getRevisionConflictServerRevision(error)
                });
              }
            }
          }

          records = replaceSyncedRecord({
            records: await loadSyncableStoredPortableCharacterSheets(),
            targetKey,
            nextRecord,
            sentLocalRevision,
            ownerId
          });
          await replaceStoredCharacterRecords(records, isCurrentSession);
        }
      } catch (error) {
        if (!isCurrentSession()) return;
        captureCharacterSyncError(error, {
          action: "sync-loop"
        });
      }
    })();

    syncPromiseRef.current = syncPromise;

    try {
      await syncPromise;
    } finally {
      if (syncPromiseRef.current === syncPromise) {
        syncPromiseRef.current = null;
      }
    }
  }, [createSessionGuard, replaceStoredCharacterRecords, status, user]);

  const queueCloudSync = useCallback(
    (delayMs = cloudSyncDebounceMs) => {
      clearSyncTimer();

      if (status !== "authenticated" || !user) {
        return;
      }

      syncTimerRef.current = window.setTimeout(() => {
        syncTimerRef.current = null;
        void syncDirtyCharacterRecords();
      }, delayMs);
    },
    [clearSyncTimer, status, syncDirtyCharacterRecords, user]
  );

  const refreshAuthenticatedCharacterCache = useCallback(async () => {
    if (status !== "authenticated" || !user) {
      return false;
    }

    const isCurrentSession = createSessionGuard(user.id);
    if (!isCurrentSession()) return false;
    try {
      const cloudSnapshot = await fetchCloudPortableCharacterSheets();
      const latestLocalSnapshot = await loadSyncableStoredPortableCharacterSheets();
      if (!isCurrentSession()) return false;
      saveCharacterRosterCache(user.id, cloudSnapshot.cloudRosterDocuments);
      const records = reconcilePortableCharacterSheetsWithCloudSnapshot({
        ownerId: user.id,
        localRecords: latestLocalSnapshot,
        cloudRecords: cloudSnapshot.cloudRecords,
        preserveUnownedRecords: true
      });

      await replaceStoredCharacterRecords(records, isCurrentSession);
      return true;
    } catch (error) {
      if (!isCurrentSession()) return false;
      if (!(error instanceof ApiOfflineError)) {
        captureCharacterSyncError(error, {
          action: "refresh",
          syncStatus: "restore"
        });
      }

      return false;
    }
  }, [createSessionGuard, replaceStoredCharacterRecords, status, user]);

  const refreshAuthenticatedCharacterCacheAndSyncDirty = useCallback(async () => {
    if (syncPromiseRef.current) {
      await syncPromiseRef.current;
    }

    await refreshAuthenticatedCharacterCache();
    await syncDirtyCharacterRecords();
  }, [refreshAuthenticatedCharacterCache, syncDirtyCharacterRecords]);

  const initializeAuthenticatedCharacterCache = useCallback(async () => {
    if (status !== "authenticated" || !user) {
      return;
    }

    if (
      initializedSessionRef.current?.() ||
      initializingSessionRef.current?.() ||
      claimPrompt?.ownerId === user.id
    ) {
      return;
    }

    const isCurrentSession = createSessionGuard(user.id);
    if (!isCurrentSession()) return;
    initializingSessionRef.current = isCurrentSession;

    try {
      const cloudSnapshot = await fetchCloudPortableCharacterSheets();
      const latestLocalSnapshot = await loadSyncableStoredPortableCharacterSheets();
      if (!isCurrentSession()) return;
      saveCharacterRosterCache(user.id, cloudSnapshot.cloudRosterDocuments);
      const reconciledLocalSnapshot = reconcilePortableCharacterSheetsWithCloudSnapshot({
        ownerId: user.id,
        localRecords: latestLocalSnapshot,
        cloudRecords: cloudSnapshot.cloudRecords,
        preserveUnownedRecords: true
      });
      const unclaimedRecords = getUnclaimedPortableCharacterSheets(
        reconciledLocalSnapshot,
        user.id
      );
      const { availableSlots, currentCount } = getImportCapacity({
        ownerId: user.id,
        localRecords: reconciledLocalSnapshot,
        cloudRecords: cloudSnapshot.cloudRecords,
        limit: cloudSnapshot.limit
      });

      initializedSessionRef.current = isCurrentSession;

      if (unclaimedRecords.length > 0) {
        await replaceStoredCharacterRecords(reconciledLocalSnapshot, isCurrentSession);
        if (!isCurrentSession()) return;
        setClaimPrompt({
          ownerId: user.id,
          localSnapshot: reconciledLocalSnapshot,
          cloudRecords: cloudSnapshot.cloudRecords,
          cloudRosterDocuments: cloudSnapshot.cloudRosterDocuments,
          unclaimedRecords,
          currentCount,
          availableSlots,
          limit: cloudSnapshot.limit,
          error: null
        });
        return;
      }

      await replaceStoredCharacterRecords(reconciledLocalSnapshot, isCurrentSession);
      if (!isCurrentSession()) return;
      queueCloudSync(0);
    } catch (error) {
      if (!isCurrentSession()) return;
      if (!(error instanceof ApiOfflineError)) {
        captureCharacterSyncError(error, {
          action: "initialize",
          syncStatus: "restore"
        });
        dispatch(
          showToast({
            text: getSyncErrorMessage(error),
            type: "error"
          })
        );
      }

      initializedSessionRef.current = null;
    } finally {
      if (initializingSessionRef.current === isCurrentSession)
        initializingSessionRef.current = null;
    }
  }, [
    claimPrompt?.ownerId,
    createSessionGuard,
    dispatch,
    queueCloudSync,
    replaceStoredCharacterRecords,
    status,
    user
  ]);

  const confirmClaimPrompt = useCallback(
    async (selectedRecords: PortableCharacterSheet[]) => {
      if (!claimPrompt) {
        return;
      }

      const isCurrentSession = createSessionGuard(claimPrompt.ownerId);
      if (!isCurrentSession()) return;
      setIsClaiming(true);
      setClaimPrompt((currentPrompt) =>
        currentPrompt ? { ...currentPrompt, error: null } : currentPrompt
      );

      try {
        const ownedSelectedRecords = selectedRecords.map((record) =>
          ensurePortableCharacterSheetSyncMetadata(record, {
            ownerId: claimPrompt.ownerId,
            syncStatus: "dirty"
          })
        );
        const payloads = await Promise.all(
          ownedSelectedRecords.map((record) =>
            createPortableCharacterSheetSyncPayload(record, { ownerId: claimPrompt.ownerId })
          )
        );
        if (!isCurrentSession()) return;
        const importedRecords =
          payloads.length > 0
            ? (
                await importCharacterSheets(payloads, { suppressFailureToast: true })
              ).characters.map(applyCloudDocumentToPortableCharacterSheet)
            : [];
        if (!isCurrentSession()) return;
        const finalRecords = mergeCurrentUserPortableCharacterSheets({
          ownerId: claimPrompt.ownerId,
          localRecords: claimPrompt.localSnapshot,
          cloudRecords: [...claimPrompt.cloudRecords, ...importedRecords]
        });
        const importedRosterDocuments: CharacterSheetRosterDocument[] = [];

        importedRecords.forEach((record) => {
          const sync = getPortableCharacterSheetSync(record);

          if (!sync?.remoteId) {
            return;
          }

          importedRosterDocuments.push({
            id: sync.remoteId,
            ownerId: claimPrompt.ownerId,
            clientId: sync.clientId,
            localId: record.identity.localId,
            schemaVersion: 2,
            revision: sync.remoteRevision ?? 1,
            summary: record.summary,
            avatar: record.metadata?.avatar ?? null,
            backgroundTexture: record.metadata?.backgroundTexture ?? null,
            createdAt: sync.lastSyncedAt ?? null,
            updatedAt: sync.lastSyncedAt ?? null
          });
        });

        saveCharacterRosterCache(claimPrompt.ownerId, [
          ...claimPrompt.cloudRosterDocuments,
          ...importedRosterDocuments
        ]);
        await replaceStoredCharacterRecords(finalRecords, isCurrentSession);
        if (!isCurrentSession()) return;
        setClaimPrompt(null);
        queueCloudSync(0);
        dispatch(
          showToast({
            text:
              importedRecords.length > 0
                ? "Characters imported to your account."
                : "Unclaimed characters discarded.",
            type: "success"
          })
        );
      } catch (error) {
        if (!isCurrentSession()) return;
        captureCharacterSyncError(error, {
          action: "claim-import",
          syncStatus: "dirty"
        });
        setClaimPrompt((currentPrompt) =>
          currentPrompt
            ? {
                ...currentPrompt,
                error: getSyncErrorMessage(error)
              }
            : currentPrompt
        );
      } finally {
        if (isCurrentSession()) setIsClaiming(false);
      }
    },
    [claimPrompt, createSessionGuard, dispatch, queueCloudSync, replaceStoredCharacterRecords]
  );

  const openConflictPrompt = useCallback((detail: CharacterSyncConflictEventDetail) => {
    const record = loadStoredPortableCharacterSheetByMatch({
      clientId: detail.clientId,
      localId: detail.localId,
      remoteId: detail.remoteId
    });

    if (!record) {
      return;
    }

    setConflictPrompt({
      record,
      serverRevision: detail.serverRevision,
      error: detail.message ?? null
    });
  }, []);

  const keepLocalConflictVersion = useCallback(async () => {
    if (status !== "authenticated" || !user || !conflictPrompt) {
      return;
    }

    const sync = getPortableCharacterSheetSync(conflictPrompt.record);

    if (!sync?.remoteId) {
      setConflictPrompt((currentPrompt) =>
        currentPrompt ? { ...currentPrompt, error: "This character has no cloud id yet." } : null
      );
      return;
    }

    const isCurrentSession = createSessionGuard(user.id);
    if (!isCurrentSession()) return;
    setIsResolvingConflict(true);

    try {
      const payload = await createPortableCharacterSheetSyncPayload(conflictPrompt.record, {
        force: true,
        ownerId: user.id
      });
      if (!isCurrentSession()) return;
      const { character } = await saveCharacterSheet(sync.remoteId, payload, {
        suppressFailureToast: true
      });
      if (!isCurrentSession()) return;
      const record = storeCloudCharacterSheetDocument(character, {
        localId: conflictPrompt.record.identity.localId
      });

      await updateActiveCharacterIfOpen(record, isCurrentSession);
      if (!isCurrentSession()) return;
      setConflictPrompt(null);
      queueCloudSync(0);
      dispatch(
        showToast({
          text: "Local character overwrote the cloud version.",
          type: "success"
        })
      );
    } catch (error) {
      if (!isCurrentSession()) return;
      captureCharacterSyncError(error, {
        action: "conflict-keep-local",
        clientId: sync.clientId,
        localId: conflictPrompt.record.identity.localId,
        remoteId: sync.remoteId,
        syncStatus: sync.syncStatus
      });
      setConflictPrompt((currentPrompt) =>
        currentPrompt ? { ...currentPrompt, error: getSyncErrorMessage(error) } : null
      );
    } finally {
      if (isCurrentSession()) setIsResolvingConflict(false);
    }
  }, [
    conflictPrompt,
    createSessionGuard,
    dispatch,
    queueCloudSync,
    status,
    updateActiveCharacterIfOpen,
    user
  ]);

  const keepCloudConflictVersion = useCallback(async () => {
    if (status !== "authenticated" || !user || !conflictPrompt) {
      return;
    }

    const sync = getPortableCharacterSheetSync(conflictPrompt.record);

    if (!sync?.remoteId) {
      setConflictPrompt((currentPrompt) =>
        currentPrompt ? { ...currentPrompt, error: "This character has no cloud id yet." } : null
      );
      return;
    }

    const isCurrentSession = createSessionGuard(user.id);
    if (!isCurrentSession()) return;
    setIsResolvingConflict(true);

    try {
      const { character } = await getCharacterSheet(sync.remoteId, {
        suppressFailureToast: true
      });
      if (!isCurrentSession()) return;
      const record = storeCloudCharacterSheetDocument(character, {
        localId: conflictPrompt.record.identity.localId
      });

      await updateActiveCharacterIfOpen(record, isCurrentSession);
      if (!isCurrentSession()) return;
      setConflictPrompt(null);
      queueCloudSync(0);
      dispatch(
        showToast({
          text: "Cloud character replaced the local version.",
          type: "success"
        })
      );
    } catch (error) {
      if (!isCurrentSession()) return;
      captureCharacterSyncError(error, {
        action: "conflict-keep-cloud",
        clientId: sync.clientId,
        localId: conflictPrompt.record.identity.localId,
        remoteId: sync.remoteId,
        syncStatus: sync.syncStatus
      });
      setConflictPrompt((currentPrompt) =>
        currentPrompt ? { ...currentPrompt, error: getSyncErrorMessage(error) } : null
      );
    } finally {
      if (isCurrentSession()) setIsResolvingConflict(false);
    }
  }, [
    conflictPrompt,
    createSessionGuard,
    dispatch,
    queueCloudSync,
    status,
    updateActiveCharacterIfOpen,
    user
  ]);

  useEffect(() => {
    if (status !== "authenticated") {
      initializedSessionRef.current = null;
      initializingSessionRef.current = null;
      setClaimPrompt(null);
      setConflictPrompt(null);
      setIsClaiming(false);
      setIsResolvingConflict(false);
      clearSyncTimer();
      return;
    }

    void initializeAuthenticatedCharacterCache();
  }, [clearSyncTimer, initializeAuthenticatedCharacterCache, status]);

  useEffect(() => {
    function handleCharacterSyncRequest(event: Event) {
      const requestId = (event as CustomEvent<CharacterSyncRequestEventDetail>).detail?.requestId;

      clearSyncTimer();
      window.setTimeout(() => {
        void refreshAuthenticatedCharacterCacheAndSyncDirty().finally(() => {
          dispatchCharacterSyncRequestComplete(requestId);
        });
      }, 0);
    }

    window.addEventListener(CHARACTER_SYNC_REQUEST_EVENT, handleCharacterSyncRequest);

    return () => {
      window.removeEventListener(CHARACTER_SYNC_REQUEST_EVENT, handleCharacterSyncRequest);
    };
  }, [clearSyncTimer, refreshAuthenticatedCharacterCacheAndSyncDirty]);

  useEffect(() => {
    function handleCharacterSyncConflict(event: Event) {
      openConflictPrompt((event as CustomEvent<CharacterSyncConflictEventDetail>).detail);
    }

    window.addEventListener(CHARACTER_SYNC_CONFLICT_EVENT, handleCharacterSyncConflict);

    return () => {
      window.removeEventListener(CHARACTER_SYNC_CONFLICT_EVENT, handleCharacterSyncConflict);
    };
  }, [openConflictPrompt]);

  useEffect(() => {
    function handleStorageChange() {
      const hasDeletingRecords =
        status === "authenticated" &&
        user &&
        loadStoredPortableCharacterSheetSnapshot().records.some((record) => {
          const sync = getPortableCharacterSheetSync(record);

          return sync?.ownerId === user.id && sync.syncStatus === "deleting";
        });

      queueCloudSync(hasDeletingRecords ? 0 : undefined);
    }

    window.addEventListener(CHARACTER_STORAGE_CHANGED_EVENT, handleStorageChange);

    return () => {
      window.removeEventListener(CHARACTER_STORAGE_CHANGED_EVENT, handleStorageChange);
    };
  }, [queueCloudSync, status, user]);

  useEffect(() => {
    function handleOnline() {
      if (!initializedSessionRef.current?.()) {
        void initializeAuthenticatedCharacterCache();
        return;
      }

      clearSyncTimer();
      void syncDirtyCharacterRecords();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        clearSyncTimer();
        void syncDirtyCharacterRecords();
      }
    }

    // Cellular recovery may leave navigator.onLine true and never emit an online event.
    const retryTimer = window.setInterval(() => {
      if (status !== "authenticated" || document.visibilityState !== "visible" || !navigator.onLine)
        return;
      const hasPendingWrites = loadStoredPortableCharacterSheetSnapshot().records.some((record) => {
        const sync = getPortableCharacterSheetSync(record);
        return (
          sync?.ownerId === user?.id &&
          (sync?.syncStatus === "dirty" ||
            sync?.syncStatus === "error" ||
            sync?.syncStatus === "deleting")
        );
      });
      if (!initializedSessionRef.current?.() || hasPendingWrites) handleOnline();
    }, 30_000);
    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(retryTimer);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearSyncTimer();
    };
  }, [
    clearSyncTimer,
    initializeAuthenticatedCharacterCache,
    status,
    syncDirtyCharacterRecords,
    user?.id
  ]);

  return (
    <>
      {claimPrompt ? (
        <UnclaimedCharactersModal
          availableSlots={claimPrompt.availableSlots}
          currentCount={claimPrompt.currentCount}
          error={claimPrompt.error}
          isBusy={isClaiming}
          limit={claimPrompt.limit}
          records={claimPrompt.unclaimedRecords}
          onConfirm={confirmClaimPrompt}
        />
      ) : null}
      {conflictPrompt ? (
        <CharacterSyncConflictModal
          error={conflictPrompt.error}
          isBusy={isResolvingConflict}
          record={conflictPrompt.record}
          onDismiss={() => setConflictPrompt(null)}
          onKeepCloud={keepCloudConflictVersion}
          onKeepLocal={keepLocalConflictVersion}
        />
      ) : null}
    </>
  );
}

export default CharacterSyncBootstrap;
