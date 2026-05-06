import type { Character, CharacterWarlockFeatureState } from "../../../../../types";

export type WarlockExpendedUseKey = keyof Pick<
  CharacterWarlockFeatureState,
  | "magicalCunningUsesExpended"
  | "contactPatronUsesExpended"
  | "giftOfTheDepthsUsesExpended"
  | "giftOfTheProtectorsUsesExpended"
>;

export function normalizeWarlockExpendedUses(
  value: unknown,
  totalUses: number
): number | undefined {
  const rawValue = Number(value);

  return totalUses > 0 && Number.isFinite(rawValue)
    ? Math.max(0, Math.min(totalUses, Math.floor(rawValue)))
    : undefined;
}

export function getWarlockUsesRemaining(
  warlockState: CharacterWarlockFeatureState,
  key: WarlockExpendedUseKey,
  totalUses: number
): number {
  if (totalUses <= 0) {
    return 0;
  }

  return Math.max(0, totalUses - (warlockState[key] ?? 0));
}

export function incrementWarlockExpendedUse(
  warlockState: CharacterWarlockFeatureState,
  key: WarlockExpendedUseKey
): CharacterWarlockFeatureState {
  return {
    ...warlockState,
    [key]: (warlockState[key] ?? 0) + 1
  };
}

export function consumeWarlockExpendedUse(
  character: Character,
  warlockState: CharacterWarlockFeatureState,
  key: WarlockExpendedUseKey
): Character {
  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: incrementWarlockExpendedUse(warlockState, key)
    }
  };
}

export function restoreWarlockExpendedUse(
  character: Character,
  warlockState: CharacterWarlockFeatureState,
  key: WarlockExpendedUseKey
): Character {
  if ((warlockState[key] ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        [key]: 0
      }
    }
  };
}
