export type PsionicDie = "d6" | "d8" | "d10" | "d12";

function normalizePsionicDiceLevel(level: number | null | undefined): number {
  return Number.isFinite(Number(level)) ? Math.max(1, Math.floor(Number(level))) : 1;
}

export function getPsionicDiceTotalForLevel(level: number | null | undefined): number {
  const normalizedLevel = normalizePsionicDiceLevel(level);

  if (normalizedLevel >= 17) {
    return 12;
  }

  if (normalizedLevel >= 13) {
    return 10;
  }

  if (normalizedLevel >= 9) {
    return 8;
  }

  if (normalizedLevel >= 5) {
    return 6;
  }

  return 4;
}

export function getPsionicDieForLevel(level: number | null | undefined): PsionicDie {
  const normalizedLevel = normalizePsionicDiceLevel(level);

  if (normalizedLevel >= 17) {
    return "d12";
  }

  if (normalizedLevel >= 11) {
    return "d10";
  }

  if (normalizedLevel >= 5) {
    return "d8";
  }

  return "d6";
}
