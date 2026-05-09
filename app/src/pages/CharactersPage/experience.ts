const standardLevelXpRequirements = [
  0,
  300,
  900,
  2700,
  6500,
  14000,
  23000,
  34000,
  48000,
  64000,
  85000,
  100000,
  120000,
  140000,
  165000,
  195000,
  225000,
  265000,
  305000,
  355000
] as const;

const MIN_CHARACTER_LEVEL = 1;
export const MAX_CHARACTER_LEVEL = 100;
const EPIC_LEVEL_XP_INCREMENT = 30000;
const LEVEL_20_XP_REQUIREMENT =
  standardLevelXpRequirements[standardLevelXpRequirements.length - 1] ?? 355000;
const levelXpRequirements: readonly number[] = Array.from(
  { length: MAX_CHARACTER_LEVEL },
  (_value, index) =>
    index < standardLevelXpRequirements.length
      ? (standardLevelXpRequirements[index] ?? LEVEL_20_XP_REQUIREMENT)
      : LEVEL_20_XP_REQUIREMENT +
        (index - standardLevelXpRequirements.length + 1) * EPIC_LEVEL_XP_INCREMENT
);

function clampCharacterLevel(value: unknown): number {
  const parsedLevel = Number(value);

  if (!Number.isFinite(parsedLevel)) {
    return MIN_CHARACTER_LEVEL;
  }

  return Math.max(
    MIN_CHARACTER_LEVEL,
    Math.min(MAX_CHARACTER_LEVEL, Math.floor(parsedLevel))
  );
}

function normalizeXpValue(value: unknown, fallback: number): number {
  const parsedXp = Number(value);

  if (!Number.isFinite(parsedXp)) {
    return fallback;
  }

  return Math.max(0, Math.floor(parsedXp));
}

export function getMinimumXpForLevel(level: number): number {
  const normalizedLevel = clampCharacterLevel(level);
  return levelXpRequirements[normalizedLevel - 1];
}

export function getLevelForXp(xp: number): number {
  const normalizedXp = Math.max(0, Math.floor(xp));

  for (let index = levelXpRequirements.length - 1; index >= 0; index -= 1) {
    if (normalizedXp >= levelXpRequirements[index]) {
      return index + 1;
    }
  }

  return MIN_CHARACTER_LEVEL;
}

export function normalizeLevelAndXp(level: unknown, xp: unknown): {
  level: number;
  xp: number;
} {
  const normalizedLevel = clampCharacterLevel(level);
  const minimumXpForLevel = getMinimumXpForLevel(normalizedLevel);
  const normalizedXp = Math.max(
    minimumXpForLevel,
    normalizeXpValue(xp, minimumXpForLevel)
  );
  const levelFromXp = getLevelForXp(normalizedXp);

  return {
    level: Math.max(normalizedLevel, levelFromXp),
    xp: normalizedXp
  };
}

export function getNextLevelThreshold(level: number): number | null {
  const normalizedLevel = clampCharacterLevel(level);

  if (normalizedLevel >= MAX_CHARACTER_LEVEL) {
    return null;
  }

  return getMinimumXpForLevel(normalizedLevel + 1);
}

export function getXpProgressPercent(level: number, xp: number): number {
  const normalizedLevel = clampCharacterLevel(level);
  const currentLevelThreshold = getMinimumXpForLevel(normalizedLevel);
  const nextLevelThreshold = getNextLevelThreshold(normalizedLevel);
  const normalizedXp = Math.max(0, Math.floor(xp));

  if (normalizedXp <= currentLevelThreshold) {
    return normalizedXp === currentLevelThreshold ? 100 : 0;
  }

  if (nextLevelThreshold === null) {
    return 100;
  }

  if (normalizedXp >= nextLevelThreshold) {
    return 100;
  }

  const xpInLevel = normalizedXp - currentLevelThreshold;
  const levelRange = Math.max(1, nextLevelThreshold - currentLevelThreshold);
  const progressPercent = (xpInLevel / levelRange) * 100;

  return Math.max(0, Math.min(100, progressPercent));
}
