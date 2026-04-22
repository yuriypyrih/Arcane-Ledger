import type { NaturalOutcome, RollResult } from "../../types";

export function getNaturalOutcome(value: number | null | undefined): NaturalOutcome {
  if (value === 20) {
    return "natural20";
  }

  if (value === 1) {
    return "natural1";
  }

  return null;
}

export function getNaturalOutcomeLabel(outcome: NaturalOutcome): string | null {
  if (outcome === "natural20") {
    return "Natural 20";
  }

  if (outcome === "natural1") {
    return "Natural 1";
  }

  return null;
}

export function formatRollResultTotal(
  result: Pick<RollResult, "total" | "naturalOutcome">
): string {
  const label = getNaturalOutcomeLabel(result.naturalOutcome);

  if (!label) {
    return String(result.total);
  }

  return `${result.total} (${label})`;
}
