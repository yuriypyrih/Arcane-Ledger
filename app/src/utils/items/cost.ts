import { CURRENCY_TYPE, type EquipmentCost } from "../../codex/entries";

export function normalizeItemDecimalString(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return value.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

export function parseItemCost(value: string | null | undefined): EquipmentCost | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  const match = normalizedValue.match(/^(?<whole>\d+)(?:\.(?<fraction>\d+))?$/);

  if (!match?.groups) {
    return null;
  }

  const numericValue = Number(normalizedValue);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  if (numericValue === 0) {
    return {
      amount: 0,
      currency: CURRENCY_TYPE.GP
    };
  }

  const significantFraction = (match.groups.fraction ?? "").replace(/0+$/, "");

  if (significantFraction.length >= 2) {
    return {
      amount: Math.round(numericValue * 100),
      currency: CURRENCY_TYPE.CP
    };
  }

  if (significantFraction.length === 1) {
    return {
      amount: Math.round(numericValue * 10),
      currency: CURRENCY_TYPE.SP
    };
  }

  const goldAmount = Math.round(numericValue);

  if (goldAmount >= 1000 && goldAmount % 10 === 0) {
    return {
      amount: goldAmount / 10,
      currency: CURRENCY_TYPE.PP
    };
  }

  return {
    amount: goldAmount,
    currency: CURRENCY_TYPE.GP
  };
}

export function hasDisplayableItemCost(value: string | null | undefined) {
  return parseItemCost(value) !== null;
}
