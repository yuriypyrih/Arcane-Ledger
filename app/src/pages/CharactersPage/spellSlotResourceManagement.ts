import type { Character } from "../../types";
import { getCharacterSpellSlotPools, setSlotPoolExpended } from "./multiclassSpellcasting";
import {
  adjustExpended,
  type ResourceAdjustment,
  type ResourceManagementTarget
} from "./resourceManagement";

type SlotTarget = Extract<ResourceManagementTarget, { kind: "spell-slots" }>;

export function getManagedSpellSlotPool(character: Character, target: SlotTarget) {
  const pools = getCharacterSpellSlotPools(character);
  const selectedId = character.slotPoolId ?? "standard";
  const pool =
    target.pool === "pact"
      ? (pools.find(
          (candidate) => candidate.id === selectedId && candidate.recovery === "short-rest"
        ) ?? pools.find((candidate) => candidate.recovery === "short-rest"))
      : pools.find((candidate) => candidate.id === selectedId);
  return pool && pool.id === selectedId
    ? { ...pool, expended: character.spellSlotsExpended ?? pool.expended }
    : pool;
}

export function getManagedSpellSlotLevels(character: Character, target: SlotTarget) {
  return (getManagedSpellSlotPool(character, target)?.totals ?? []).flatMap((total, index) =>
    total > 0 && index + 1 >= target.minimumLevel && index + 1 <= (target.maximumLevel ?? 9)
      ? [index + 1]
      : []
  );
}

export function adjustManagedSpellSlot(
  character: Character,
  target: SlotTarget,
  level: number,
  adjustment: ResourceAdjustment
): Character {
  const pool = getManagedSpellSlotPool(character, target);
  if (!pool || !getManagedSpellSlotLevels(character, target).includes(level)) return character;
  const expended = [...pool.expended];
  expended[level - 1] = adjustExpended(expended[level - 1], pool.totals[level - 1], adjustment);
  // The sheet's class-scoped persistence adapter projects this array back to its
  // selected pool. Other explicitly targeted pools keep their separate identity.
  return pool.id === (character.slotPoolId ?? "standard")
    ? { ...character, spellSlotsExpended: expended }
    : setSlotPoolExpended(character, pool.id, expended);
}
