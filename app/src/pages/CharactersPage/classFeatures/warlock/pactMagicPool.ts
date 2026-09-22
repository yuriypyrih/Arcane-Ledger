import type { Character } from "../../../../types";
import { getClassEntry, getClassLevel } from "../../multiclass";
import { getCharacterSpellSlotPools, setSlotPoolExpended } from "../../multiclassSpellcasting";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../spellSlots";

export function getWarlockPactSlotState(character: object) {
  const value = character as Character;
  const id = `pact:${getClassEntry(value, "Warlock")?.id}`;
  const pool = value.multiclass
    ? getCharacterSpellSlotPools(value).find((entry) => entry.id === id)
    : undefined;
  const totals =
    pool?.totals ?? getSpellSlotTotalsForCharacter("Warlock", getClassLevel(value, "Warlock"));
  const expended = normalizeSpellSlotsExpended(
    pool && value.slotPoolId !== id ? pool.expended : value.spellSlotsExpended,
    totals
  );
  return { id: pool?.id ?? "standard", totals, expended };
}

export function spendWarlockPactSlot(character: Character, level: number): Character {
  const pool = getWarlockPactSlotState(character);
  const index = level - 1;
  if (index < 0 || (pool.totals[index] ?? 0) <= (pool.expended[index] ?? 0)) return character;
  const expended = [...pool.expended];
  expended[index] = (expended[index] ?? 0) + 1;
  return setSlotPoolExpended(character, pool.id, expended);
}
