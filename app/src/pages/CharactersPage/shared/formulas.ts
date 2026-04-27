export type FormulaRange = {
  minimum: number;
  maximum: number;
  hasDice: boolean;
};

export type ParseFormulaRangeOptions = {
  substitutions?: Record<string, number>;
};

type FormulaTerm = string | null | undefined | false;

export type FormulaDieDisplayConstraint =
  | {
      kind: "minimum";
      value: number;
    }
  | {
      kind: "maximum";
      value: number;
    }
  | {
      kind: "override";
      from: number;
      to: number;
      value: number;
    };

const formulaTokenPattern = /[+-]?[^+-]+/g;

function normalizeFormulaTerm(term: string): string {
  return term.trim();
}

function getSubstitutionValue(
  value: string,
  substitutions: ParseFormulaRangeOptions["substitutions"]
): number | null {
  if (!substitutions) {
    return null;
  }

  const normalizedValue = value.toUpperCase();
  const matchingKey = Object.keys(substitutions).find(
    (key) => key.toUpperCase() === normalizedValue
  );

  if (!matchingKey) {
    return null;
  }

  const substitution = substitutions[matchingKey];

  return Number.isFinite(substitution) ? substitution : null;
}

export function parseFormulaRange(
  formula: string,
  options: ParseFormulaRangeOptions = {}
): FormulaRange | null {
  const normalizedFormula = formula.replace(/\s+/g, "");

  if (!normalizedFormula) {
    return null;
  }

  const terms = normalizedFormula.match(formulaTokenPattern);

  if (!terms || terms.length === 0) {
    return null;
  }

  let minimum = 0;
  let maximum = 0;
  let hasDice = false;

  for (const term of terms) {
    const sign = term.startsWith("-") ? -1 : 1;
    const rawTerm = term.replace(/^[+-]/, "");
    const diceMatch = rawTerm.match(/^(\d*)d(\d+)(?:m(\d+))?(?:\*(\d+))?$/i);

    if (diceMatch) {
      const count = Number(diceMatch[1] || "1");
      const sides = Number(diceMatch[2]);
      const minimumPerDie = diceMatch[3] ? Number(diceMatch[3]) : 1;
      const multiplier = diceMatch[4] ? Number(diceMatch[4]) : 1;

      if (
        !Number.isFinite(count) ||
        !Number.isFinite(sides) ||
        !Number.isFinite(minimumPerDie) ||
        !Number.isFinite(multiplier) ||
        count <= 0 ||
        sides <= 0 ||
        minimumPerDie <= 0 ||
        multiplier <= 0
      ) {
        return null;
      }

      hasDice = true;

      if (sign > 0) {
        minimum += count * Math.min(minimumPerDie, sides) * multiplier;
        maximum += count * sides * multiplier;
      } else {
        minimum -= count * sides * multiplier;
        maximum -= count * Math.min(minimumPerDie, sides) * multiplier;
      }

      continue;
    }

    const substitutionValue = getSubstitutionValue(rawTerm, options.substitutions);
    const value = substitutionValue ?? Number(rawTerm);

    if (!Number.isFinite(value)) {
      return null;
    }

    minimum += sign * value;
    maximum += sign * value;
  }

  return { minimum, maximum, hasDice };
}

export function formatSignedFormulaTerm(value: number, label?: string): string {
  const normalizedLabel = label?.trim();
  const valueLabel = `${value >= 0 ? "+" : "-"} ${Math.abs(value)}`;

  return normalizedLabel ? `${valueLabel} ${normalizedLabel}` : valueLabel;
}

export function formatFormulaTerms(terms: FormulaTerm[]): string {
  const normalizedTerms = terms
    .map((term) => (typeof term === "string" ? normalizeFormulaTerm(term) : ""))
    .filter(Boolean);

  if (normalizedTerms.length === 0) {
    return "0";
  }

  const [firstTerm, ...remainingTerms] = normalizedTerms;
  const firstExpression = firstTerm.startsWith("+")
    ? firstTerm.slice(1).trim()
    : firstTerm.startsWith("-")
      ? `- ${firstTerm.slice(1).trim()}`
      : firstTerm;

  return remainingTerms.reduce((expression, term) => {
    if (term.startsWith("-")) {
      return `${expression} - ${term.slice(1).trim()}`;
    }

    return `${expression} + ${term.replace(/^\+/, "").trim()}`;
  }, firstExpression);
}

export function formatFormulaDieDisplayTerm(
  term: string,
  constraints: FormulaDieDisplayConstraint[] = []
): string {
  const constraintLabels = constraints.flatMap((constraint) => {
    if (constraint.kind === "minimum") {
      return Number.isFinite(constraint.value) ? [`(MIN:${constraint.value})`] : [];
    }

    if (constraint.kind === "maximum") {
      return Number.isFinite(constraint.value) ? [`(MAX:${constraint.value})`] : [];
    }

    return Number.isFinite(constraint.from) &&
      Number.isFinite(constraint.to) &&
      Number.isFinite(constraint.value)
      ? [`(OVERRIDE:${constraint.from}-${constraint.to}->${constraint.value})`]
      : [];
  });

  return [term.trim(), ...constraintLabels].filter(Boolean).join(" ");
}

export function formatFormulaExpression(formula: string): string {
  const terms = formula.replace(/\s+/g, "").match(formulaTokenPattern);

  return terms ? formatFormulaTerms(terms) : formula;
}

export function formatFormulaRangeLabel(range: Pick<FormulaRange, "minimum" | "maximum">): string {
  return range.minimum === range.maximum ? `${range.minimum}` : `${range.minimum}~${range.maximum}`;
}

export function formatFormulaBreakdown(terms: FormulaTerm[]): string | undefined {
  const normalizedTerms = terms
    .map((term) => (typeof term === "string" ? normalizeFormulaTerm(term) : ""))
    .filter(Boolean);

  if (normalizedTerms.length === 0) {
    return undefined;
  }

  const [firstTerm, ...remainingTerms] = normalizedTerms;
  const expression = remainingTerms.reduce((text, term) => {
    if (term.startsWith("-")) {
      return `${text} - ${term.slice(1).trim()}`;
    }

    return `${text} + ${term.replace(/^\+/, "").trim()}`;
  }, firstTerm);

  return `[= ${expression}]`;
}

export function formatD20Formula(modifier: number): string {
  if (modifier === 0) {
    return "1d20";
  }

  return `1d20 ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
}

export function formatFormulaCell({
  formula,
  displayTerms,
  resultLabel,
  breakdownTerms,
  minimumValue,
  minimumLabel
}: {
  formula: string;
  displayTerms?: FormulaTerm[];
  resultLabel?: string;
  breakdownTerms?: FormulaTerm[];
  hideRangeWhenNoDice?: boolean;
  minimumValue?: number;
  minimumLabel?: string;
}): { value: string; breakdown?: string } {
  const range = parseFormulaRange(formula);
  const displayFormula = displayTerms
    ? formatFormulaTerms(displayTerms)
    : formatFormulaExpression(formula);
  const breakdown = breakdownTerms ? formatFormulaBreakdown(breakdownTerms) : undefined;

  if (!range || !resultLabel) {
    return {
      value: resultLabel ? `${resultLabel} = ${displayFormula}` : displayFormula,
      breakdown
    };
  }

  const minimum =
    typeof minimumValue === "number" && Number.isFinite(minimumValue)
      ? Math.max(minimumValue, range.minimum)
      : range.minimum;
  const maximum =
    typeof minimumValue === "number" && Number.isFinite(minimumValue)
      ? Math.max(minimumValue, range.maximum)
      : range.maximum;
  const resultRangeLabel =
    minimum === maximum ? `${minimum} ${resultLabel}` : `${minimum}~${maximum} ${resultLabel}`;
  const minimumSuffix =
    typeof minimumValue === "number" &&
    Number.isFinite(minimumValue) &&
    range.minimum < minimumValue
      ? ` ${minimumLabel ?? `(MIN:${minimumValue})`}`
      : "";

  return {
    value: `${resultRangeLabel} = ${displayFormula}${minimumSuffix}`,
    breakdown
  };
}
