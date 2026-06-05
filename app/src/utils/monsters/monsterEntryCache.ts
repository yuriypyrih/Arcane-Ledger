import type { MonsterRecord } from "../../types";
import { getMonsterKey } from "./normalizeMonsterRecord";
import { LruCache } from "../lruCache";

const monsterEntryCache = new LruCache<string, MonsterRecord>(75);

export function getCachedMonsterEntry(key: string): MonsterRecord | undefined {
  return monsterEntryCache.get(key);
}

export function hasCachedMonsterEntry(key: string): boolean {
  return monsterEntryCache.has(key);
}

export function primeMonsterEntryCache(monster: MonsterRecord | null | undefined) {
  if (!monster?.key) {
    return;
  }

  monsterEntryCache.set(getMonsterKey(monster), monster);
}
