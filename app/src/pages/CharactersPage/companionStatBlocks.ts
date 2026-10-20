import type { CharacterCompanion, CompanionStatBlock } from "../../types";
import { normalizeMonsterRecord } from "../../utils/monsters";
import { isObjectRecord, normalizeText } from "../../utils/normalize";

export const baseCompanionStatBlockId = "base-stat-block";

/** Attached blocks are displayed newest first; the initial block stays last. */
export function getCompanionStatBlocks(
  companion: Pick<
    CharacterCompanion,
    "inheritedCreatureEntry" | "inheritedCreatureEntryModified" | "additionalStatBlocks"
  >
): CompanionStatBlock[] {
  return [
    ...(companion.additionalStatBlocks ?? []).slice().reverse(),
    ...(companion.inheritedCreatureEntry
      ? [
          {
            id: baseCompanionStatBlockId,
            monster: companion.inheritedCreatureEntry,
            modified: companion.inheritedCreatureEntryModified
          }
        ]
      : [])
  ];
}

export function normalizeCompanionStatBlocks(value: unknown): CompanionStatBlock[] {
  const ids = new Set<string>();
  return (Array.isArray(value) ? value : []).flatMap((entry, index) => {
    if (!isObjectRecord(entry)) return [];
    const monster = normalizeMonsterRecord(entry.monster);
    const id = normalizeText(entry.id, `stat-block-${index}`);
    if (!monster || id === baseCompanionStatBlockId || ids.has(id)) return [];
    ids.add(id);
    return [{ id, monster, modified: entry.modified === true }];
  });
}
