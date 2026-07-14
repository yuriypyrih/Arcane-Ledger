export const CHARACTER_SYNC_REQUEST_EVENT = "arcane-ledger:character-sync-requested";
export const CHARACTER_SYNC_COMPLETE_EVENT = "arcane-ledger:character-sync-completed";

const characterSyncRequestTimeoutMs = 30_000;
const lockedCharacterIds = new Set<number>();

export type CharacterSyncRequestEventDetail = {
  requestId: string;
};

export function acquireCharacterSyncLock(characterId: number) {
  lockedCharacterIds.add(characterId);
  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;
    lockedCharacterIds.delete(characterId);
  };
}

export function isCharacterSyncLocked(characterId: number) {
  return lockedCharacterIds.has(characterId);
}

function createCharacterSyncRequestId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function requestImmediateCharacterSync(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  const requestId = createCharacterSyncRequestId();

  return new Promise((resolve) => {
    let timeoutId: number | null = null;

    function finish() {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }

      window.removeEventListener(CHARACTER_SYNC_COMPLETE_EVENT, handleSyncComplete);
      resolve();
    }

    function handleSyncComplete(event: Event) {
      const detail = (event as CustomEvent<CharacterSyncRequestEventDetail>).detail;

      if (detail?.requestId !== requestId) {
        return;
      }

      finish();
    }

    timeoutId = window.setTimeout(finish, characterSyncRequestTimeoutMs);
    window.addEventListener(CHARACTER_SYNC_COMPLETE_EVENT, handleSyncComplete);
    window.dispatchEvent(
      new CustomEvent<CharacterSyncRequestEventDetail>(CHARACTER_SYNC_REQUEST_EVENT, {
        detail: { requestId }
      })
    );
  });
}

export function dispatchCharacterSyncRequestComplete(requestId: string | null | undefined) {
  if (typeof window === "undefined" || !requestId) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<CharacterSyncRequestEventDetail>(CHARACTER_SYNC_COMPLETE_EVENT, {
      detail: { requestId }
    })
  );
}
