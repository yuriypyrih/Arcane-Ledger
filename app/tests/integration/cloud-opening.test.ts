import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCharacterSheet, type CharacterSheetCloudDocument } from "../../src/api/characters";
import { ApiOfflineError } from "../../src/api/client";
import { resolvePortableCharacterSheetForOpen } from "../../src/pages/CharactersPage/resolvePortableCharacterSheet";
import {
  clearRawStoredCharacters,
  replaceRawStoredCharacterRecords,
  loadStoredPortableCharacterSheetByMatch
} from "../../src/pages/CharactersPage/portableCharacterSheetStorage";
import { portableSheet } from "../fixtures/portable";

vi.mock("../../src/api/characters", async (original) => ({
  ...(await original<object>()),
  getCharacterSheet: vi.fn()
}));
const getCloud = vi.mocked(getCharacterSheet);
function local() {
  return portableSheet({
    metadata: {
      sheetSizeBytes: 0,
      sync: {
        clientId: "client",
        ownerId: "owner",
        remoteId: "remote",
        localRevision: 1,
        remoteRevision: 1,
        syncStatus: "synced"
      }
    }
  });
}
function cloud(): CharacterSheetCloudDocument {
  const sheet = local();
  sheet.vitals.currentHitPoints = 20;
  return {
    id: "remote",
    ownerId: "owner",
    clientId: "client",
    localId: 101,
    revision: 2,
    schemaVersion: 2,
    sheet,
    summary: sheet.summary,
    avatar: null,
    backgroundTexture: null,
    createdAt: null,
    updatedAt: null
  };
}
beforeEach(() => {
  clearRawStoredCharacters();
  getCloud.mockReset();
  replaceRawStoredCharacterRecords([local()]);
});
describe("real cloud-opening reconciliation at the transport boundary", () => {
  it("adopts a newer server revision when local state is clean", async () => {
    getCloud.mockResolvedValue({ character: cloud() });
    const result = await resolvePortableCharacterSheetForOpen(101, { ownerId: "owner" });
    expect(result?.vitals.currentHitPoints).toBe(20);
    expect(result?.identity.localId).toBe(101);
    expect(loadStoredPortableCharacterSheetByMatch({ localId: 101 })?.vitals.currentHitPoints).toBe(
      20
    );
    expect(result?.metadata?.sync).toMatchObject({ remoteRevision: 2, syncStatus: "synced" });
  });
  it("re-reads local edits made during the network request and marks a conflict", async () => {
    let resolve!: (value: { character: CharacterSheetCloudDocument }) => void;
    getCloud.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        })
    );
    const pending = resolvePortableCharacterSheetForOpen(101, { ownerId: "owner" });
    const edited = local();
    edited.vitals.currentHitPoints = 9;
    edited.metadata!.sync = { ...edited.metadata!.sync!, localRevision: 2, syncStatus: "dirty" };
    replaceRawStoredCharacterRecords([edited]);
    resolve({ character: cloud() });
    const result = await pending;
    expect(result?.vitals.currentHitPoints).toBe(9);
    expect(result?.metadata?.sync?.syncStatus).toBe("conflict");
    expect(loadStoredPortableCharacterSheetByMatch({ localId: 101 })?.vitals.currentHitPoints).toBe(
      9
    );
  });
  it("does not overwrite a newer local revision with an older server response", async () => {
    const newer = local();
    newer.vitals.currentHitPoints = 7;
    newer.metadata!.sync!.remoteRevision = 3;
    replaceRawStoredCharacterRecords([newer]);
    getCloud.mockResolvedValue({ character: cloud() });
    expect(
      (await resolvePortableCharacterSheetForOpen(101, { ownerId: "owner" }))?.vitals
        .currentHitPoints
    ).toBe(7);
  });
  it("keeps the saved sheet when the API is offline", async () => {
    getCloud.mockRejectedValue(new ApiOfflineError());
    expect(
      (await resolvePortableCharacterSheetForOpen(101, { ownerId: "owner" }))?.vitals
        .currentHitPoints
    ).toBe(30);
    expect(
      loadStoredPortableCharacterSheetByMatch({ localId: 101 })?.metadata?.sync?.syncStatus
    ).toBe("synced");
  });
  it("guest opening never contacts the cloud API", async () => {
    expect((await resolvePortableCharacterSheetForOpen(101))?.identity.localId).toBe(101);
    expect(getCloud).not.toHaveBeenCalled();
  });
});
