import { normalizeFormula } from "./normalizeFormula";

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

const tokenPattern = /([+-]?[^+-]+)/g;

export function parseFormula(input: string): ParsedFormula {
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
