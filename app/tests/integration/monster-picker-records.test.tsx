import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { fetchMonsterByKey } from "../../src/api";
import {
  listCustomBestiary,
  type CustomBestiaryRecord,
  type CustomBestiaryListScope
} from "../../src/api/customBestiary";
import type { MonsterRecord } from "../../src/types";
import {
  useCustomBestiaryRecords,
  useMonsterPickerRecords
} from "../../src/components/CharactersPage/CharacterSheetPage/ClassFeaturesAndFeats/useMonsterPickerRecords";

vi.mock("../../src/api", async (original) => ({
  ...(await original<object>()),
  fetchMonsterByKey: vi.fn()
}));
vi.mock("../../src/api/customBestiary", async (original) => ({
  ...(await original<object>()),
  listCustomBestiary: vi.fn()
}));
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const empty: MonsterRecord[] = [];
const custom: CustomBestiaryRecord[] = [];

describe("monster picker request ownership", () => {
  it("ignores a late preview and aborted selection, then opens a saved record offline", async () => {
    const stale = deferred<MonsterRecord>(),
      fresh = deferred<MonsterRecord>(),
      selection = deferred<MonsterRecord>();
    vi.mocked(fetchMonsterByKey).mockImplementation((key) =>
      key === "late-preview"
        ? stale.promise
        : key === "fresh-preview"
          ? fresh.promise
          : selection.promise
    );
    const hook = renderHook(
      ({ online, scope }) => useMonsterPickerRecords(empty, custom, online, scope),
      { initialProps: { online: true, scope: "first" } }
    );
    act(() => hook.result.current.setPreviewKey("late-preview"));
    act(() => hook.result.current.setPreviewKey("fresh-preview"));
    await act(async () => fresh.resolve({ key: "fresh-preview", name: "Fresh monster" }));
    await act(async () => stale.resolve({ key: "late-preview", name: "Stale monster" }));
    expect(hook.result.current.previewMonster?.name).toBe("Fresh monster");
    const pending = hook.result.current.resolveMonster("pending-selection");
    hook.rerender({ online: false, scope: "second" });
    await act(async () =>
      selection.resolve({ key: "pending-selection", name: "Canceled selection" })
    );
    expect(await pending).toBeNull();
    act(() => hook.result.current.setPreviewKey(null));
    act(() => hook.result.current.setPreviewKey("fresh-preview"));
    expect(hook.result.current.previewStatus).toBe("ready");
    expect(hook.result.current.previewMonster?.name).toBe("Fresh monster");
    expect(fetchMonsterByKey).toHaveBeenCalledTimes(3);
  });

  it("keeps cached custom records when switching views and rejects a previous account's delayed response", async () => {
    const stale = deferred<{ customBestiary: CustomBestiaryRecord[] }>();
    const record: CustomBestiaryRecord = {
      id: "mine",
      ownerId: "first",
      ownerNickname: null,
      public: false,
      monster: { key: "custom:mine", name: "My beast" },
      createdAt: null,
      updatedAt: null
    };
    vi.mocked(listCustomBestiary)
      .mockResolvedValueOnce({ customBestiary: [record] })
      .mockImplementationOnce(() => stale.promise)
      .mockResolvedValueOnce({ customBestiary: [] });
    const hook = renderHook(
      ({
        owner,
        scope,
        enabled
      }: {
        owner: string;
        scope: CustomBestiaryListScope;
        enabled: boolean;
      }) => useCustomBestiaryRecords(owner, scope, enabled),
      { initialProps: { owner: "first", scope: "mine" as CustomBestiaryListScope, enabled: true } }
    );
    await waitFor(() => expect(hook.result.current.customBestiaryRecords).toEqual([record]));
    hook.rerender({ owner: "first", scope: "mine", enabled: false });
    hook.rerender({ owner: "first", scope: "mine", enabled: true });
    expect(hook.result.current.customBestiaryRecords).toEqual([record]);
    expect(listCustomBestiary).toHaveBeenCalledTimes(1);
    hook.rerender({ owner: "first", scope: "public", enabled: true });
    hook.rerender({ owner: "second", scope: "mine", enabled: true });
    await waitFor(() => expect(hook.result.current.customBestiaryStatus).toBe("ready"));
    await act(async () => stale.resolve({ customBestiary: [record] }));
    expect(hook.result.current.customBestiaryRecords).toEqual([]);
  });
});
