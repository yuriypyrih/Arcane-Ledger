import type { D20RollResult, RollMode } from "../../types";
import { rollDie } from "./rollDie";

export function rollD20(mode: RollMode): D20RollResult {
  if (mode === "normal") {
    const result = rollDie(20);

    return {
      total: result,
      breakdown: `d20 [${result}]`,
      modeApplied: "normal",
      rawRolls: [result]
    };
  }

  const first = rollDie(20);
  const second = rollDie(20);
  const total = mode === "advantage" ? Math.max(first, second) : Math.min(first, second);

  return {
    total,
    breakdown: `${mode} d20 [${first}, ${second}] -> ${total}`,
    modeApplied: mode,
    rawRolls: [first, second]
  };
}
