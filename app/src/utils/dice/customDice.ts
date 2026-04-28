export type CustomDiceTerm = {
  count: number;
  sides: number;
};

const customDiceTermPattern = /^(\d+)d(\d+)$/i;
const maxCustomDiceCount = 100;
const maxCustomDieSides = 1000;

export function parseCustomDiceText(value: string): CustomDiceTerm[] {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return [];
  }

  const terms = normalizedValue.split(",").map((term) => term.trim());
  const parsedTerms: CustomDiceTerm[] = [];
  let totalDice = 0;

  for (const term of terms) {
    const match = term.match(customDiceTermPattern);

    if (!match) {
      throw new Error("Use comma-separated dice like 1d7,2d25.");
    }

    const count = Number(match[1]);
    const sides = Number(match[2]);

    if (
      !Number.isInteger(count) ||
      !Number.isInteger(sides) ||
      count < 1 ||
      sides < 2 ||
      sides > maxCustomDieSides
    ) {
      throw new Error(`Invalid custom die: ${term}.`);
    }

    totalDice += count;

    if (totalDice > maxCustomDiceCount) {
      throw new Error(`Custom dice are limited to ${maxCustomDiceCount} dice at once.`);
    }

    parsedTerms.push({ count, sides });
  }

  return parsedTerms;
}

export function getCustomDiceCount(value: string): number {
  return parseCustomDiceText(value).reduce((sum, term) => sum + term.count, 0);
}

export function formatCustomDiceText(terms: CustomDiceTerm[]): string {
  return terms.map((term) => `${term.count}d${term.sides}`).join(",");
}
