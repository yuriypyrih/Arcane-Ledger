import type { DiceSides, NaturalOutcome, RollMode, RollResult, RolledDie } from "../../types";
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

const supportedDiceSides = new Set<number>([4, 6, 8, 10, 12, 20]);

function asSupportedDiceSides(sides: number): DiceSides | null {
  return supportedDiceSides.has(sides) ? (sides as DiceSides) : null;
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
  firstAdjusted: number,
  secondAdjusted: number,
  selectedIndex: 0 | 1,
  diceIndex: number,
  mode: Exclude<RollMode, "normal">,
  naturalOutcome: NaturalOutcome
) {
  const values = [firstAdjusted, secondAdjusted] as const;

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
  firstAdjusted: number;
  secondAdjusted: number;
  selectedIndex: 0 | 1;
  chosenRaw: number;
  chosenAdjusted: number;
} {
  let firstRaw = rollDie(20);
  const secondRaw = rollDie(20);

  if (forcedFirstRaw !== null) {
    firstRaw = forcedFirstRaw;
  }

  const firstAdjusted = Math.max(firstRaw, minimum);
  const secondAdjusted = Math.max(secondRaw, minimum);
  const selectedIndex =
    mode === "advantage"
      ? firstAdjusted >= secondAdjusted
        ? 0
        : 1
      : firstAdjusted <= secondAdjusted
        ? 0
        : 1;
  const chosenRaw = selectedIndex === 0 ? firstRaw : secondRaw;
  const chosenAdjusted = selectedIndex === 0 ? firstAdjusted : secondAdjusted;

  return {
    firstRaw,
    secondRaw,
    firstAdjusted,
    secondAdjusted,
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
      const { firstAdjusted, secondAdjusted, selectedIndex, chosenRaw, chosenAdjusted } =
        getModeD20Roll(
          term.minimum,
          mode,
          devD20Roll !== null && !devD20Consumed ? devD20Roll : null
        );
      const selectedNaturalOutcome = getNaturalOutcome(chosenRaw);

      total += chosenAdjusted * term.sign;
      detailParts.push(
        `${term.sign === -1 ? "-" : ""}${mode} d20 [${firstAdjusted}, ${secondAdjusted}] -> ${chosenAdjusted}`
      );
      modeApplied = mode;
      advantageConsumed = true;
      if (devD20Roll !== null && !devD20Consumed) {
        devD20Consumed = true;
      }
      appendModeD20Dice(
        dice,
        firstAdjusted,
        secondAdjusted,
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

    adjustedRolls.forEach((value, index) => {
      const dieNaturalOutcome =
        !countedD20Resolved && term.sides === 20 ? getNaturalOutcome(rawRolls[index]) : null;

      dice.push({
        id: createDiceId(supportedSides, diceIndex),
        sides: supportedSides,
        value,
        counted: true,
        theme: "default",
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
