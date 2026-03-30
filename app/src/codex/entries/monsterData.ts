import {
  ENTRY_CATEGORIES,
  MONSTER_TYPES,
  RARITY_TYPES
} from "./enums";
import type { MonsterEntry } from "./types";

export const monsterEntries: MonsterEntry[] = [
  {
    id: "monster-young-red-dragon",
    name: "Young Red Dragon",
    category: ENTRY_CATEGORIES.MONSTERS,
    tags: [MONSTER_TYPES.DRAGON, MONSTER_TYPES.BOSS],
    rarity: RARITY_TYPES.LEGENDARY,
    summary: "A proud and brutal predator with fiery breath and a hunger for treasure."
  }
];
