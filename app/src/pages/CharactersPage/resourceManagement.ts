import type { Character, CharacterClassFeatureState } from "../../types";
import { replaceClassFeatureState, type NumericKey } from "./classFeatures/shared/resourceState";

export type ResourceAdjustment = "use" | "restore" | "reset";

/** Runtime-only bindings. The saved character remains the sole resource authority. */
export type CounterResourceTarget = {
  kind: "counter";
  id: string;
  label: string;
  total: (character: Character) => number;
  remaining: (character: Character) => number;
  spendOne: (character: Character) => Character;
  restoreOne: (character: Character) => Character;
  restoreAll: (character: Character) => Character;
  die?: (character: Character) => string | null | undefined;
};

export type ResourceManagementTarget =
  | CounterResourceTarget
  | {
      kind: "spell-slots";
      id: string;
      label: string;
      minimumLevel: number;
      maximumLevel?: number;
      pool: "selected" | "pact";
    }
  | { kind: "hit-dice"; id: "hit-dice"; label: "Hit Dice" };

export const hitDiceResource: ResourceManagementTarget = {
  kind: "hit-dice",
  id: "hit-dice",
  label: "Hit Dice"
};

export function spellSlotResource(
  minimumLevel = 1,
  maximumLevel?: number,
  pool: "selected" | "pact" = "selected"
): ResourceManagementTarget {
  return {
    kind: "spell-slots",
    id: `spell-slots:${pool}:${minimumLevel}:${maximumLevel ?? 9}`,
    label: pool === "pact" ? "Pact Magic Spell Slots" : "Spell Slots",
    minimumLevel,
    maximumLevel,
    pool
  };
}

export function adjustExpended(current: number, total: number, adjustment: ResourceAdjustment) {
  const limit = Math.max(0, Math.floor(total));
  const expended = Math.min(limit, Math.max(0, Math.floor(current) || 0));
  return adjustment === "reset"
    ? 0
    : Math.min(limit, Math.max(0, expended + (adjustment === "use" ? 1 : -1)));
}

export function counterResource(
  id: string,
  label: string,
  total: CounterResourceTarget["total"],
  remaining: CounterResourceTarget["remaining"],
  writeExpended: (character: Character, expended: number) => Character
): CounterResourceTarget {
  function update(character: Character, adjustment: ResourceAdjustment) {
    const capacity = total(character);
    const expended = capacity - remaining(character);
    const next = adjustExpended(expended, capacity, adjustment);
    return capacity <= 0 || next === expended ? character : writeExpended(character, next);
  }
  return {
    kind: "counter",
    id,
    label,
    total,
    remaining,
    spendOne: (character) => update(character, "use"),
    restoreOne: (character) => update(character, "restore"),
    restoreAll: (character) => update(character, "reset")
  };
}

/** Only updates the named counter; activation, fallback payments, and rest effects are excluded. */
export function classCounterResource<K extends keyof CharacterClassFeatureState>(
  stateKey: K,
  counter: NumericKey<NonNullable<CharacterClassFeatureState[K]>>,
  label: string,
  total: CounterResourceTarget["total"],
  remaining: CounterResourceTarget["remaining"]
): CounterResourceTarget {
  return counterResource(
    `${stateKey}:${String(counter)}`,
    label,
    total,
    remaining,
    (character, expended) =>
      replaceClassFeatureState(character, stateKey, {
        ...character.classFeatureState?.[stateKey],
        [counter]: expended
      } as NonNullable<CharacterClassFeatureState[K]>)
  );
}
