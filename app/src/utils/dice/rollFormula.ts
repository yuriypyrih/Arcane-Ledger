import type { RollMode, RollResult } from "../../types";
import { normalizeFormula } from "./normalizeFormula";
import { parseFormula } from "./parseFormula";
import { rollDie } from "./rollDie";

export function rollFormula(input: string, mode: RollMode): RollResult {
  const parsed = parseFormula(input);
  const detailParts: string[] = [];
  let total = 0;
  let modeApplied: RollMode = "normal";
  let advantageConsumed = false;

  for (const term of parsed.diceTerms) {
    const isSingleD20 = term.count === 1 && term.sides === 20;

    if (!advantageConsumed && mode !== "normal" && isSingleD20) {
      const first = rollDie(20);
      const second = rollDie(20);
      const chosen = mode === "advantage" ? Math.max(first, second) : Math.min(first, second);
      total += chosen * term.sign;
      detailParts.push(
        `${term.sign === -1 ? "-" : ""}${mode} d20 [${first}, ${second}] -> ${chosen}`
      );
      modeApplied = mode;
      advantageConsumed = true;
      continue;
    }

    const rolls = Array.from({ length: term.count }, () => rollDie(term.sides));
    const subtotal = rolls.reduce((sum, value) => sum + value, 0) * term.sign;
    total += subtotal;
    detailParts.push(
      `${term.sign === -1 ? "-" : ""}${term.count}d${term.sides} [${rolls.join(", ")}]`
    );
  }

  for (const term of parsed.constantTerms) {
    total += term.value * term.sign;
    detailParts.push(`${term.sign === -1 ? "-" : "+"}${term.value}`);
  }

  return {
    formula: normalizeFormula(input),
    total,
    breakdown: detailParts.join(" "),
    modeApplied
  };
}
