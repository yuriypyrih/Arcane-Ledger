import { useCallback, useEffect, useRef } from "react";
import type { Character } from "../../../types";
import { captureAppError } from "../../../lib/sentry";
import {
  findCharacter,
  normalizeCharacter,
  upsertTrustedCharacter
} from "../storage";
import {
  commitActiveCharacterSheet,
  markActiveCharacterSheetPersisted,
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

const hitPointSaveDebounceMs = 150;
const storageSaveDebounceMs = 300;
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
  const initialCharacterRef = useRef<{ characterId: number; character: Character | null }>({
    characterId,
    character: loadCharacter(characterId)
  });
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

    dispatch(markActiveCharacterSheetPersisted({ characterId: savedCharacter.id }));
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
    function handlePageHide() {
      flushPendingSaves();
    }

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [flushPendingSaves]);

  useEffect(() => {
    flushPendingSaves();

    const nextCharacter = loadCharacter(characterId);

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
        characterId: Number.isFinite(characterId) ? characterId : null
      })
    );
  }, [characterId, dispatch, flushPendingSaves]);

  return {
    character,
    persistCharacter,
    queueHitPointCharacterSave
  };
}
