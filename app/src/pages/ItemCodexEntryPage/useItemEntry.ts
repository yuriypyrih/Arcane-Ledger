import { useEffect, useState } from "react";
import { fetchItemByKey } from "../../api";
import type { CodexStatus, ItemRecord } from "../../types";

const itemEntryCache = new Map<string, ItemRecord>();

type UseItemEntryOptions = {
  enabled?: boolean;
  initialItem?: ItemRecord | null;
};

export function primeItemEntryCache(item: ItemRecord | null | undefined) {
  if (!item?.key) {
    return;
  }

  itemEntryCache.set(item.key, item);
}

export function useItemEntry(key: string | undefined, options?: UseItemEntryOptions) {
  const enabled = options?.enabled ?? true;
  const [item, setItem] = useState<ItemRecord | null>(() => {
    if (options?.initialItem) {
      primeItemEntryCache(options.initialItem);
      return options.initialItem;
    }

    return key ? itemEntryCache.get(key) ?? null : null;
  });
  const [status, setStatus] = useState<CodexStatus>(() => {
    if (!enabled || !key) {
      return "ready";
    }

    return options?.initialItem || (key && itemEntryCache.has(key)) ? "ready" : "loading";
  });

  useEffect(() => {
    let active = true;

    async function loadItem() {
      if (!enabled || !key) {
        setItem(null);
        setStatus("ready");
        return;
      }

      const cachedItem = itemEntryCache.get(key);
      const initialItem = options?.initialItem?.key === key ? options.initialItem : null;

      if (initialItem) {
        primeItemEntryCache(initialItem);
        setItem(initialItem);
        setStatus("ready");
        return;
      }

      if (cachedItem) {
        setItem(cachedItem);
        setStatus("ready");
        return;
      }

      setStatus("loading");

      try {
        const payload = await fetchItemByKey(key);

        if (!active) {
          return;
        }

        primeItemEntryCache(payload);
        setItem(payload);
        setStatus("ready");
      } catch {
        if (!active) {
          return;
        }

        setItem(null);
        setStatus("error");
      }
    }

    void loadItem();

    return () => {
      active = false;
    };
  }, [enabled, key, options?.initialItem]);

  return {
    item,
    status
  };
}
