import type { Character } from "../../types";
import type { FeatureActionHeaderTag } from "./classFeatures/types";
import { getClassHitDicePools } from "./hitDice";
import { getManagedSpellSlotPool } from "./spellSlotResourceManagement";
import type { ResourceManagementTarget } from "./resourceManagement";

export function getWeaponResourceHeaderTags(
  character: Character,
  targets: Array<ResourceManagementTarget | false | null | undefined>
): FeatureActionHeaderTag[] {
  const unique = new Map<string, ResourceManagementTarget>();
  targets.forEach((target) => {
    if (target) unique.set(target.id, target);
  });
  return [...unique.values()].map((target) => {
    let current = 0;
    let total = 0;
    if (target.kind === "counter") {
      current = target.remaining(character);
      total = target.total(character);
    } else if (target.kind === "hit-dice") {
      for (const pool of getClassHitDicePools(character)) {
        current += pool.remaining;
        total += pool.total;
      }
    } else {
      const pool = getManagedSpellSlotPool(character, target);
      pool?.totals.forEach((count, index) => {
        if (index + 1 < target.minimumLevel || index + 1 > (target.maximumLevel ?? 9)) return;
        total += count;
        current += Math.max(0, count - (pool.expended[index] ?? 0));
      });
    }
    return { kind: "text", label: target.label, value: `${current}/${total}`, management: target };
  });
}
