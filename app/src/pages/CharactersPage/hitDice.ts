import type { Character } from "../../types";
import type { CharacterCustomHitDie } from "../../types";
import { getCharacterClasses, getCharacterLevel } from "./multiclass";
import { getClassEntries } from "../../codex/selectors";
import { areCharacterClassRulesEnforced, getCharacterClassRulesHitDie } from "./customClass";

type HitDiceCharacter = Pick<Character, "level"> &
  Partial<Pick<Character, "className" | "classRules" | "customClass" | "hitDiceRemaining">>;

const codexClassEntriesByName = new Map(getClassEntries().map((entry) => [entry.name, entry]));

function getHitDiceTotalForLevel(level: unknown): number {
  const parsedLevel = Number(level);

  if (!Number.isFinite(parsedLevel)) {
    return 1;
  }

  return Math.max(1, Math.floor(parsedLevel));
}

export function getHitDieFormulaForClass(
  className: string | null | undefined,
  customClass?: HitDiceCharacter["customClass"],
  classRules?: HitDiceCharacter["classRules"]
): string {
  if (!areCharacterClassRulesEnforced({ className, classRules, customClass })) {
    return `1${getCharacterClassRulesHitDie({ className, classRules, customClass })}`;
  }

  const classEntry =
    typeof className === "string" ? codexClassEntriesByName.get(className) : undefined;

  if (!classEntry) {
    return "1d8";
  }

  const rawDie = String(classEntry.hitPointDie).toLowerCase();
  return rawDie.startsWith("d") ? `1${rawDie}` : "1d8";
}

export function getHitDieLabelForClass(
  className: string | null | undefined,
  customClass?: HitDiceCharacter["customClass"],
  classRules?: HitDiceCharacter["classRules"]
): string {
  return getHitDieFormulaForClass(className, customClass, classRules)
    .replace(/^1/i, "")
    .toUpperCase();
}

export function getHitDieLabelForCharacter(character: HitDiceCharacter): string {
  return getHitDieLabelForClass(character.className, character.customClass, character.classRules);
}

export function getHitDieMaximumForClass(
  className: string | null | undefined,
  customClass?: HitDiceCharacter["customClass"],
  classRules?: HitDiceCharacter["classRules"]
): number {
  if (!areCharacterClassRulesEnforced({ className, classRules, customClass })) {
    return Number(
      getCharacterClassRulesHitDie({ className, classRules, customClass }).replace(/\D/g, "")
    );
  }

  const classEntry =
    typeof className === "string" ? codexClassEntriesByName.get(className) : undefined;
  const rawHitDie = classEntry ? String(classEntry.hitPointDie) : "D8";
  const parsedMaximum = Number(rawHitDie.replace(/\D/g, ""));

  if (!Number.isFinite(parsedMaximum) || parsedMaximum <= 0) {
    return 8;
  }

  return parsedMaximum;
}

export function getHitDiceTotalForCharacter(character: HitDiceCharacter): number {
  return getHitDiceTotalForLevel(getCharacterLevel(character));
}

export function getHitDiceRemainingForCharacter(character: HitDiceCharacter): number {
  if ((character as Character).multiclass)
    return getHitDicePools(character).reduce((sum, pool) => sum + pool.remaining, 0);
  const totalHitDice = getHitDiceTotalForCharacter(character);
  const parsedRemaining = Number(character.hitDiceRemaining);

  if (!Number.isFinite(parsedRemaining)) {
    return totalHitDice;
  }

  return Math.max(0, Math.min(totalHitDice, Math.floor(parsedRemaining)));
}

export function getHitDiceDisplayForCharacter(character: HitDiceCharacter): string {
  if ((character as Character).multiclass)
    return getHitDicePools(character)
      .map((pool) => `1${pool.die} (${pool.remaining}/${pool.total})`)
      .join(" · ");
  const hitDieFormula = getHitDieFormulaForClass(
    character.className,
    character.customClass,
    character.classRules
  );
  const totalHitDice = getHitDiceTotalForCharacter(character);
  const availableHitDice = getHitDiceRemainingForCharacter(character);

  return `${hitDieFormula} (${availableHitDice}/${totalHitDice})`;
}

export type ClassHitDicePool = {
  classEntryId: string;
  className: string;
  die: CharacterCustomHitDie;
  total: number;
  remaining: number;
};

/** Legacy saves did not record which same-die class paid. Assign those spends in class order. */
export function getClassHitDicePools(character: object): ClassHitDicePool[] {
  const value = character as Character;
  const legacySpent = { ...value.multiclass?.hitDiceExpended };
  return getCharacterClasses(character).map((entry) => {
    const die =
      `d${getHitDieMaximumForClass(entry.className, entry.customClass, entry.classRules)}` as CharacterCustomHitDie;
    const total = entry.level;
    let spent = 0;
    if (value.multiclass?.hitDiceExpendedByClass !== undefined) {
      spent = value.multiclass.hitDiceExpendedByClass[entry.id] ?? 0;
    } else if (value.multiclass) {
      spent = Math.min(total, legacySpent[die] ?? 0);
      legacySpent[die] = Math.max(0, (legacySpent[die] ?? 0) - spent);
    } else {
      spent = total - getHitDiceRemainingForCharacter(value);
    }
    return {
      classEntryId: entry.id,
      className: entry.customClass?.name || entry.className,
      die,
      total,
      remaining: Math.max(0, total - spent)
    };
  });
}

/** Aggregate only for mechanics that choose a die size, such as Lifedrinker. */
export function getHitDicePools(
  character: object
): { die: CharacterCustomHitDie; total: number; remaining: number }[] {
  const pools = new Map<
    CharacterCustomHitDie,
    { die: CharacterCustomHitDie; total: number; remaining: number }
  >();
  getClassHitDicePools(character).forEach((pool) => {
    const previous = pools.get(pool.die);
    pools.set(pool.die, {
      die: pool.die,
      total: (previous?.total ?? 0) + pool.total,
      remaining: (previous?.remaining ?? 0) + pool.remaining
    });
  });
  return [...pools.values()];
}

export function getClassHitDiceExpended(character: object): Record<string, number> {
  const saved = (character as Character).multiclass?.hitDiceExpendedByClass;
  if (saved) return { ...saved };
  return Object.fromEntries(
    getClassHitDicePools(character).map((pool) => [pool.classEntryId, pool.total - pool.remaining])
  );
}

function persistClassHitDicePools(character: Character, pools: ClassHitDicePool[]): Character {
  const hitDiceRemaining = pools.reduce((sum, pool) => sum + pool.remaining, 0);
  if (!character.multiclass) return { ...character, hitDiceRemaining };
  const spentByClass = getClassHitDiceExpended(character);
  const previousPools = new Map(
    getClassHitDicePools(character).map((pool) => [pool.classEntryId, pool])
  );
  return {
    ...character,
    hitDiceRemaining,
    multiclass: {
      ...character.multiclass,
      hitDiceExpended: undefined,
      hitDiceExpendedByClass: {
        ...spentByClass,
        ...Object.fromEntries(
          pools.map((pool) => {
            const previous = previousPools.get(pool.classEntryId)!;
            const spent = spentByClass[pool.classEntryId] ?? 0;
            return [
              pool.classEntryId,
              pool.remaining === pool.total
                ? 0
                : Math.max(0, spent + previous.remaining - pool.remaining)
            ];
          })
        )
      }
    }
  };
}

export function spendClassHitDice(
  character: Character,
  classEntryId: string,
  count: number
): Character {
  const pools = getClassHitDicePools(character);
  const pool = pools.find((entry) => entry.classEntryId === classEntryId);
  if (!pool || !Number.isInteger(count) || count < 1 || count > pool.remaining) return character;
  return persistClassHitDicePools(
    character,
    pools.map((entry) =>
      entry === pool ? { ...entry, remaining: entry.remaining - count } : entry
    )
  );
}

export function restoreClassHitDice(
  character: Character,
  classEntryId: string,
  count = Number.MAX_SAFE_INTEGER
): Character {
  const pools = getClassHitDicePools(character);
  const pool = pools.find((entry) => entry.classEntryId === classEntryId);
  if (!pool || !Number.isInteger(count) || count < 1 || pool.remaining === pool.total)
    return character;
  return persistClassHitDicePools(
    character,
    pools.map((entry) =>
      entry === pool
        ? { ...entry, remaining: Math.min(entry.total, entry.remaining + count) }
        : entry
    )
  );
}

export function spendHitDice(
  character: Character,
  die: CharacterCustomHitDie,
  count: number
): Character {
  const pools = getClassHitDicePools(character);
  const available = pools
    .filter((pool) => pool.die === die)
    .reduce((sum, pool) => sum + pool.remaining, 0);
  if (!Number.isInteger(count) || count < 1 || count > available) return character;
  let remaining = count;
  return persistClassHitDicePools(
    character,
    pools.map((pool) => {
      if (pool.die !== die) return pool;
      const spent = Math.min(remaining, pool.remaining);
      remaining -= spent;
      return { ...pool, remaining: pool.remaining - spent };
    })
  );
}

export function restoreHitDice(character: Character): Character {
  return persistClassHitDicePools(
    character,
    getClassHitDicePools(character).map((pool) => ({ ...pool, remaining: pool.total }))
  );
}

/** Restore a die size for callers that do not specify a class. */
export function restoreHitDicePool(
  character: Character,
  die: CharacterCustomHitDie,
  count = Number.MAX_SAFE_INTEGER
): Character {
  const pools = getClassHitDicePools(character);
  if (
    !Number.isInteger(count) ||
    count < 1 ||
    !pools.some((pool) => pool.die === die && pool.remaining < pool.total)
  )
    return character;
  let remaining = count;
  return persistClassHitDicePools(
    character,
    pools.map((pool) => {
      if (pool.die !== die) return pool;
      const restored = Math.min(remaining, pool.total - pool.remaining);
      remaining -= restored;
      return { ...pool, remaining: pool.remaining + restored };
    })
  );
}
