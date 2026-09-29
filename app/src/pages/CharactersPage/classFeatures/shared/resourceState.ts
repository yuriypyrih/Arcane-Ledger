import type { Character, CharacterClassFeatureState } from "../../../../types";

/** Class-local writers keep the existing persisted state as the only resource authority. */
export function replaceClassFeatureState<K extends keyof CharacterClassFeatureState>(
  character: Character,
  key: K,
  state: NonNullable<CharacterClassFeatureState[K]>
): Character {
  return { ...character, classFeatureState: { ...character.classFeatureState, [key]: state } };
}

export type NumericKey<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends number ? K : never;
}[keyof T];

export function spendClassResource<K extends keyof CharacterClassFeatureState>(
  character: Character,
  resource: {
    stateKey: K;
    counter: NumericKey<NonNullable<CharacterClassFeatureState[K]>>;
    total: number;
    remaining: number;
  },
  cost: number
): Character {
  const amount = Math.max(0, Math.floor(cost));
  if (!Number.isFinite(amount) || amount <= 0 || resource.total <= 0 || resource.remaining < amount)
    return character;
  const state = character.classFeatureState?.[resource.stateKey] as
    | NonNullable<CharacterClassFeatureState[K]>
    | undefined;
  const current = Number(
    (state as Record<string, unknown> | undefined)?.[String(resource.counter)]
  );
  const next = Math.max(
    0,
    Math.min(resource.total, (Number.isFinite(current) ? Math.floor(current) : 0) + amount)
  );
  return replaceClassFeatureState(character, resource.stateKey, {
    ...state,
    [resource.counter]: next
  } as NonNullable<CharacterClassFeatureState[K]>);
}

export function getResourceUsageState(enabled: boolean, total: number, remaining: number) {
  return !enabled || total <= 0
    ? null
    : {
        available: remaining > 0,
        expended: remaining <= 0,
        usesRemaining: remaining,
        usesTotal: total
      };
}
