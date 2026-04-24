const TEMPORARY_NUMBER_INPUT_VALUES = new Set(["", "-", ".", "-.", "0.", "-0."]);

type NumberInputBoundary = number | string | undefined;

function parseBoundaryValue(value: NumberInputBoundary): number | null {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  if (typeof value === "string" && value.trim().length === 0) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function isTemporaryNumberInputValue(rawValue: string): boolean {
  return TEMPORARY_NUMBER_INPUT_VALUES.has(rawValue);
}

function isZeroValue(rawValue: string): boolean {
  return /^-?0(?:\.0+)?$/.test(rawValue);
}

export function normalizeNumberInputDuringEdit(rawValue: string): string {
  if (isTemporaryNumberInputValue(rawValue)) {
    return rawValue;
  }

  const sign = rawValue.startsWith("-") ? "-" : "";
  const unsignedValue = sign ? rawValue.slice(1) : rawValue;

  if (!/^\d*\.?\d*$/.test(unsignedValue)) {
    return rawValue;
  }

  const hasDecimal = unsignedValue.includes(".");
  const [rawIntegerPart, fractionalPart = ""] = unsignedValue.split(".");
  const normalizedIntegerPart = rawIntegerPart.replace(/^0+(?=\d)/, "");
  const integerPart = normalizedIntegerPart.length > 0 ? normalizedIntegerPart : "0";

  if (hasDecimal) {
    return `${sign}${integerPart}.${fractionalPart}`;
  }

  return `${sign}${integerPart}`;
}

export function normalizeNumberInputOnBlur(rawValue: string): string {
  const normalizedValue = normalizeNumberInputDuringEdit(rawValue);

  if (
    normalizedValue === "" ||
    normalizedValue === "-" ||
    normalizedValue === "." ||
    normalizedValue === "-."
  ) {
    return "";
  }

  if (normalizedValue.endsWith(".")) {
    const withoutTrailingDecimal = normalizedValue.slice(0, -1);
    return isZeroValue(withoutTrailingDecimal) ? "0" : withoutTrailingDecimal;
  }

  return isZeroValue(normalizedValue) ? "0" : normalizedValue;
}

export function isNumberInputOutOfRange(
  rawValue: string,
  min?: NumberInputBoundary,
  max?: NumberInputBoundary
): boolean {
  const normalizedValue = normalizeNumberInputDuringEdit(rawValue);

  if (
    normalizedValue.length === 0 ||
    normalizedValue === "-" ||
    normalizedValue === "." ||
    normalizedValue === "-." ||
    normalizedValue.endsWith(".")
  ) {
    return false;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue)) {
    return false;
  }

  const minValue = parseBoundaryValue(min);

  if (minValue !== null && parsedValue < minValue) {
    return true;
  }

  const maxValue = parseBoundaryValue(max);

  if (maxValue !== null && parsedValue > maxValue) {
    return true;
  }

  return false;
}

export function getDefaultNumberInputMode(step?: NumberInputBoundary) {
  if (step === "any") {
    return "decimal";
  }

  const parsedStep = parseBoundaryValue(step);

  if (parsedStep === null) {
    return "numeric";
  }

  return Number.isInteger(parsedStep) ? "numeric" : "decimal";
}
