import { characterFixture } from "../fixtures/character";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  clearLocalAuthSession,
  handleExpiredAuthSession,
  hasAuthSessionMarker,
  markAuthSessionActive
} from "../../src/auth/authSessionLifecycle";
import { store, setActiveCharacterSheet } from "../../src/store";
import { upsertTrustedCharacter } from "../../src/pages/CharactersPage/storage";
import {
  clearRawStoredCharacters,
  loadRawStoredCharacterRecords
} from "../../src/pages/CharactersPage/portableCharacterSheetStorage";

beforeEach(() => {
  clearRawStoredCharacters();
  markAuthSessionActive();
});
describe("session boundaries", () => {
  it("clears private local sheets and active state on logout", () => {
    const character = characterFixture();
    upsertTrustedCharacter(character);
    store.dispatch(setActiveCharacterSheet({ character, characterId: character.id }));
    clearLocalAuthSession();
    expect(hasAuthSessionMarker()).toBe(false);
    expect(loadRawStoredCharacterRecords()).toEqual([]);
    expect(store.getState().activeCharacterSheet.activeCharacter).toBeNull();
    expect(store.getState().auth.status).toBe("guest");
  });
  it("handles repeated expiry responses once, and can handle a later session", () => {
    const expired = vi.fn();
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, expired);
    handleExpiredAuthSession();
    handleExpiredAuthSession();
    expect(expired).toHaveBeenCalledTimes(1);
    markAuthSessionActive();
    handleExpiredAuthSession();
    expect(expired).toHaveBeenCalledTimes(2);
    window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, expired);
  });
});
