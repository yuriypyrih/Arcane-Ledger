export function parseRollFormulaRange(
  formula: string
): { minimum: number; maximum: number } | null {
  const normalizedFormula = formula.replace(/\s+/g, "");

  if (!normalizedFormula) {
    return null;
  }

  const terms = normalizedFormula.match(/[+-]?[^+-]+/g);

  if (!terms || terms.length === 0) {
    return null;
  }

  let minimum = 0;
  let maximum = 0;

  for (const term of terms) {
    const sign = term.startsWith("-") ? -1 : 1;
    const rawTerm = term.replace(/^[+-]/, "");
    const diceMatch = rawTerm.match(/^(\d+)d(\d+)(?:m(\d+))?$/i);

    if (diceMatch) {
      const count = Number(diceMatch[1]);
      const sides = Number(diceMatch[2]);
      const minimumPerDie = diceMatch[3] ? Number(diceMatch[3]) : 1;

      if (
        !Number.isFinite(count) ||
        !Number.isFinite(sides) ||
        !Number.isFinite(minimumPerDie) ||
        count <= 0 ||
        sides <= 0 ||
        minimumPerDie <= 0
      ) {
        return null;
      }

      if (sign > 0) {
        minimum += count * Math.min(minimumPerDie, sides);
        maximum += count * sides;
      } else {
        minimum -= count * sides;
        maximum -= count * Math.min(minimumPerDie, sides);
      }

      continue;
    }

    const value = Number(rawTerm);

    if (!Number.isFinite(value)) {
      return null;
    }

    minimum += sign * value;
    maximum += sign * value;
  }

  return { minimum, maximum };
}

export function formatFeatureActionOptionValueLabel(option: {
  summary: string;
  resultLabel?: string;
  rollFormula?: string;
  rollFormulaDisplay?: string;
}): string {
  if (!option.rollFormula || !option.resultLabel) {
    return option.summary;
  }

  const parsedRange = parseRollFormulaRange(option.rollFormula);
  const formulaLabel = option.rollFormulaDisplay ?? option.summary;

  if (!parsedRange) {
    return `${option.resultLabel} (${formulaLabel})`;
  }

  if (parsedRange.minimum === parsedRange.maximum) {
    return `${parsedRange.minimum} ${option.resultLabel} (${formulaLabel})`;
  }

  return `${parsedRange.minimum}~${parsedRange.maximum} ${option.resultLabel} (${formulaLabel})`;
}

export function formatFeatureActionOptionRangeLabel(option: {
  summary: string;
  resultLabel?: string;
  rangeResultLabel?: string;
  rollFormula?: string;
}): string {
  const label = option.rangeResultLabel ?? option.resultLabel;

  if (!option.rollFormula || !label) {
    return option.summary;
  }

  const parsedRange = parseRollFormulaRange(option.rollFormula);

  if (!parsedRange) {
    return option.summary;
  }

  if (parsedRange.minimum === parsedRange.maximum) {
    return `${parsedRange.minimum} ${label}`;
  }

  return `${parsedRange.minimum}~${parsedRange.maximum} ${label}`;
}
