import { useCallback, useEffect, useRef, useState } from "react";
import type { Character } from "../../../types";
import { findCharacter, upsertCharacter } from "../storage";
import type { PersistCharacterUpdater, QueueCharacterSave } from "./types";

const hitPointSaveDebounceMs = 150;

function loadCharacter(characterId: number): Character | null {
  if (!Number.isFinite(characterId) || characterId <= 0) {
    return null;
  }

  return findCharacter(characterId) ?? null;
}

export function useCharacterSheetPersistence(characterId: number) {
  const [character, setCharacter] = useState<Character | null>(() => loadCharacter(characterId));
  const characterRef = useRef<Character | null>(character);
  const pendingHitPointCharacterRef = useRef<Character | null>(null);
  const pendingHitPointTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(false);

  const clearPendingHitPointTimeout = useCallback(() => {
    if (pendingHitPointTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(pendingHitPointTimeoutRef.current);
    pendingHitPointTimeoutRef.current = null;
  }, []);

  const persistCharacterSnapshot = useCallback((nextCharacter: Character): Character => {
    const { id, ...draft } = nextCharacter;
    const savedCharacter = upsertCharacter(draft, id);

    pendingHitPointCharacterRef.current = null;
    characterRef.current = savedCharacter;

    if (isMountedRef.current) {
      setCharacter(savedCharacter);
    }

    return savedCharacter;
  }, []);

  const flushPendingHitPointSave = useCallback((): Character | null => {
    clearPendingHitPointTimeout();

    const pendingCharacter = pendingHitPointCharacterRef.current;

    if (!pendingCharacter) {
      return characterRef.current;
    }

    pendingHitPointCharacterRef.current = null;
    return persistCharacterSnapshot(pendingCharacter);
  }, [clearPendingHitPointTimeout, persistCharacterSnapshot]);

  const persistCharacter = useCallback<PersistCharacterUpdater>(
    (updater) => {
      const currentCharacter = flushPendingHitPointSave();

      if (!currentCharacter || !Number.isFinite(currentCharacter.id)) {
        return;
      }

      const nextCharacter = updater(currentCharacter);

      if (nextCharacter === currentCharacter) {
        return;
      }

      persistCharacterSnapshot(nextCharacter);
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
      flushPendingHitPointSave();
    };
  }, [flushPendingHitPointSave]);

  useEffect(() => {
    function handlePageHide() {
      flushPendingHitPointSave();
    }

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [flushPendingHitPointSave]);

  useEffect(() => {
    flushPendingHitPointSave();

    const nextCharacter = loadCharacter(characterId);

    characterRef.current = nextCharacter;
    pendingHitPointCharacterRef.current = null;
    setCharacter(nextCharacter);
  }, [characterId, flushPendingHitPointSave]);

  return {
    character,
    persistCharacter,
    queueHitPointCharacterSave
  };
}
