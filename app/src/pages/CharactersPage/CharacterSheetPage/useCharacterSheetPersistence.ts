import { useCallback, useEffect, useRef, useState } from "react";
import type { Character } from "../../../types";
import { captureAppError } from "../../../lib/sentry";
import {
  findCharacter,
  normalizeCharacter,
  upsertTrustedCharacter
} from "../storage";
import { resolvePortableCharacterSheetForOpen } from "../resolvePortableCharacterSheet";
import {
  commitActiveCharacterSheet,
  setActiveCharacterSheet,
  useAppDispatch,
  useAppSelector
} from "../../../store";
import type {
  PersistCharacterOptions,
  PersistCharacterUpdater,
  QueueCharacterSave
} from "./types";
import { normalizeCharacterRuntimeUpdate } from "./activeCharacterNormalization";
import {
  characterSheetDomains,
  normalizeCharacterSheetDomains,
  type CharacterSheetDomain
} from "./domains";
import { measureCharacterRuntime } from "../characterRuntime/performance";
import { CHARACTER_SYNC_REQUEST_EVENT } from "../../../characterSync/characterSyncRequests";

const hitPointSaveDebounceMs = 150;
const storageSaveDebounceMs = 1000;
const storageIdleFlushTimeoutMs = 1000;

type StorageIdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (
      callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
      options?: { timeout?: number }
    ) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

function loadCharacter(characterId: number): Character | null {
  if (!Number.isFinite(characterId) || characterId <= 0) {
    return null;
  }

  try {
    return findCharacter(characterId) ?? null;
  } catch (error) {
    captureAppError(error, {
      area: "character-persistence",
      action: "load",
      extra: {
        characterId
      }
    });
    throw error;
  }
}

export function useCharacterSheetPersistence(characterId: number) {
  const dispatch = useAppDispatch();
  const activeCharacter = useAppSelector((state) => state.activeCharacterSheet.activeCharacter);
  const { status, user } = useAppSelector((state) => state.auth);
  const ownerId = status === "authenticated" && user ? user.id : null;
  const initialCharacterRef = useRef<{ characterId: number; character: Character | null }>({
    characterId,
    character: null
  });
  const [isLoadingCharacter, setIsLoadingCharacter] = useState(true);
  const fallbackCharacter =
    initialCharacterRef.current.characterId === characterId
      ? initialCharacterRef.current.character
      : null;
  const character = activeCharacter?.id === characterId ? activeCharacter : fallbackCharacter;
  const characterRef = useRef<Character | null>(character);
  const pendingHitPointCharacterRef = useRef<Character | null>(null);
  const pendingHitPointTimeoutRef = useRef<number | null>(null);
  const pendingStorageCharacterRef = useRef<Character | null>(null);
  const pendingStorageTimeoutRef = useRef<number | null>(null);
  const pendingStorageIdleCallbackRef = useRef<number | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    characterRef.current = character;
  }, [character]);

  const clearPendingStorageSchedule = useCallback(() => {
    if (pendingStorageTimeoutRef.current !== null) {
      window.clearTimeout(pendingStorageTimeoutRef.current);
      pendingStorageTimeoutRef.current = null;
    }

    if (pendingStorageIdleCallbackRef.current !== null) {
      const idleWindow = window as StorageIdleWindow;

      if (typeof idleWindow.cancelIdleCallback === "function") {
        idleWindow.cancelIdleCallback(pendingStorageIdleCallbackRef.current);
      } else {
        window.clearTimeout(pendingStorageIdleCallbackRef.current);
      }

      pendingStorageIdleCallbackRef.current = null;
    }
  }, []);

  const clearPendingHitPointTimeout = useCallback(() => {
    if (pendingHitPointTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(pendingHitPointTimeoutRef.current);
    pendingHitPointTimeoutRef.current = null;
  }, []);

  const flushPendingStorageSave = useCallback((): Character | null => {
    clearPendingStorageSchedule();

    const pendingCharacter = pendingStorageCharacterRef.current;

    if (!pendingCharacter) {
      return characterRef.current;
    }

    pendingStorageCharacterRef.current = null;
    let savedCharacter: Character;

    try {
      savedCharacter = measureCharacterRuntime("character-sheet:persistence-flush", () =>
        upsertTrustedCharacter(pendingCharacter)
      );
    } catch (error) {
      captureAppError(error, {
        area: "character-persistence",
        action: "flush-save",
        extra: {
          characterId: pendingCharacter.id
        }
      });
      throw error;
    }

    characterRef.current = savedCharacter;
    dispatch(
      commitActiveCharacterSheet({
        character: savedCharacter,
        domains: ["profile"],
        dirty: false
      })
    );
    return savedCharacter;
  }, [clearPendingStorageSchedule, dispatch]);

  const queueStorageSave = useCallback(
    (nextCharacter: Character, options?: PersistCharacterOptions) => {
      pendingStorageCharacterRef.current = nextCharacter;
      clearPendingStorageSchedule();

      if (options?.flush) {
        flushPendingStorageSave();
        return;
      }

      pendingStorageTimeoutRef.current = window.setTimeout(() => {
        pendingStorageTimeoutRef.current = null;

        const idleWindow = window as StorageIdleWindow;

        if (typeof idleWindow.requestIdleCallback === "function") {
          pendingStorageIdleCallbackRef.current = idleWindow.requestIdleCallback(
            () => {
              pendingStorageIdleCallbackRef.current = null;
              flushPendingStorageSave();
            },
            { timeout: storageIdleFlushTimeoutMs }
          );
          return;
        }

        pendingStorageIdleCallbackRef.current = window.setTimeout(() => {
          pendingStorageIdleCallbackRef.current = null;
          flushPendingStorageSave();
        }, 0);
      }, storageSaveDebounceMs);
    },
    [clearPendingStorageSchedule, flushPendingStorageSave]
  );

  const normalizeCharacterSnapshot = useCallback(
    (nextCharacter: Character, options?: PersistCharacterOptions): Character => {
      if (options?.normalize === false) {
        return nextCharacter;
      }

      if (options?.normalize === "targeted") {
        return measureCharacterRuntime("character-sheet:normalize-targeted", () =>
          normalizeCharacterRuntimeUpdate(
            nextCharacter,
            normalizeCharacterSheetDomains(options.domains)
          )
        );
      }

      return measureCharacterRuntime(
        "character-sheet:normalize-full",
        () => normalizeCharacter(nextCharacter) ?? nextCharacter
      );
    },
    []
  );

  const persistCharacterSnapshot = useCallback(
    (nextCharacter: Character, options?: PersistCharacterOptions): Character => {
      let savedCharacter: Character;

      try {
        savedCharacter = normalizeCharacterSnapshot(nextCharacter, options);
      } catch (error) {
        captureAppError(error, {
          area: "character-persistence",
          action: "normalize",
          extra: {
            characterId: nextCharacter.id,
            normalizeMode: options?.normalize ?? "full"
          }
        });
        throw error;
      }

      const domains: CharacterSheetDomain[] = options?.domains
        ? normalizeCharacterSheetDomains(options.domains)
        : [...characterSheetDomains];

      pendingHitPointCharacterRef.current = null;
      characterRef.current = savedCharacter;

      if (isMountedRef.current) {
        dispatch(
          commitActiveCharacterSheet({
            character: savedCharacter,
            domains
          })
        );
      }

      queueStorageSave(savedCharacter, options);
      return savedCharacter;
    },
    [dispatch, normalizeCharacterSnapshot, queueStorageSave]
  );

  const flushPendingHitPointSave = useCallback((): Character | null => {
    clearPendingHitPointTimeout();

    const pendingCharacter = pendingHitPointCharacterRef.current;

    if (!pendingCharacter) {
      return characterRef.current;
    }

    pendingHitPointCharacterRef.current = null;
    return persistCharacterSnapshot(pendingCharacter, {
      domains: ["resources", "statuses"],
      normalize: "targeted"
    });
  }, [clearPendingHitPointTimeout, persistCharacterSnapshot]);

  const flushPendingSaves = useCallback((): Character | null => {
    const savedCharacter = flushPendingHitPointSave();
    flushPendingStorageSave();
    return savedCharacter;
  }, [flushPendingHitPointSave, flushPendingStorageSave]);

  const persistCharacter = useCallback<PersistCharacterUpdater>(
    (updater, options) => {
      const currentCharacter = flushPendingHitPointSave();

      if (!currentCharacter || !Number.isFinite(currentCharacter.id)) {
        return;
      }

      const nextCharacter = updater(currentCharacter);

      if (nextCharacter === currentCharacter) {
        return;
      }

      persistCharacterSnapshot(nextCharacter, options);
    },
    [flushPendingHitPointSave, persistCharacterSnapshot]
  );

  const queueHitPointCharacterSave = useCallback<QueueCharacterSave>(
    (nextCharacter) => {
      if (!Number.isFinite(nextCharacter.id)) {
        return;
      }

      pendingHitPointCharacterRef.current = nextCharacter;
      clearPendingHitPointTimeout();
      pendingHitPointTimeoutRef.current = window.setTimeout(() => {
        flushPendingHitPointSave();
      }, hitPointSaveDebounceMs);
    },
    [clearPendingHitPointTimeout, flushPendingHitPointSave]
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      flushPendingSaves();
    };
  }, [flushPendingSaves]);

  useEffect(() => {
    function handleCharacterSyncRequest() {
      flushPendingSaves();
    }

    window.addEventListener(CHARACTER_SYNC_REQUEST_EVENT, handleCharacterSyncRequest);

    return () => {
      window.removeEventListener(CHARACTER_SYNC_REQUEST_EVENT, handleCharacterSyncRequest);
    };
  }, [flushPendingSaves]);

  useEffect(() => {
    function handlePageHide() {
      flushPendingSaves();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        flushPendingSaves();
      }
    }

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [flushPendingSaves]);

  useEffect(() => {
    flushPendingSaves();

    if (!Number.isFinite(characterId) || characterId <= 0) {
      initialCharacterRef.current = {
        characterId,
        character: null
      };
      characterRef.current = null;
      pendingHitPointCharacterRef.current = null;
      pendingStorageCharacterRef.current = null;
      setIsLoadingCharacter(false);
      dispatch(
        setActiveCharacterSheet({
          character: null,
          characterId: null
        })
      );
      return;
    }

    let didCancel = false;
    let openTaskId: number | null = null;

    setIsLoadingCharacter(true);
    initialCharacterRef.current = {
      characterId,
      character: null
    };
    characterRef.current = null;
    pendingHitPointCharacterRef.current = null;
    pendingStorageCharacterRef.current = null;
    dispatch(
      setActiveCharacterSheet({
        character: null,
        characterId
      })
    );

    if (status === "unknown") {
      return () => {
        didCancel = true;
      };
    }

    openTaskId = window.setTimeout(() => {
      let localCharacter: Character | null = null;

      try {
        localCharacter = loadCharacter(characterId);
      } catch {
        if (!didCancel) {
          initialCharacterRef.current = {
            characterId,
            character: null
          };
          characterRef.current = null;
          dispatch(
            setActiveCharacterSheet({
              character: null,
              characterId
            })
          );
          setIsLoadingCharacter(false);
        }

        return;
      }

      if (didCancel) {
        return;
      }

      void resolvePortableCharacterSheetForOpen(characterId, { ownerId })
        .then((record) => {
          if (didCancel) {
            return;
          }

          const nextCharacter = record ? normalizeCharacter(record) : localCharacter;

          initialCharacterRef.current = {
            characterId,
            character: nextCharacter
          };
          characterRef.current = nextCharacter;
          pendingHitPointCharacterRef.current = null;
          pendingStorageCharacterRef.current = null;
          dispatch(
            setActiveCharacterSheet({
              character: nextCharacter,
              characterId
            })
          );
        })
        .catch((error) => {
          if (didCancel) {
            return;
          }

          captureAppError(error, {
            area: "character-persistence",
            action: "resolve-open",
            extra: {
              characterId
            }
          });
          initialCharacterRef.current = {
            characterId,
            character: localCharacter
          };
          characterRef.current = localCharacter;
          dispatch(
            setActiveCharacterSheet({
              character: localCharacter,
              characterId
            })
          );
        })
        .finally(() => {
          if (!didCancel) {
            setIsLoadingCharacter(false);
          }
        });
    }, 0);

    return () => {
      didCancel = true;

      if (openTaskId !== null) {
        window.clearTimeout(openTaskId);
      }
    };
  }, [characterId, dispatch, flushPendingSaves, ownerId, status]);

  return {
    character,
    isLoadingCharacter,
    persistCharacter,
    queueHitPointCharacterSave
  };
}
