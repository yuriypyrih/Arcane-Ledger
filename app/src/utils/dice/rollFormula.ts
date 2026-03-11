import type { RollMode, RollResult } from "../../types";
import { rollFormulaWithDice } from "./rollFormulaWithDice";

export function rollFormula(input: string, mode: RollMode): RollResult {
  const rolledResult = rollFormulaWithDice(input, mode);
  return {
    formula: rolledResult.formula,
    total: rolledResult.total,
    breakdown: rolledResult.breakdown,
    modeApplied: rolledResult.modeApplied
  };
}
