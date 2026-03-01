export type RollMode = "normal" | "advantage" | "disadvantage";

type DiceTerm = {
  count: number;
  sides: number;
  sign: 1 | -1;
};

type ConstantTerm = {
  value: number;
  sign: 1 | -1;
};

type ParsedFormula = {
  diceTerms: DiceTerm[];
  constantTerms: ConstantTerm[];
};

export type RollResult = {
  formula: string;
  total: number;
  breakdown: string;
  modeApplied: RollMode;
};

export type D20RollResult = {
  total: number;
  breakdown: string;
  modeApplied: RollMode;
  rawRolls: number[];
};

export type DiceSides = 4 | 6 | 8 | 10 | 12 | 20;

export type DiceSelection = Record<DiceSides, number>;

export type RolledDie = {
  id: string;
  sides: DiceSides;
  value: number;
};

export type DicePoolRollResult = {
  dice: RolledDie[];
  total: number;
  breakdown: string;
};

export const selectableDice: DiceSides[] = [4, 6, 8, 10, 12, 20];

const tokenPattern = /([+-]?[^+-]+)/g;

function normalizeFormula(input: string): string {
  return input.replace(/\s+/g, "").toLowerCase();
}

function parseFormula(input: string): ParsedFormula {
  const normalized = normalizeFormula(input);

  if (!normalized) {
    throw new Error("Enter a dice formula like 2d6+3.");
  }

  const tokens = normalized.match(tokenPattern);

  if (!tokens) {
    throw new Error("Formula is empty.");
  }

  const parsed: ParsedFormula = {
    diceTerms: [],
    constantTerms: []
  };

  for (const token of tokens) {
    const sign: 1 | -1 = token.startsWith("-") ? -1 : 1;
    const value = token.replace(/^[+-]/, "");

    if (!value) {
      throw new Error(`Invalid formula segment: "${token}"`);
    }

    const diceMatch = value.match(/^(\d*)d(\d+)$/);

    if (diceMatch) {
      const count = Number(diceMatch[1] || "1");
      const sides = Number(diceMatch[2]);

      if (count < 1 || sides < 2) {
        throw new Error(`Invalid dice term: "${token}"`);
      }

      parsed.diceTerms.push({ count, sides, sign });
      continue;
    }

    const constant = Number(value);

    if (Number.isNaN(constant)) {
      throw new Error(`Invalid term: "${token}"`);
    }

    parsed.constantTerms.push({ value: constant, sign });
  }

  return parsed;
}

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function createEmptySelection(): DiceSelection {
  return {
    4: 0,
    6: 0,
    8: 0,
    10: 0,
    12: 0,
    20: 0
  };
}

export function rollDicePool(selection: DiceSelection): DicePoolRollResult {
  const dice: RolledDie[] = [];
  let total = 0;

  for (const sides of selectableDice) {
    const count = selection[sides];

    for (let index = 0; index < count; index += 1) {
      const value = rollDie(sides);
      dice.push({
        id: `${sides}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
