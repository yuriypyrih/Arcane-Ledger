import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { store, setActiveCharacterSheet, setGuestSession } from "../../src/store";
import { findCharacter, upsertTrustedCharacter } from "../../src/pages/CharactersPage/storage";
import { clearRawStoredCharacters } from "../../src/pages/CharactersPage/portableCharacterSheetStorage";
import { createPortableCharacterSheet } from "../../src/pages/CharactersPage/portableCharacterSheet";
import { resolvePortableCharacterSheetForOpen } from "../../src/pages/CharactersPage/resolvePortableCharacterSheet";
import { useCharacterSheetPersistence } from "../../src/pages/CharactersPage/CharacterSheetPage/useCharacterSheetPersistence";
import { characterFixture } from "../fixtures/character";

vi.mock("../../src/pages/CharactersPage/resolvePortableCharacterSheet", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  resolvePortableCharacterSheetForOpen: vi.fn()
}));
function Wrapper({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {children}
      </MemoryRouter>
    </Provider>
  );
}
const open = vi.mocked(resolvePortableCharacterSheetForOpen);
const options = { normalize: false as const, domains: ["resources" as const] };
beforeEach(() => {
  clearRawStoredCharacters();
  store.dispatch(setActiveCharacterSheet({ character: null, characterId: null }));
  store.dispatch(setGuestSession());
  upsertTrustedCharacter(characterFixture());
  open.mockReset();
  open.mockResolvedValue(createPortableCharacterSheet(characterFixture()));
  vi.useFakeTimers();
});
async function mount() {
  const hook = renderHook(({ id }) => useCharacterSheetPersistence(id), {
    initialProps: { id: 101 },
    wrapper: Wrapper
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1);
  });
  return hook;
}
describe("character sheet persistence", () => {
  it("composes rapid edits, updates the sheet immediately and flushes on leaving the page", async () => {
    const { result, unmount } = await mount();
    act(() => {
      result.current.persistCharacter(
        (c) => ({ ...c, currentHitPoints: c.currentHitPoints - 3 }),
        options
      );
      result.current.persistCharacter(
        (c) => ({ ...c, currentHitPoints: c.currentHitPoints - 4 }),
        options
      );
    });
    expect(result.current.character?.currentHitPoints).toBe(23);
    expect(findCharacter(101)?.currentHitPoints).toBe(30);
    unmount();
    expect(findCharacter(101)?.currentHitPoints).toBe(23);
  });
  it("preserves a queued health edit when another section is edited", async () => {
    const { result } = await mount();
    act(() => {
      result.current.queueHitPointCharacterSave({
        ...result.current.character!,
        currentHitPoints: 11
      });
      result.current.persistCharacter((c) => ({ ...c, name: "Renamed" }), { normalize: false });
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(findCharacter(101)).toMatchObject({ name: "Renamed", currentHitPoints: 11 });
  });
  it.each([false, true])(
    "keeps a local edit when a delayed cloud response arrives (already flushed: %s)",
    async (flushed) => {
      let resolve!: (
        value: Awaited<ReturnType<typeof resolvePortableCharacterSheetForOpen>>
      ) => void;
      open.mockImplementation(
        () =>
          new Promise((r) => {
            resolve = r;
          })
      );
      const { result } = await mount();
      act(() => {
        result.current.persistCharacter((c) => ({ ...c, currentHitPoints: 9 }), options);
      });
      if (flushed)
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1100);
        });
      await act(async () => {
        resolve(createPortableCharacterSheet(characterFixture({ currentHitPoints: 30 })));
      });
      expect(result.current.character?.currentHitPoints).toBe(9);
      act(() => {
        window.dispatchEvent(new Event("pagehide"));
      });
      expect(findCharacter(101)?.currentHitPoints).toBe(9);
    }
  );
  it("keeps an HP edit still waiting for its short debounce when cloud opening finishes", async () => {
    let resolve!: (value: Awaited<ReturnType<typeof resolvePortableCharacterSheetForOpen>>) => void;
    open.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        })
    );
    const { result } = await mount();
    act(() => {
      result.current.queueHitPointCharacterSave({
        ...result.current.character!,
        currentHitPoints: 6
      });
    });
    await act(async () => {
      resolve(createPortableCharacterSheet(characterFixture()));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(160);
    });
    expect(result.current.character?.currentHitPoints).toBe(6);
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(findCharacter(101)?.currentHitPoints).toBe(6);
  });
  it("keeps an edit made before the deferred opening task runs", async () => {
    const { result } = renderHook(() => useCharacterSheetPersistence(101), { wrapper: Wrapper });
    act(() => {
      result.current.persistCharacter((c) => ({ ...c, currentHitPoints: 8 }), options);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(result.current.character?.currentHitPoints).toBe(8);
  });
  it("keeps edits when cloud opening fails", async () => {
    let reject!: (error: Error) => void;
    open.mockImplementation(
      () =>
        new Promise((_, r) => {
          reject = r;
        })
    );
    const { result } = await mount();
    act(() => {
      result.current.persistCharacter((c) => ({ ...c, currentHitPoints: 12 }), options);
    });
    await act(async () => {
      reject(new Error("offline"));
    });
    expect(result.current.character?.currentHitPoints).toBe(12);
  });
  it("ignores an old character's response after navigation", async () => {
    const second = characterFixture({ id: 102, name: "Second" });
    upsertTrustedCharacter(second);
    let resolve!: (value: Awaited<ReturnType<typeof resolvePortableCharacterSheetForOpen>>) => void;
    open
      .mockImplementationOnce(
        () =>
          new Promise((r) => {
            resolve = r;
          })
      )
      .mockResolvedValueOnce(createPortableCharacterSheet(second));
    const { result, rerender } = await mount();
    rerender({ id: 102 });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    await act(async () => {
      resolve(createPortableCharacterSheet(characterFixture()));
    });
    expect(result.current.character?.id).toBe(102);
  });
  it("retains a failed write for a later lifecycle flush", async () => {
    const { result } = await mount();
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("disk full");
    });
    expect(() =>
      act(() => {
        result.current.persistCharacter((c) => ({ ...c, currentHitPoints: 7 }), {
          ...options,
          flush: true
        });
      })
    ).toThrow("disk full");
    expect(store.getState().activeCharacterSheet.dirty).toBe(true);
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(
      JSON.parse(localStorage.getItem("arcane-ledger.characters")!)[0].vitals.currentHitPoints
    ).toBe(7);
    expect(store.getState().activeCharacterSheet.dirty).toBe(false);
  });
});
