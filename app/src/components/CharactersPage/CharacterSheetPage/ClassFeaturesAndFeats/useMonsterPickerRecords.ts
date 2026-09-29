import { useEffect, useRef, useState } from "react";
import { fetchMonsterByKey, isApiOfflineError } from "../../../../api";
import {
  listCustomBestiary,
  type CustomBestiaryListScope,
  type CustomBestiaryRecord
} from "../../../../api/customBestiary";
import type { CodexStatus, MonsterRecord } from "../../../../types";
import {
  getCachedMonsterEntry,
  getMonsterKey,
  primeMonsterEntryCache
} from "../../../../utils/monsters";
import { getCustomBestiaryMonsterByKey } from "../CompanionsSection/customBestiaryBrowser";

/** A request belongs to its auth identity and scope until it completes. */
export function useCustomBestiaryRecords(
  authUserId: string | null,
  customBestiaryScope: CustomBestiaryListScope,
  enabled: boolean
) {
  const recordsByScope = useRef(new Map<string, CustomBestiaryRecord[]>());
  const [result, setResult] = useState<{
    key: string;
    records: CustomBestiaryRecord[];
    status: CodexStatus;
  } | null>(null);
  const loadKey = enabled && authUserId ? `${authUserId}:${customBestiaryScope}` : null;
  useEffect(() => {
    if (!loadKey) return;
    const cached = recordsByScope.current.get(loadKey);
    if (cached) {
      setResult({ key: loadKey, records: cached, status: "ready" });
      return;
    }
    let active = true;
    setResult({ key: loadKey, records: [], status: "loading" });
    void listCustomBestiary({ scope: customBestiaryScope, suppressFailureToast: true })
      .then(({ customBestiary }) => {
        if (active) {
          recordsByScope.current.set(loadKey, customBestiary);
          setResult({ key: loadKey, records: customBestiary, status: "ready" });
        }
      })
      .catch((error) => {
        if (active)
          setResult({
            key: loadKey,
            records: [],
            status: isApiOfflineError(error) ? "server-unavailable" : "error"
          });
      });
    return () => {
      active = false;
    };
  }, [loadKey, customBestiaryScope]);
  return {
    customBestiaryRecords: result?.key === loadKey ? result.records : emptyRecords,
    customBestiaryStatus: result?.key === loadKey ? result.status : ("ready" as CodexStatus)
  };
}
const emptyRecords: CustomBestiaryRecord[] = [];

export function useMonsterPickerRecords(
  selectedMonsters: readonly MonsterRecord[],
  customBestiaryRecords: CustomBestiaryRecord[],
  isOnline: boolean,
  requestScope: string
) {
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [previewMonster, setPreviewMonster] = useState<MonsterRecord | null>(null);
  const [previewStatus, setPreviewStatus] = useState<CodexStatus>("ready");
  const [monsterCache, setMonsterCache] = useState<Record<string, MonsterRecord>>(() =>
    Object.fromEntries(selectedMonsters.map((monster) => [getMonsterKey(monster), monster]))
  );
  const selectionRequests = useRef(new Set<AbortController>());
  useEffect(() => {
    if (selectedMonsters.length)
      setMonsterCache((current) => ({
        ...current,
        ...Object.fromEntries(selectedMonsters.map((monster) => [getMonsterKey(monster), monster]))
      }));
  }, [selectedMonsters]);
  useEffect(() => {
    const requests = selectionRequests.current;
    return () => {
      requests.forEach((request) => request.abort());
      requests.clear();
    };
  }, [requestScope]);
  useEffect(() => {
    let active = true;
    const abortController = new AbortController();

    async function loadPreview() {
      if (!previewKey) {
        setPreviewMonster(null);
        setPreviewStatus("ready");
        return;
      }

      const customBestiaryMonster = getCustomBestiaryMonsterByKey(
        customBestiaryRecords,
        previewKey
      );
      const cachedMonster =
        customBestiaryMonster ?? monsterCache[previewKey] ?? getCachedMonsterEntry(previewKey);

      if (cachedMonster) {
        primeMonsterEntryCache(cachedMonster);
        setPreviewMonster(cachedMonster);
        setPreviewStatus("ready");
        return;
      }

      if (!isOnline) {
        setPreviewMonster(null);
        setPreviewStatus("server-unavailable");
        return;
      }

      setPreviewStatus("loading");

      try {
        const payload = await fetchMonsterByKey(previewKey, {
          signal: abortController.signal
        });

        if (!active) {
          return;
        }

        primeMonsterEntryCache(payload);
        setMonsterCache((currentCache) => ({
          ...currentCache,
          [getMonsterKey(payload)]: payload
        }));
        setPreviewMonster(payload);
        setPreviewStatus("ready");
      } catch (error) {
        if (!active || abortController.signal.aborted) {
          return;
        }

        setPreviewMonster(null);
        setPreviewStatus(isApiOfflineError(error) ? "server-unavailable" : "error");
      }
    }

    void loadPreview();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [customBestiaryRecords, isOnline, monsterCache, previewKey]);
  async function resolveMonster(key: string): Promise<MonsterRecord | null> {
    const cached =
      getCustomBestiaryMonsterByKey(customBestiaryRecords, key) ??
      monsterCache[key] ??
      getCachedMonsterEntry(key);
    if (cached) return cached;
    const controller = new AbortController();
    selectionRequests.current.add(controller);
    try {
      const monster = await fetchMonsterByKey(key, { signal: controller.signal });
      if (controller.signal.aborted) return null;
      primeMonsterEntryCache(monster);
      setMonsterCache((current) => ({ ...current, [getMonsterKey(monster)]: monster }));
      return monster;
    } catch (error) {
      if (controller.signal.aborted) return null;
      throw error;
    } finally {
      selectionRequests.current.delete(controller);
    }
  }
  return { previewKey, setPreviewKey, previewMonster, previewStatus, resolveMonster };
}
