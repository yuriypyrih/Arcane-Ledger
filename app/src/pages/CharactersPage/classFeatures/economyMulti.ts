import { ACTION_TYPE, type SpellEntry } from "../../../codex/entries";
import type { Character } from "../../../types";
import {
  ACTION_CATEGORY,
  ECONOMY_TYPE,
  getRoundTrackerResourceForEconomyType
} from "../actionEconomy";
import { isRoundTrackerResourceAvailable } from "../combat";
import type { WeaponAction } from "../gameplay";
import {
  consumeBarbarianWeaponAttack,
  getBarbarianWeaponAttackMultiCount
} from "./barbarian/barbarian";
import { consumeBardValorActionCantrip, consumeBardWeaponAttack } from "./bard/bard";
import {
  collegeOfValorSubclassId,
  getBardCollegeOfValorAdditionalAttackCount
} from "./bard/subclasses/bardCollegeOfValor";
import {
  consumeFighterActionCantrip,
  consumeFighterNonMagicAction,
  consumeFighterWeaponAttack,
  getFighterActionSurgeUsesTotal,
  getFighterExtraAttacksRemainingThisTurn,
  getFighterNonMagicActionMultiCount
} from "./fighter/fighter";
import {
  eldritchKnightSubclassId,
  getFighterEldritchKnightWarMagicMultiCount,
  getFighterEldritchKnightWarMagicSpellLevels
} from "./fighter/subclasses/fighterEldritchKnight";
import { consumeMonkWeaponAttack, getMonkExtraAttackMultiCount } from "./monk/monk";
import {
  consumePaladinWeaponAttack,
  getPaladinWeaponAttackMultiCount
} from "./paladin/paladin";
import {
  consumeRangerWeaponAttack,
  getRangerWeaponAttackMultiCount
} from "./ranger/ranger";
import {
  consumeWizardActionCantrip,
  consumeWizardWeaponAttack,
  getWizardWeaponAttackMultiCount
} from "./wizard/wizard";
import type {
  EconomyMultiActionContext,
  FeatureActionCard,
  FeatureActionOptionCard,
  FeatureEconomyMultiAccessRule,
  FeatureEconomyMultiPool
} from "./types";

type SharedEconomyMultiPool = FeatureEconomyMultiPool & {
  consume: (character: Character, context: EconomyMultiActionContext) => Character;
};

type SharedEconomyMultiCharacter = Pick<
  Character,
  "className" | "level" | "classFeatureState" | "roundTracker"
> &
  Partial<Pick<Character, "subclassId">>;

function clampRemaining(value: number): number {
  return Math.max(0, Math.floor(value));
}

function matchesAccessRule(
  rule: FeatureEconomyMultiAccessRule,
  context: EconomyMultiActionContext
): boolean {
  if (rule.economyTypes && !rule.economyTypes.includes(context.economyType)) {
    return false;
  }

  if (rule.actionCategories && !rule.actionCategories.includes(context.actionCategory)) {
    return false;
  }

  if (rule.attackKinds) {
    if (!context.attackKind || !rule.attackKinds.includes(context.attackKind)) {
      return false;
    }
  }

  if (rule.spellLevels) {
    if (context.spellLevel === undefined || !rule.spellLevels.includes(context.spellLevel)) {
      return false;
    }
  }

  return true;
}

function getFirstMatchingRule(
  pool: FeatureEconomyMultiPool,
  context: EconomyMultiActionContext
): FeatureEconomyMultiAccessRule | null {
  return pool.accessRules.find((rule) => matchesAccessRule(rule, context)) ?? null;
}

function getAccessiblePoolCount(
  pool: FeatureEconomyMultiPool,
  context: EconomyMultiActionContext
): number {
  const matchingRule = getFirstMatchingRule(pool, context);

  if (!matchingRule || pool.remaining <= 0) {
    return 0;
  }

  return matchingRule.maxAccessible === "all"
    ? pool.remaining
    : Math.min(pool.remaining, matchingRule.maxAccessible);
}

function hasFighterExtraAttackPool(
  character: Pick<Character, "className" | "level">
): boolean {
  return character.className === "Fighter" && character.level >= 5;
}

function hasFighterWarMagic(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Fighter" &&
    character.subclassId === eldritchKnightSubclassId &&
    character.level >= 7
  );
}

function hasFighterActionSurgePool(
  character: Pick<Character, "className" | "level">
): boolean {
  return getFighterActionSurgeUsesTotal(character) > 0;
}

function hasStandardExtraAttackPool(
  character: Pick<Character, "className" | "level">,
  className: Character["className"]
): boolean {
  return character.className === className && character.level >= 5;
}

function createAttackAccessRule(): FeatureEconomyMultiAccessRule {
  return {
    economyTypes: [ECONOMY_TYPE.ACTION],
    actionCategories: [ACTION_CATEGORY.ATTACK],
    attackKinds: ["weapon", "unarmed"],
    maxAccessible: "all"
  };
}

function createActionCantripAccessRule(): FeatureEconomyMultiAccessRule {
  return {
    economyTypes: [ECONOMY_TYPE.ACTION],
    actionCategories: [ACTION_CATEGORY.MAGIC],
    spellLevels: [0],
    maxAccessible: 1
  };
}

function createActionSpellAccessRule(
  spellLevels: number[],
  maxAccessible: number
): FeatureEconomyMultiAccessRule {
  return {
    economyTypes: [ECONOMY_TYPE.ACTION],
    actionCategories: [ACTION_CATEGORY.MAGIC],
    spellLevels,
    maxAccessible
  };
}

function createFighterExtraAttackPool(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool | null {
  if (!hasFighterExtraAttackPool(character)) {
    return null;
  }

  const warMagicMultiCount = hasFighterWarMagic(character)
    ? getFighterEldritchKnightWarMagicMultiCount(character)
    : 0;
  const warMagicSpellLevels = hasFighterWarMagic(character)
    ? getFighterEldritchKnightWarMagicSpellLevels(character)
    : [];

  return {
    id: "fighter-extra-attack",
    remaining: clampRemaining(getFighterExtraAttacksRemainingThisTurn(character)),
    priority: 10,
    accessRules: [
      createAttackAccessRule(),
      ...(warMagicMultiCount > 0 && warMagicSpellLevels.length > 0
        ? [createActionSpellAccessRule(warMagicSpellLevels, warMagicMultiCount)]
        : [])
    ],
    consume: (nextCharacter, context) =>
      context.actionCategory === ACTION_CATEGORY.MAGIC &&
      context.spellLevel !== undefined &&
      warMagicSpellLevels.includes(context.spellLevel)
        ? consumeFighterActionCantrip(nextCharacter)
        : consumeFighterWeaponAttack(nextCharacter)
  };
}

function createFighterActionSurgePool(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool | null {
  if (!hasFighterActionSurgePool(character)) {
    return null;
  }

  return {
    id: "fighter-action-surge",
    remaining: clampRemaining(getFighterNonMagicActionMultiCount(character)),
    priority: 20,
    accessRules: [
      {
        economyTypes: [ECONOMY_TYPE.ACTION],
        actionCategories: [
          ACTION_CATEGORY.ATTACK,
          ACTION_CATEGORY.FEATURE,
          ACTION_CATEGORY.UTILITY,
          ACTION_CATEGORY.INTERACTION
        ],
        maxAccessible: "all"
      }
    ],
    consume: (nextCharacter) => consumeFighterNonMagicAction(nextCharacter)
  };
}

function createBardValorExtraAttackPool(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool | null {
  if (getBardCollegeOfValorAdditionalAttackCount(character) <= 0) {
    return null;
  }

  const bardState = character.classFeatureState?.bard;
  const valorCantripReplacementUsed = bardState?.valorCantripReplacementUsedThisTurn === true;

  return {
    id: "bard-valor-extra-attack",
    remaining: clampRemaining(consumeBardPoolRemaining(character)),
    priority: 10,
    accessRules: [
      createAttackAccessRule(),
      ...(!valorCantripReplacementUsed ? [createActionCantripAccessRule()] : [])
    ],
    consume: (nextCharacter, context) =>
      context.actionCategory === ACTION_CATEGORY.MAGIC && context.spellLevel === 0
        ? consumeBardValorActionCantrip(nextCharacter)
        : consumeBardWeaponAttack(nextCharacter, {
            attackKind: context.attackKind ?? "weapon"
          })
  };
}

function consumeBardPoolRemaining(character: SharedEconomyMultiCharacter): number {
  if (character.className !== "Bard" || character.subclassId !== collegeOfValorSubclassId) {
    return 0;
  }

  return character.classFeatureState?.bard?.extraAttacksRemainingThisTurn ?? 0;
}

function createBarbarianExtraAttackPool(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool | null {
  if (!hasStandardExtraAttackPool(character, "Barbarian")) {
    return null;
  }

  return {
    id: "barbarian-extra-attack",
    remaining: clampRemaining(getBarbarianWeaponAttackMultiCount(character)),
    priority: 10,
    accessRules: [createAttackAccessRule()],
    consume: (nextCharacter) => consumeBarbarianWeaponAttack(nextCharacter)
  };
}

function createRangerExtraAttackPool(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool | null {
  if (!hasStandardExtraAttackPool(character, "Ranger")) {
    return null;
  }

  return {
    id: "ranger-extra-attack",
    remaining: clampRemaining(getRangerWeaponAttackMultiCount(character)),
    priority: 10,
    accessRules: [createAttackAccessRule()],
    consume: (nextCharacter) => consumeRangerWeaponAttack(nextCharacter)
  };
}

function createPaladinExtraAttackPool(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool | null {
  if (!hasStandardExtraAttackPool(character, "Paladin")) {
    return null;
  }

  return {
    id: "paladin-extra-attack",
    remaining: clampRemaining(getPaladinWeaponAttackMultiCount(character)),
    priority: 10,
    accessRules: [createAttackAccessRule()],
    consume: (nextCharacter) => consumePaladinWeaponAttack(nextCharacter)
  };
}

function createMonkExtraAttackPool(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool | null {
  if (!hasStandardExtraAttackPool(character, "Monk")) {
    return null;
  }

  return {
    id: "monk-extra-attack",
    remaining: clampRemaining(getMonkExtraAttackMultiCount(character)),
    priority: 10,
    accessRules: [createAttackAccessRule()],
    consume: (nextCharacter, context) =>
      consumeMonkWeaponAttack(nextCharacter, {
        key: context.attackKind === "unarmed" ? "unarmed-strike" : "shared-attack",
        economyType: context.economyType,
        attackKind: context.attackKind ?? "weapon"
      })
  };
}

function createWizardBladesingerExtraAttackPool(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool | null {
  if (
    character.className !== "Wizard" ||
    character.subclassId !== "wizard-bladesinger" ||
    character.level < 6
  ) {
    return null;
  }

  const wizardState = character.classFeatureState?.wizard;
  const cantripReplacementUsed =
    wizardState?.bladesingerCantripReplacementUsedThisTurn === true;

  return {
    id: "wizard-bladesinger-extra-attack",
    remaining: clampRemaining(getWizardWeaponAttackMultiCount(character)),
    priority: 10,
    accessRules: [
      createAttackAccessRule(),
      ...(!cantripReplacementUsed ? [createActionCantripAccessRule()] : [])
    ],
    consume: (nextCharacter, context) =>
      context.actionCategory === ACTION_CATEGORY.MAGIC && context.spellLevel === 0
        ? consumeWizardActionCantrip(nextCharacter)
        : consumeWizardWeaponAttack(nextCharacter, {
            attackKind: context.attackKind ?? "weapon"
          })
  };
}

function getSharedEconomyMultiPools(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool[] {
  const pools = [
    createFighterExtraAttackPool(character),
    createFighterActionSurgePool(character),
    createBardValorExtraAttackPool(character),
    createBarbarianExtraAttackPool(character),
    createRangerExtraAttackPool(character),
    createPaladinExtraAttackPool(character),
    createMonkExtraAttackPool(character),
    createWizardBladesingerExtraAttackPool(character)
  ].filter((pool): pool is SharedEconomyMultiPool => pool !== null);

  return pools.sort((left, right) => left.priority - right.priority);
}

function getPoolCandidatesForConsumption(
  character: SharedEconomyMultiCharacter,
  context: EconomyMultiActionContext
): SharedEconomyMultiPool[] {
  const roundTrackerResource = getRoundTrackerResourceForEconomyType(context.economyType);
  const baseResourceAvailable =
    roundTrackerResource !== null &&
    isRoundTrackerResourceAvailable(character.roundTracker, roundTrackerResource);

  return getSharedEconomyMultiPools(character).filter((pool) => {
    const matchingRule = getFirstMatchingRule(pool, context);

    if (!matchingRule) {
      return false;
    }

    return pool.remaining > 0 || baseResourceAvailable;
  });
}

export function createEconomyMultiContextForWeaponAction(
  action: Pick<WeaponAction, "economyType" | "actionCategory" | "attackKind">
): EconomyMultiActionContext {
  return {
    economyType: action.economyType,
    actionCategory: action.actionCategory,
    attackKind: action.attackKind
  };
}

export function createEconomyMultiContextForFeatureAction(
  action: Pick<FeatureActionCard, "economyType" | "actionCategory">
): EconomyMultiActionContext {
  return {
    economyType: action.economyType,
    actionCategory: action.actionCategory
  };
}

export function createEconomyMultiContextForFeatureActionOption(
  option: Pick<FeatureActionOptionCard, "economyType" | "actionCategory">
): EconomyMultiActionContext {
  return {
    economyType: option.economyType,
    actionCategory: option.actionCategory
  };
}

export function getEconomyTypeForSpell(
  spell: Pick<SpellEntry, "castingTime">
): EconomyMultiActionContext["economyType"] {
  if (spell.castingTime.includes(ACTION_TYPE.REACTION)) {
    return ECONOMY_TYPE.REACTION;
  }

  if (spell.castingTime.includes(ACTION_TYPE.BONUS_ACTION)) {
    return ECONOMY_TYPE.BONUS_ACTION;
  }

  if (spell.castingTime.includes(ACTION_TYPE.ACTION)) {
    return ECONOMY_TYPE.ACTION;
  }

  return ECONOMY_TYPE.NON_COMBAT;
}

export function createEconomyMultiContextForSpell(
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): EconomyMultiActionContext {
  return {
    economyType: getEconomyTypeForSpell(spell),
    actionCategory: ACTION_CATEGORY.MAGIC,
    spellLevel: spell.spellLevel
  };
}

export function getSharedEconomyMultiCountForCharacterAction(
  character: SharedEconomyMultiCharacter,
  context: EconomyMultiActionContext
): number {
  return getSharedEconomyMultiPools(character).reduce(
    (total, pool) => total + getAccessiblePoolCount(pool, context),
    0
  );
}

export function consumeSharedEconomyMultiForCharacterAction(
  character: Character,
  context: EconomyMultiActionContext
): Character {
  const matchingPool = getPoolCandidatesForConsumption(character, context)[0];

  if (!matchingPool) {
    return character;
  }

  return matchingPool.consume(character, context);
}
