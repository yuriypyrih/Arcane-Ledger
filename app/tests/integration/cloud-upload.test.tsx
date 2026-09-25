import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  listFullCharacterSheets,
  saveCharacterSheet,
  type CharacterSheetCloudDocument
} from "../../src/api/characters";
import { ApiRequestFailedError } from "../../src/api/client";
import CharacterSyncBootstrap from "../../src/characterSync/CharacterSyncBootstrap";
import { clearLocalAuthSession } from "../../src/auth/authSessionLifecycle";
import { store, setAuthenticatedUser, setActiveCharacterSheet } from "../../src/store";
import { normalizeCharacter } from "../../src/pages/CharactersPage/storage";
import {
  loadStoredPortableCharacterSheetByMatch,
  replaceRawStoredCharacterRecords
} from "../../src/pages/CharactersPage/portableCharacterSheetStorage";
import { portableSheet } from "../fixtures/portable";

// Keep the mounted sync coordinator, Redux, normalization, and storage real.
// Only the API boundary controls when a cloud response arrives.
vi.mock("../../src/api/characters", async (original) => ({
  ...(await original<object>()),
  listFullCharacterSheets: vi.fn(),
  saveCharacterSheet: vi.fn()
}));
const save = vi.mocked(saveCharacterSheet);
const list = vi.mocked(listFullCharacterSheets);

function cloud(hp: number, revision: number): CharacterSheetCloudDocument {
  const sheet = portableSheet();
  sheet.vitals.currentHitPoints = hp;
  return {
    id: "remote",
    ownerId: "owner",
    clientId: "client",
    localId: 101,
    revision,
    schemaVersion: 2,
    sheet,
    summary: sheet.summary,
    avatar: null,
    backgroundTexture: null,
    createdAt: null,
    updatedAt: null
  };
}

function stored() {
  const sheet = loadStoredPortableCharacterSheetByMatch({ localId: 101 });
  if (!sheet) throw new Error("The local character disappeared");
  return sheet;
}

function edit(hp: number) {
  const sheet = structuredClone(stored());
  sheet.vitals.currentHitPoints = hp;
  sheet.metadata!.sync!.localRevision += 1;
  sheet.metadata!.sync!.syncStatus = "dirty";
  replaceRawStoredCharacterRecords([sheet]);
  store.dispatch(
    setActiveCharacterSheet({ character: normalizeCharacter(sheet), characterId: 101 })
  );
}

function reconnect() {
  window.dispatchEvent(new Event("online"));
}

beforeEach(async () => {
  clearLocalAuthSession();
  save.mockReset();
  list.mockReset().mockResolvedValue({ characters: [cloud(30, 1)], count: 1, limit: 10 });
  store.dispatch(
    setAuthenticatedUser({
      id: "owner",
      email: "owner@example.test",
      nickname: "Owner",
      role: "user",
      emailVerifiedAt: null,
      createdAt: null,
      lastFeedback: null
    })
  );
  store.dispatch(
    setActiveCharacterSheet({ character: normalizeCharacter(cloud(30, 1).sheet), characterId: 101 })
  );
  await act(async () => {
    render(
      <Provider store={store}>
        <CharacterSyncBootstrap />
      </Provider>
    );
    await vi.dynamicImportSettled();
  });
  await waitFor(() => expect(stored().metadata?.sync?.syncStatus).toBe("synced"));
  // Settle the initialization sync before exercising a later upload.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});
afterEach(() => {
  cleanup();
  clearLocalAuthSession();
});

async function uploadWithNewerEdit() {
  let resolve!: (result: Awaited<ReturnType<typeof saveCharacterSheet>>) => void;
  let reject!: (error: Error) => void;
  save.mockImplementationOnce(
    () =>
      new Promise((accept, refuse) => {
        resolve = accept;
        reject = refuse;
      })
  );
  act(() => {
    edit(20);
    reconnect();
  });
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(save.mock.calls[0]![1]).toMatchObject({
    baseRevision: 1,
    sheet: { vitals: { currentHitPoints: 20 } }
  });
  act(() => {
    edit(9);
  });
  return { resolve, reject, localRevision: stored().metadata!.sync!.localRevision };
}

async function expectLocal(hp: number, syncStatus: string, remoteRevision: number) {
  await waitFor(() => {
    expect(stored().vitals.currentHitPoints).toBe(hp);
    expect(stored().metadata?.sync).toMatchObject({ syncStatus, remoteRevision });
    expect(store.getState().activeCharacterSheet.activeCharacter?.currentHitPoints).toBe(hp);
  });
}

it("keeps edits made during an upload dirty, then saves them against the returned revision", async () => {
  const pending = await uploadWithNewerEdit();
  await act(async () => {
    pending.resolve({ character: cloud(20, 2) });
  });
  await expectLocal(9, "dirty", 2);
  expect(stored().metadata?.sync?.localRevision).toBe(pending.localRevision);
  save.mockResolvedValueOnce({ character: cloud(9, 3) });
  act(reconnect);
  await expectLocal(9, "synced", 3);
  expect(save).toHaveBeenCalledTimes(2);
  expect(save.mock.calls[1]![1]).toMatchObject({
    baseRevision: 2,
    sheet: { vitals: { currentHitPoints: 9 } }
  });
});

it("retains newer edits after a failed upload and retries the latest sheet without advancing the base revision", async () => {
  const pending = await uploadWithNewerEdit();
  await act(async () => {
    pending.reject(new ApiRequestFailedError("Save unavailable", { status: 503 }));
  });
  await expectLocal(9, "error", 1);
  expect(stored().metadata?.sync?.localRevision).toBe(pending.localRevision);
  save.mockResolvedValueOnce({ character: cloud(9, 2) });
  act(reconnect);
  await expectLocal(9, "synced", 2);
  expect(save).toHaveBeenCalledTimes(2);
  expect(save.mock.calls[1]![1]).toMatchObject({
    baseRevision: 1,
    sheet: { vitals: { currentHitPoints: 9 } }
  });
});

it("preserves local edits on revision conflict and asks for a choice instead of automatically overwriting", async () => {
  const pending = await uploadWithNewerEdit();
  await act(async () => {
    pending.reject(
      new ApiRequestFailedError("Revision conflict", {
        status: 409,
        details: { serverRevision: 2 }
      })
    );
  });
  await expectLocal(9, "conflict", 1);
  expect(screen.getByRole("dialog", { name: "Character Conflict" })).toBeVisible();
  await act(async () => {
    reconnect();
    await vi.dynamicImportSettled();
  });
  expect(save).toHaveBeenCalledTimes(1);
  await expectLocal(9, "conflict", 1);
});
