import type { Character } from "../../../types";
import { ACTION_CATEGORY, getRoundTrackerResourceForEconomyType } from "../actionEconomy";
import {
  consumeRoundTrackerResource,
  isRoundTrackerResourceAvailable,
  shouldTrackRoundScopedResources
} from "../combat";
import type { RoundTrackerResource } from "../combat";
import type { EconomyMultiActionContext, FeatureEconomyMultiAccessRule } from "./types";

export type EconomyAccessRule = FeatureEconomyMultiAccessRule & {
  onSpend?: (character: Character) => Character;
};

export type EconomyPool = {
  id: string;
  /** Attack alternatives share one budget; independent grants are additive. */
  group: "attack" | "independent" | "action-surge";
  remaining: number;
  capacity: number;
  rules: EconomyAccessRule[];
  onStart?: (character: Character) => Character;
  writeRemaining: (character: Character, remaining: number) => Character;
};

type Payment =
  | { kind: "untracked" }
  | { kind: "base"; resource: RoundTrackerResource }
  | { kind: "pool"; pool: EconomyPool; rule: EconomyAccessRule }
  | {
      kind: "attack-action";
      pool: EconomyPool;
      rule: EconomyAccessRule;
      surge?: EconomyPool;
    };

export type EconomyPaymentResolution = {
  isAvailable: boolean;
  multiCount: number;
  payment: Payment | null;
};

export type EconomyPaymentResult =
  | { status: "paid"; character: Character }
  | { status: "unavailable"; character: Character };

function matches(rule: EconomyAccessRule, context: EconomyMultiActionContext): boolean {
  return (
    (!rule.economyTypes || rule.economyTypes.includes(context.economyType)) &&
    (!rule.actionCategories || rule.actionCategories.includes(context.actionCategory)) &&
    (!rule.attackKinds ||
      (!!context.attackKind && rule.attackKinds.includes(context.attackKind))) &&
    (!rule.weaponInventoryFeatureTags ||
      rule.weaponInventoryFeatureTags.every((tag) =>
        context.weaponInventoryFeatureTags?.includes(tag)
      )) &&
    (!rule.spellLevels ||
      (context.spellLevel !== undefined && rule.spellLevels.includes(context.spellLevel))) &&
    (!rule.spellCastingTimes ||
      rule.spellCastingTimes.some((time) => context.spellCastingTime?.includes(time))) &&
    (!rule.spellActionPathIds || rule.spellActionPathIds.includes(context.spellActionPathId ?? ""))
  );
}

function count(pool: EconomyPool, rule: EconomyAccessRule): number {
  return Math.max(
    0,
    Math.min(
      Math.floor(pool.remaining / (rule.cost ?? 1)),
      rule.maxAccessible === "all" ? Infinity : rule.maxAccessible
    )
  );
}

/** The same decision supplies UI availability and the execution payment. */
export function resolveEconomyPayment(
  character: Pick<Character, "roundTracker">,
  context: EconomyMultiActionContext,
  pools: EconomyPool[]
): EconomyPaymentResolution {
  const resource = getRoundTrackerResourceForEconomyType(context.economyType);
  if (!shouldTrackRoundScopedResources(character.roundTracker) || !resource) {
    return {
      isAvailable: !context.poolOnly,
      multiCount: 0,
      payment: context.poolOnly ? null : { kind: "untracked" }
    };
  }
  const baseAvailable =
    !context.poolOnly &&
    resource !== null &&
    isRoundTrackerResourceAvailable(character.roundTracker, resource);
  const candidates = pools.flatMap((pool) =>
    pool.rules.filter((rule) => matches(rule, context)).map((rule) => ({ pool, rule }))
  );
  const attackCount = Math.max(
    0,
    ...candidates
      .filter(({ pool }) => pool.group === "attack")
      .map(({ pool, rule }) => count(pool, rule))
  );
  // Each independent pool contributes once, even if several rules match.
  const independentCount = pools
    .filter((pool) => pool.group !== "attack")
    .reduce(
      (total, pool) =>
        total +
        Math.max(
          0,
          ...candidates
            .filter((candidate) => candidate.pool === pool)
            .map(({ rule }) => count(pool, rule))
        ),
      0
    );
  const multiCount = attackCount + independentCount;
  const available = candidates.find(
    ({ pool, rule }) => pool.group !== "action-surge" && count(pool, rule) > 0
  );
  if (available) {
    return { isAvailable: baseAvailable, multiCount, payment: { kind: "pool", ...available } };
  }
  const starter = candidates.find(
    ({ pool, rule }) =>
      pool.group === "attack" &&
      pool.capacity >= (rule.cost ?? 1) &&
      (rule.maxAccessible === "all" || rule.maxAccessible > 0)
  );
  if (baseAvailable) {
    return {
      isAvailable: true,
      multiCount,
      payment: starter
        ? { kind: "attack-action", ...starter }
        : { kind: "base", resource: resource! }
    };
  }
  const surge = candidates.find(
    ({ pool, rule }) => pool.group === "action-surge" && count(pool, rule) > 0
  );
  if (surge) {
    return {
      isAvailable: false,
      multiCount,
      payment:
        starter && context.actionCategory === ACTION_CATEGORY.ATTACK
          ? { kind: "attack-action", ...starter, surge: surge.pool }
          : { kind: "pool", ...surge }
    };
  }
  return { isAvailable: baseAvailable, multiCount, payment: null };
}

/** Write every representation of the Attack action once, without invoking other attacks. */
function writeAttackBudget(
  character: Character,
  pools: EconomyPool[],
  cost: number,
  starting: boolean
): Character {
  return pools
    .filter((pool) => pool.group === "attack")
    .reduce(
      (next, pool) =>
        pool.writeRemaining(
          starting ? (pool.onStart?.(next) ?? next) : next,
          Math.max(0, (starting ? pool.capacity : pool.remaining) - cost)
        ),
      character
    );
}

export function applyEconomyPayment(
  character: Character,
  resolution: EconomyPaymentResolution,
  pools: EconomyPool[]
): EconomyPaymentResult {
  const payment = resolution.payment;
  if (!payment) return { status: "unavailable", character };
  if (payment.kind === "untracked") return { status: "paid", character };
  if (payment.kind === "base") {
    return {
      status: "paid",
      character: {
        ...character,
        roundTracker: consumeRoundTrackerResource(character.roundTracker, payment.resource)
      }
    };
  }
  const cost = payment.rule.cost ?? 1;
  let next = character;
  if (payment.kind === "attack-action") {
    next = payment.surge
      ? payment.surge.writeRemaining(next, payment.surge.remaining - 1)
      : { ...next, roundTracker: consumeRoundTrackerResource(next.roundTracker, "action") };
    next = writeAttackBudget(next, pools, cost, true);
  } else if (payment.pool.group === "attack") {
    next = writeAttackBudget(next, pools, cost, false);
  } else {
    next = payment.pool.writeRemaining(next, payment.pool.remaining - cost);
  }
  return { status: "paid", character: payment.rule.onSpend?.(next) ?? next };
}
