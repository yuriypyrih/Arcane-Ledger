import type { DiceSides, RollMode, RollResult, RolledDie } from "../../types";
import { createDiceId } from "./createDiceId";
import { normalizeFormula } from "./normalizeFormula";
import { parseFormula } from "./parseFormula";
import { rollDie } from "./rollDie";

export type RollFormulaWithDiceResult = RollResult & {
  dice: RolledDie[];
};

const supportedDiceSides = new Set<number>([4, 6, 8, 10, 12, 20]);

function asSupportedDiceSides(sides: number): DiceSides | null {
  return supportedDiceSides.has(sides) ? (sides as DiceSides) : null;
}

export function rollFormulaWithDice(input: string, mode: RollMode): RollFormulaWithDiceResult {
  const parsed = parseFormula(input);
  const detailParts: string[] = [];
  const dice: RolledDie[] = [];
  let total = 0;
  let modeApplied: RollMode = "normal";
  let advantageConsumed = false;
  let diceIndex = 0;

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

      dice.push({
        id: createDiceId(20, diceIndex),
        sides: 20,
        value: chosen
      });
      diceIndex += 1;
      continue;
    }

    const rolls = Array.from({ length: term.count }, () => rollDie(term.sides));
    const adjustedRolls = rolls.map((value) => Math.max(value, term.minimum));
    const subtotal = adjustedRolls.reduce((sum, value) => sum + value, 0) * term.sign;
    total += subtotal;
    detailParts.push(
      `${term.sign === -1 ? "-" : ""}${term.count}d${term.sides}${
        term.minimum > 1 ? `m${term.minimum}` : ""
      } [${
        adjustedRolls.join(", ")
      }]`
    );

    const supportedSides = asSupportedDiceSides(term.sides);

    if (!supportedSides) {
      continue;
    }

    adjustedRolls.forEach((value) => {
      dice.push({
        id: createDiceId(supportedSides, diceIndex),
        sides: supportedSides,
        value: value
      });
      diceIndex += 1;
    });
  }

  for (const term of parsed.constantTerms) {
    total += term.value * term.sign;
    detailParts.push(`${term.sign === -1 ? "-" : "+"}${term.value}`);
  }

  return {
    formula: normalizeFormula(input),
    total,
    breakdown: detailParts.join(" "),
    modeApplied,
    dice
  };
}
