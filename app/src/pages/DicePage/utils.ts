import type { DicePoolRollResult, RolledDie } from "../../types";
import type { ResultPopup, RollRecord } from "./types";

export function createRollRecord(result: DicePoolRollResult): RollRecord {
  return {
    id: Date.now(),
    total: result.total,
    breakdown: result.breakdown,
    dice: result.dice
  };
}

export function createResultPopup(dice: RolledDie[], rollToken: number): ResultPopup {
  return {
    rollToken,
    total: dice.reduce((sum, die) => sum + (die.counted === false ? 0 : die.value), 0),
    breakdown: dice
      .map((die) => `d${die.sides}:${die.value}${die.counted === false ? " (ignored)" : ""}`)
      .join("  ")
  };
}
