import { formatFormulaRangeLabel, parseFormulaRange } from "./shared/formulas";

export { parseFormulaRange as parseRollFormulaRange } from "./shared/formulas";

export function formatFeatureActionOptionValueLabel(option: {
  summary: string;
  resultLabel?: string;
  rollFormula?: string;
  rollFormulaDisplay?: string;
}): string {
  if (!option.rollFormula || !option.resultLabel) {
    return option.summary;
  }

  const parsedRange = parseFormulaRange(option.rollFormula);
  const formulaLabel = option.rollFormulaDisplay ?? option.summary;

  if (!parsedRange) {
    return `${option.resultLabel} (${formulaLabel})`;
  }

  return `${formatFormulaRangeLabel(parsedRange)} ${option.resultLabel} (${formulaLabel})`;
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

  const parsedRange = parseFormulaRange(option.rollFormula);

  if (!parsedRange) {
    return option.summary;
  }

  return `${formatFormulaRangeLabel(parsedRange)} ${label}`;
}
