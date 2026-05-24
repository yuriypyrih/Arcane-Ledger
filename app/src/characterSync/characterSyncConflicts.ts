export const CHARACTER_SYNC_CONFLICT_EVENT = "arcane-ledger:character-sync-conflict";

export type CharacterSyncConflictEventDetail = {
  clientId?: string;
  localId: number;
  message?: string;
  remoteId?: string;
  serverRevision?: number;
};

export function dispatchCharacterSyncConflict(detail: CharacterSyncConflictEventDetail) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(CHARACTER_SYNC_CONFLICT_EVENT, { detail }));
}
