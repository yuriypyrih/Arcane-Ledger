import type { DicePoolRollResult, DiceSelection, RolledDie } from "../../types";
import { createDiceId } from "./createDiceId";
import { rollDie } from "./rollDie";
import { selectableDice } from "./constants";

export function rollDicePool(selection: DiceSelection): DicePoolRollResult {
  const dice: RolledDie[] = [];
  let total = 0;

  for (const sides of selectableDice) {
    const count = selection[sides];

    for (let index = 0; index < count; index += 1) {
      const value = rollDie(sides);
      dice.push({
        id: createDiceId(sides, index),
        sides,
        value
      });
      total += value;
    }
  }

  return {
    dice,
    total,
    breakdown: dice.map((die) => `d${die.sides}:${die.value}`).join("  ")
  };
}
