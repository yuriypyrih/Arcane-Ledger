import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearRawStoredCharacters,
  loadRawStoredCharacterRecords,
  replaceRawStoredCharacterRecords,
  CHARACTER_STORAGE_CHANGED_EVENT
} from "../../src/pages/CharactersPage/portableCharacterSheetStorage";
import { findCharacter, upsertTrustedCharacter } from "../../src/pages/CharactersPage/storage";
import { normalizeCharacterCompanions } from "../../src/pages/CharactersPage/companions";
import { characterFixture } from "../fixtures/character";

beforeEach(() => clearRawStoredCharacters());
describe("durable local saves", () => {
  it("round-trips edited health, currency and companions", () => {
    const character = characterFixture({
      currentHitPoints: 17,
      companions: normalizeCharacterCompanions([
        { id: "owl", name: "Scout Owl", maxHitPoints: 12, currentHitPoints: 7 }
      ]),
      currencies: { copper: 0, silver: 0, electrum: 0, gold: 41, platinum: 0 }
    });
    upsertTrustedCharacter(character);
    expect(findCharacter(character.id)).toMatchObject({
      currentHitPoints: 17,
      currencies: { copper: 0, silver: 0, electrum: 0, gold: 41, platinum: 0 }
    });
    expect(findCharacter(character.id)?.companions?.[0]).toMatchObject({
      id: "owl",
      name: "Scout Owl",
      currentHitPoints: 7,
      maxHitPoints: 12
    });
    expect(
      JSON.parse(localStorage.getItem("arcane-ledger.characters")!)[0].companions.entries[0]
    ).toMatchObject({ id: "owl", name: "Scout Owl", currentHitPoints: 7 });
    expect(
      JSON.parse(localStorage.getItem("arcane-ledger.characters")!)[0].vitals.currentHitPoints
    ).toBe(17);
  });
  it("keeps the previous committed cache and emits no success event when a write fails", () => {
    replaceRawStoredCharacterRecords([{ saved: true }]);
    const changed = vi.fn();
    window.addEventListener(CHARACTER_STORAGE_CHANGED_EVENT, changed);
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    expect(() => replaceRawStoredCharacterRecords([{ unsaved: true }])).toThrow("full");
    expect(loadRawStoredCharacterRecords()).toEqual([{ saved: true }]);
    expect(changed).not.toHaveBeenCalled();
    window.removeEventListener(CHARACTER_STORAGE_CHANGED_EVENT, changed);
  });
});
