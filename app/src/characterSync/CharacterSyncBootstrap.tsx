import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteCharacterSheet,
  getCharacterSheet,
  importCharacterSheets,
  listFullCharacterSheets,
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
import {
  refreshCharacterCloudRoster,
  storeCloudCharacterSheetDocument
} from "../pages/CharactersPage/resolvePortableCharacterSheet";
import {
  setActiveCharacterSheet,
  showToast,
  useAppDispatch,
  useAppSelector
} from "../store";
import type { PortableCharacterSheet } from "../types";
import CharacterSyncConflictModal from "./CharacterSyncConflictModal";
import {
  CHARACTER_SYNC_CONFLICT_EVENT,
  type CharacterSyncConflictEventDetail,
  dispatchCharacterSyncConflict
} from "./characterSyncConflicts";
import { CHARACTER_SYNC_REQUEST_EVENT } from "./characterSyncRequests";
import {
  applyCloudDocumentToPortableCharacterSheet,
  createPortableCharacterSheetSyncPayload,
  getPortableCharacterSheetSync,
  getUnclaimedPortableCharacterSheets,
  isPortableCharacterSheetOwnedBy,
  mergeCurrentUserPortableCharacterSheets
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

function getSyncRecordKey(record: PortableCharacterSheet) {
  const sync = getPortableCharacterSheetSync(record);

  return sync?.clientId ?? `local-${record.identity.localId}`;
}

function createRosterDocumentFromCloudDocument(
  document: CharacterSheetCloudDocument
): CharacterSheetRosterDocument {
  const { sheet: _sheet, ...rosterDocument } = document;

  return rosterDocument;
}

async function fetchCloudPortableCharacterSheets(ownerId: string) {
  const cloudSnapshot = await listFullCharacterSheets({ suppressFailureToast: true });
  const rosterDocuments = cloudSnapshot.characters.map(createRosterDocumentFromCloudDocument);

  saveCharacterRosterCache(ownerId, rosterDocuments);
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

function replaceSyncedRecord(options: {
  nextRecord: PortableCharacterSheet;
  ownerId: string;
  records: PortableCharacterSheet[];
  sentLocalRevision: number;
  targetKey: string;
}) {
  return options.records.map((record) => {
    if (getSyncRecordKey(record) !== options.targetKey) {
      return record;
    }

    const currentSync = getPortableCharacterSheetSync(record);
    const nextSync = getPortableCharacterSheetSync(options.nextRecord);

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
  return error instanceof ApiRequestFailedError &&
    error.status !== undefined &&
    error.status < 500
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

async function refreshCharacterCloudRosterBestEffort(ownerId: string) {
  try {
    await refreshCharacterCloudRoster(ownerId);
  } catch {
    // The stale remote id is still handled locally even if roster refresh is unavailable.
  }
}

function detachUnavailableCloudSync(record: PortableCharacterSheet, error: unknown) {
  return detachPortableCharacterSheetCloudSync(
    record,
    getCharacterSheetUnavailableMessage(error)
  );
}

function CharacterSyncBootstrap() {
  const dispatch = useAppDispatch();
  const { status, user } = useAppSelector((state) => state.auth);
  const activeCharacterId = useAppSelector(
    (state) => state.activeCharacterSheet.activeCharacter?.id ?? null
  );
  const [claimPrompt, setClaimPrompt] = useState<ClaimPromptState | null>(null);
  const [conflictPrompt, setConflictPrompt] = useState<ConflictPromptState | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);
  const initializedUserIdRef = useRef<string | null>(null);
  const initializingUserIdRef = useRef<string | null>(null);
  const syncTimerRef = useRef<number | null>(null);
  const syncInFlightRef = useRef(false);

  const clearSyncTimer = useCallback(() => {
    if (syncTimerRef.current === null) {
      return;
    }

    window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = null;
  }, []);

  const updateActiveCharacterIfOpen = useCallback(
    async (record: PortableCharacterSheet) => {
      if (activeCharacterId !== record.identity.localId) {
        return;
      }

      const { normalizeCharacter } = await import("../pages/CharactersPage/storage");
      const character = normalizeCharacter(record);

      dispatch(
        setActiveCharacterSheet({
          character,
          characterId: record.identity.localId
        })
      );
    },
    [activeCharacterId, dispatch]
  );

  const syncDirtyCharacterRecords = useCallback(async () => {
    if (status !== "authenticated" || !user || syncInFlightRef.current) {
      return;
    }

    const ownerId = user.id;
    const syncableRecords = (await loadSyncableStoredPortableCharacterSheets()).filter(
      (record) => isPortableCharacterSheetOwnedBy(record, ownerId) && isRetryableDirtyStatus(record)
    );

    if (syncableRecords.length === 0) {
      return;
    }

    syncInFlightRef.current = true;

    try {
      let records = await loadSyncableStoredPortableCharacterSheets();

      for (const record of syncableRecords) {
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

            removeCharacterRosterEntry({
              clientId: sync.clientId,
              localId: record.identity.localId,
              remoteId: sync.remoteId
            });
          } catch (error) {
            if (error instanceof ApiOfflineError) {
              return;
            }

            if (isCharacterSheetUnavailableError(error)) {
              await refreshCharacterCloudRosterBestEffort(ownerId);
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
            replaceRawStoredCharacterRecords(records);

            const activeRecord = records.find(
              (candidateRecord) => candidateRecord.identity.localId === activeCharacterId
            );

            if (activeRecord) {
              await updateActiveCharacterIfOpen(activeRecord);
            }
          }

          continue;
        }

        try {
          if (sync.remoteId) {
            const { character } = await saveCharacterSheet(
              sync.remoteId,
              createPortableCharacterSheetSyncPayload(record, {
                includeBaseRevision: true,
                ownerId
              }),
              { suppressFailureToast: true }
            );
            nextRecord = applyCloudDocumentToPortableCharacterSheet(character);
          } else {
            const { characters } = await importCharacterSheets(
              [
                createPortableCharacterSheetSyncPayload(record, {
                  ownerId
                })
              ],
              { suppressFailureToast: true }
            );
            const importedCharacter = characters[0];

            if (!importedCharacter) {
              throw new Error("Import did not return a character sheet.");
            }

            nextRecord = applyCloudDocumentToPortableCharacterSheet(importedCharacter);
          }
        } catch (error) {
          if (error instanceof ApiOfflineError) {
            return;
          }

          if (isCharacterSheetUnavailableError(error)) {
            await refreshCharacterCloudRosterBestEffort(ownerId);
            nextRecord = detachUnavailableCloudSync(record, error);
          } else {
            const syncStatus =
              error instanceof ApiRequestFailedError && error.status === 409 ? "conflict" : "error";
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

            if (syncStatus === "conflict") {
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
        replaceRawStoredCharacterRecords(records);

        const activeRecord = records.find(
          (candidateRecord) => candidateRecord.identity.localId === activeCharacterId
        );

        if (activeRecord) {
          await updateActiveCharacterIfOpen(activeRecord);
        }
      }
    } catch (error) {
      captureCharacterSyncError(error, {
        action: "sync-loop"
      });
    } finally {
      syncInFlightRef.current = false;
    }
  }, [activeCharacterId, status, updateActiveCharacterIfOpen, user]);

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

  const initializeAuthenticatedCharacterCache = useCallback(async () => {
    if (status !== "authenticated" || !user) {
      return;
    }

    if (
      initializedUserIdRef.current === user.id ||
      initializingUserIdRef.current === user.id ||
      claimPrompt?.ownerId === user.id
    ) {
      return;
    }

    initializingUserIdRef.current = user.id;

    try {
      const localSnapshot = await loadSyncableStoredPortableCharacterSheets();
      const cloudSnapshot = await fetchCloudPortableCharacterSheets(user.id);
      const unclaimedRecords = getUnclaimedPortableCharacterSheets(localSnapshot, user.id);
      const { availableSlots, currentCount } = getImportCapacity({
        ownerId: user.id,
        localRecords: localSnapshot,
        cloudRecords: cloudSnapshot.cloudRecords,
        limit: cloudSnapshot.limit
      });

      initializedUserIdRef.current = user.id;

      if (unclaimedRecords.length > 0) {
        setClaimPrompt({
          ownerId: user.id,
          localSnapshot,
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

      replaceRawStoredCharacterRecords(
        mergeCurrentUserPortableCharacterSheets({
          ownerId: user.id,
          localRecords: localSnapshot,
          cloudRecords: cloudSnapshot.cloudRecords
        })
      );
      queueCloudSync(0);
    } catch (error) {
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

      initializedUserIdRef.current = null;
    } finally {
      initializingUserIdRef.current = null;
    }
  }, [claimPrompt?.ownerId, dispatch, queueCloudSync, status, user]);

  const confirmClaimPrompt = useCallback(
    async (selectedRecords: PortableCharacterSheet[]) => {
      if (!claimPrompt) {
        return;
      }

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
        const importedRecords =
          ownedSelectedRecords.length > 0
            ? (
                await importCharacterSheets(
                  ownedSelectedRecords.map((record) =>
                    createPortableCharacterSheetSyncPayload(record, {
                      ownerId: claimPrompt.ownerId
                    })
                  ),
                  { suppressFailureToast: true }
                )
              ).characters.map(applyCloudDocumentToPortableCharacterSheet)
            : [];
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
            createdAt: sync.lastSyncedAt ?? null,
            updatedAt: sync.lastSyncedAt ?? null
          });
        });

        saveCharacterRosterCache(claimPrompt.ownerId, [
          ...claimPrompt.cloudRosterDocuments,
          ...importedRosterDocuments
        ]);
        replaceRawStoredCharacterRecords(finalRecords);
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
        setIsClaiming(false);
      }
    },
    [claimPrompt, dispatch, queueCloudSync]
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

    setIsResolvingConflict(true);

    try {
      const { character } = await saveCharacterSheet(
        sync.remoteId,
        createPortableCharacterSheetSyncPayload(conflictPrompt.record, {
          force: true,
          ownerId: user.id
        }),
        { suppressFailureToast: true }
      );
      const record = storeCloudCharacterSheetDocument(character, {
        localId: conflictPrompt.record.identity.localId
      });

      await updateActiveCharacterIfOpen(record);
      setConflictPrompt(null);
      queueCloudSync(0);
      dispatch(
        showToast({
          text: "Local character overwrote the cloud version.",
          type: "success"
        })
      );
    } catch (error) {
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
      setIsResolvingConflict(false);
    }
  }, [conflictPrompt, dispatch, queueCloudSync, status, updateActiveCharacterIfOpen, user]);

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

    setIsResolvingConflict(true);

    try {
      const { character } = await getCharacterSheet(sync.remoteId, {
        suppressFailureToast: true
      });
      const record = storeCloudCharacterSheetDocument(character, {
        localId: conflictPrompt.record.identity.localId
      });

      await updateActiveCharacterIfOpen(record);
      setConflictPrompt(null);
      queueCloudSync(0);
      dispatch(
        showToast({
          text: "Cloud character replaced the local version.",
          type: "success"
        })
      );
    } catch (error) {
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
      setIsResolvingConflict(false);
    }
  }, [conflictPrompt, dispatch, queueCloudSync, status, updateActiveCharacterIfOpen, user]);

  useEffect(() => {
    if (status !== "authenticated") {
      initializedUserIdRef.current = null;
      initializingUserIdRef.current = null;
      setClaimPrompt(null);
      clearSyncTimer();
      return;
    }

    void initializeAuthenticatedCharacterCache();
  }, [clearSyncTimer, initializeAuthenticatedCharacterCache, status]);

  useEffect(() => {
    function handleCharacterSyncRequest() {
      clearSyncTimer();
      window.setTimeout(() => {
        void syncDirtyCharacterRecords();
      }, 0);
    }

    window.addEventListener(CHARACTER_SYNC_REQUEST_EVENT, handleCharacterSyncRequest);

    return () => {
      window.removeEventListener(CHARACTER_SYNC_REQUEST_EVENT, handleCharacterSyncRequest);
    };
  }, [clearSyncTimer, syncDirtyCharacterRecords]);

  useEffect(() => {
    function handleCharacterSyncConflict(event: Event) {
      openConflictPrompt(
        (event as CustomEvent<CharacterSyncConflictEventDetail>).detail
      );
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
    function handleOnlineOrFocus() {
      if (initializedUserIdRef.current === null) {
        void initializeAuthenticatedCharacterCache();
        return;
      }

      queueCloudSync(0);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        clearSyncTimer();
        void syncDirtyCharacterRecords();
      }
    }

    window.addEventListener("online", handleOnlineOrFocus);
    window.addEventListener("focus", handleOnlineOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("online", handleOnlineOrFocus);
      window.removeEventListener("focus", handleOnlineOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearSyncTimer();
    };
  }, [clearSyncTimer, initializeAuthenticatedCharacterCache, queueCloudSync, syncDirtyCharacterRecords]);

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
