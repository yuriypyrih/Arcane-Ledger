import type { MonsterRecord } from "../../types";
import { LruCache } from "../lruCache";

const monsterEntryCache = new LruCache<string, MonsterRecord>(75);

export function getCachedMonsterEntry(slug: string): MonsterRecord | undefined {
  return monsterEntryCache.get(slug);
}

export function hasCachedMonsterEntry(slug: string): boolean {
  return monsterEntryCache.has(slug);
}

export function primeMonsterEntryCache(monster: MonsterRecord | null | undefined) {
  if (!monster?.slug) {
    return;
  }

  monsterEntryCache.set(monster.slug, monster);
}
