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

function appendModeD20Dice(
  dice: RolledDie[],
  first: number,
  second: number,
  selectedIndex: 0 | 1,
  diceIndex: number,
  mode: Exclude<RollMode, "normal">
) {
  const values = [first, second] as const;

  values.forEach((value, index) => {
    dice.push({
      id: createDiceId(20, diceIndex + index),
      sides: 20,
      value,
      counted: index === selectedIndex,
      theme: mode
    });
  });
}

function getModeD20Roll(
  minimum: number,
  mode: Exclude<RollMode, "normal">
): {
  first: number;
  second: number;
  selectedIndex: 0 | 1;
  chosen: number;
} {
  const first = Math.max(rollDie(20), minimum);
  const second = Math.max(rollDie(20), minimum);
  const selectedIndex = mode === "advantage" ? (first >= second ? 0 : 1) : first <= second ? 0 : 1;

  return {
    first,
    second,
    selectedIndex,
    chosen: selectedIndex === 0 ? first : second
  };
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
    const applyModeToTerm =
      !advantageConsumed && mode !== "normal" && term.sides === 20 && term.count > 0;
    const normalRollCount = applyModeToTerm ? term.count - 1 : term.count;
    const normalRolls = Array.from({ length: normalRollCount }, () => rollDie(term.sides));
    const adjustedRolls = normalRolls.map((value) => Math.max(value, term.minimum));

    if (applyModeToTerm) {
      const { first, second, selectedIndex, chosen } = getModeD20Roll(term.minimum, mode);

      total += chosen * term.sign;
      detailParts.push(
        `${term.sign === -1 ? "-" : ""}${mode} d20 [${first}, ${second}] -> ${chosen}`
      );
      modeApplied = mode;
      advantageConsumed = true;
      appendModeD20Dice(dice, first, second, selectedIndex, diceIndex, mode);
      diceIndex += 2;
    }

    const subtotal = adjustedRolls.reduce((sum, value) => sum + value, 0) * term.sign;
    total += subtotal;
    if (adjustedRolls.length > 0) {
      detailParts.push(
        `${term.sign === -1 ? "-" : ""}${adjustedRolls.length}d${term.sides}${
          term.minimum > 1 ? `m${term.minimum}` : ""
        } [${adjustedRolls.join(", ")}]`
      );
    }

    const supportedSides = asSupportedDiceSides(term.sides);

    if (!supportedSides) {
      continue;
    }

    adjustedRolls.forEach((value) => {
      dice.push({
        id: createDiceId(supportedSides, diceIndex),
        sides: supportedSides,
        value,
        counted: true,
        theme: "default"
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
