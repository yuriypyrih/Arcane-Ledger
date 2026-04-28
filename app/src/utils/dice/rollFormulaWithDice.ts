import type { DieTheme, NaturalOutcome, RollMode, RollResult, RolledDie } from "../../types";
import { createDiceId } from "./createDiceId";
import { getNaturalOutcome } from "./naturalOutcome";
import { normalizeFormula } from "./normalizeFormula";
import { parseFormula } from "./parseFormula";
import { rollDie } from "./rollDie";

// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
const DEV_D20_ROLL: Number | null = null;

export type RollFormulaWithDiceResult = RollResult & {
  dice: RolledDie[];
};

const supportedDiceSides = new Set<number>([4, 6, 8, 10, 12, 20, 100]);

function getDieTheme(sides: number): DieTheme {
  if (!supportedDiceSides.has(sides)) {
    return "custom";
  }

  return sides === 100 ? "wildMagic" : "default";
}

function getDevD20Roll(): number | null {
  if (DEV_D20_ROLL === null) {
    return null;
  }

  const normalizedValue = Number(DEV_D20_ROLL);

  return Number.isInteger(normalizedValue) && normalizedValue >= 1 && normalizedValue <= 20
    ? normalizedValue
    : null;
}

function appendModeD20Dice(
  dice: RolledDie[],
  firstValue: number,
  secondValue: number,
  selectedIndex: 0 | 1,
  diceIndex: number,
  mode: Exclude<RollMode, "normal">,
  naturalOutcome: NaturalOutcome
) {
  const values = [firstValue, secondValue] as const;

  values.forEach((value, index) => {
    dice.push({
      id: createDiceId(20, diceIndex + index),
      sides: 20,
      value,
      counted: index === selectedIndex,
      theme: mode,
      naturalOutcome: index === selectedIndex && naturalOutcome ? naturalOutcome : undefined
    });
  });
}

function getModeD20Roll(
  minimum: number,
  mode: Exclude<RollMode, "normal">,
  forcedFirstRaw: number | null = null
): {
  firstRaw: number;
  secondRaw: number;
  selectedIndex: 0 | 1;
  chosenRaw: number;
  chosenAdjusted: number;
} {
  let firstRaw = rollDie(20);
  const secondRaw = rollDie(20);

  if (forcedFirstRaw !== null) {
    firstRaw = forcedFirstRaw;
  }

  const selectedIndex =
    mode === "advantage" ? (firstRaw >= secondRaw ? 0 : 1) : firstRaw <= secondRaw ? 0 : 1;
  const chosenRaw = selectedIndex === 0 ? firstRaw : secondRaw;
  const chosenAdjusted = Math.max(chosenRaw, minimum);

  return {
    firstRaw,
    secondRaw,
    selectedIndex,
    chosenRaw,
    chosenAdjusted
  };
}

export function rollFormulaWithDice(input: string, mode: RollMode): RollFormulaWithDiceResult {
  const parsed = parseFormula(input);
  const detailParts: string[] = [];
  const dice: RolledDie[] = [];
  let total = 0;
  let modeApplied: RollMode = "normal";
  let naturalOutcome: NaturalOutcome = null;
  let advantageConsumed = false;
  let countedD20Resolved = false;
  let devD20Consumed = false;
  let diceIndex = 0;
  const devD20Roll = getDevD20Roll();

  for (const term of parsed.diceTerms) {
    const applyModeToTerm =
      !advantageConsumed && mode !== "normal" && term.sides === 20 && term.count > 0;
    const normalRollCount = applyModeToTerm ? term.count - 1 : term.count;
    const rawRolls = Array.from({ length: normalRollCount }, () => rollDie(term.sides));

    if (applyModeToTerm) {
      const { firstRaw, secondRaw, selectedIndex, chosenRaw, chosenAdjusted } = getModeD20Roll(
        term.minimum,
        mode,
        devD20Roll !== null && !devD20Consumed ? devD20Roll : null
      );
      const selectedNaturalOutcome =
        chosenRaw === chosenAdjusted ? getNaturalOutcome(chosenRaw) : null;
      const firstDisplayValue = selectedIndex === 0 ? chosenAdjusted : firstRaw;
      const secondDisplayValue = selectedIndex === 1 ? chosenAdjusted : secondRaw;
      const modeDetail =
        term.minimum > 1
          ? `${mode} d20 raw [${firstRaw}, ${secondRaw}] -> ${chosenRaw}; minimum ${term.minimum} -> ${chosenAdjusted}`
          : `${mode} d20 [${firstRaw}, ${secondRaw}] -> ${chosenAdjusted}`;
      const multiplierDetail = term.multiplier > 1 ? ` * ${term.multiplier}` : "";

      total += chosenAdjusted * term.multiplier * term.sign;
      detailParts.push(`${term.sign === -1 ? "-" : ""}${modeDetail}${multiplierDetail}`);
      modeApplied = mode;
      advantageConsumed = true;
      if (devD20Roll !== null && !devD20Consumed) {
        devD20Consumed = true;
      }
      appendModeD20Dice(
        dice,
        firstDisplayValue,
        secondDisplayValue,
        selectedIndex,
        diceIndex,
        mode,
        selectedNaturalOutcome
      );
      if (!countedD20Resolved) {
        naturalOutcome = selectedNaturalOutcome;
        countedD20Resolved = true;
      }
      diceIndex += 2;
    }

    if (devD20Roll !== null && !devD20Consumed && term.sides === 20 && rawRolls.length > 0) {
      rawRolls[0] = devD20Roll;
      devD20Consumed = true;
    }

    const adjustedRolls = rawRolls.map((value) => Math.max(value, term.minimum));
    const rollDetails = rawRolls.map((value, index) =>
      value === adjustedRolls[index] ? `${value}` : `${value}->${adjustedRolls[index]}`
    );

    const subtotal =
      adjustedRolls.reduce((sum, value) => sum + value, 0) * term.multiplier * term.sign;
    total += subtotal;
    if (adjustedRolls.length > 0) {
      detailParts.push(
        `${term.sign === -1 ? "-" : ""}${adjustedRolls.length}d${term.sides}${
          term.minimum > 1 ? `m${term.minimum}` : ""
        }${term.multiplier > 1 ? `*${term.multiplier}` : ""} [${rollDetails.join(", ")}]`
      );
    }

    adjustedRolls.forEach((value, index) => {
      const dieNaturalOutcome =
        !countedD20Resolved && term.sides === 20 && rawRolls[index] === value
          ? getNaturalOutcome(rawRolls[index])
          : null;

      dice.push({
        id: createDiceId(term.sides, diceIndex),
        sides: term.sides,
        value,
        counted: true,
        theme: getDieTheme(term.sides),
        naturalOutcome: dieNaturalOutcome ?? undefined
      });

      if (dieNaturalOutcome) {
        naturalOutcome = dieNaturalOutcome;
      }

      if (!countedD20Resolved && term.sides === 20) {
        countedD20Resolved = true;
      }

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
    naturalOutcome,
    dice
  };
}
