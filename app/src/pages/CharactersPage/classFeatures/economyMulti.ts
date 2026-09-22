import {
  getCharacterClasses,
  getClassEditorCharacter,
  applyClassEditorChange,
  getClassLevel,
  getClassSubclassId,
  hasCharacterClass
} from "../multiclass";
import { ACTION_TYPE, type SpellEntry } from "../../../codex/entries";
import type { Character } from "../../../types";
import {
  ACTION_CATEGORY,
  ECONOMY_TYPE,
  getRoundTrackerResourceForEconomyType
} from "../actionEconomy";
import {
  consumeRoundTrackerResource,
  consumeRoundTrackerSpellExtraAttackUse,
  getRoundTrackerSpellExtraAttackUses,
  isRoundTrackerResourceAvailable,
  shouldTrackRoundScopedResources
} from "../combat";
import {
  hasActiveTashasOtherworldlyGuiseStatus,
  tashasOtherworldlyGuiseSpellId
} from "../characterRuntime/spellImplementations/tashasOtherworldlyGuise";
import {
  hasActiveTensersTransformationStatus,
  tensersTransformationSpellId
} from "../characterRuntime/spellImplementations/tensersTransformation";
import type { WeaponAction } from "../gameplay";
import {
  consumeArtificerWeaponAttack,
  getArtificerWeaponAttackMultiCount,
  hasArtificerExtraAttackFeature
} from "./artificer/artificer";
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
import {
  consumeCustomClassWeaponAttack,
  getCustomClassWeaponAttackMultiCount
} from "./customClass/customClass";
import { INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE } from "../inventoryItems";
import { getCharacterClassRulesExtraAttackCount } from "../customClass";
import { consumeMonkWeaponAttack, getMonkExtraAttackMultiCount } from "./monk/monk";
import { consumePaladinWeaponAttack, getPaladinWeaponAttackMultiCount } from "./paladin/paladin";
import { consumeRangerWeaponAttack, getRangerWeaponAttackMultiCount } from "./ranger/ranger";
import {
  consumeWarlockPactWeaponAttack,
  getWarlockPactWeaponAttackMultiCount,
  hasWarlockPactBladeExtraAttackFeature
} from "./warlock/warlock";
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
  FeatureEconomyMultiPool,
  WeaponAttackConsumptionContext
} from "./types";

type SharedEconomyMultiPool = FeatureEconomyMultiPool & {
  consume: (character: Character, context: EconomyMultiActionContext) => Character;
};

type SharedEconomyMultiCharacter = Pick<
  Character,
  | "className"
  | "level"
  | "classFeatureState"
  | "classRules"
  | "customClass"
  | "roundTracker"
  | "statusEntries"
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

  if (rule.weaponInventoryFeatureTags) {
    const actionFeatureTags = context.weaponInventoryFeatureTags ?? [];

    if (!rule.weaponInventoryFeatureTags.every((tag) => actionFeatureTags.includes(tag))) {
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

function hasFighterExtraAttackPool(character: Pick<Character, "className" | "level">): boolean {
  return getClassLevel(character, "Fighter") >= 5;
}

function hasFighterWarMagic(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    hasCharacterClass(character, "Fighter") &&
    getClassSubclassId(character, "Fighter") === eldritchKnightSubclassId &&
    getClassLevel(character, "Fighter") >= 7
  );
}

function hasFighterActionSurgePool(character: Pick<Character, "className" | "level">): boolean {
  return getFighterActionSurgeUsesTotal(character) > 0;
}

function hasStandardExtraAttackPool(
  character: Pick<Character, "className" | "level">,
  className: Character["className"]
): boolean {
  return getClassLevel(character, className) >= 5;
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

function createWeaponAttackConsumptionContext(
  context: EconomyMultiActionContext
): WeaponAttackConsumptionContext {
  const attackKind = context.attackKind ?? "weapon";

  return {
    key: context.weaponActionKey ?? (attackKind === "unarmed" ? "unarmed-strike" : "shared-attack"),
    economyType: context.economyType,
    actionCategory: context.actionCategory,
    attackKind,
    combatType: context.combatType,
    inventoryStackId: context.weaponInventoryStackId,
    inventoryFeatureTags: context.weaponInventoryFeatureTags
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
        : consumeFighterWeaponAttack(nextCharacter, createWeaponAttackConsumptionContext(context))
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
        : consumeBardWeaponAttack(nextCharacter, createWeaponAttackConsumptionContext(context))
  };
}

function consumeBardPoolRemaining(character: SharedEconomyMultiCharacter): number {
  if (
    !hasCharacterClass(character, "Bard") ||
    getClassSubclassId(character, "Bard") !== collegeOfValorSubclassId
  ) {
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

function createArtificerExtraAttackPool(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool | null {
  if (!hasArtificerExtraAttackFeature(character)) {
    return null;
  }

  return {
    id: "artificer-extra-attack",
    remaining: clampRemaining(getArtificerWeaponAttackMultiCount(character)),
    priority: 10,
    accessRules: [createAttackAccessRule()],
    consume: (nextCharacter) => consumeArtificerWeaponAttack(nextCharacter)
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
      consumeMonkWeaponAttack(nextCharacter, createWeaponAttackConsumptionContext(context))
  };
}

function createCustomClassExtraAttackPool(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool | null {
  if (getCharacterClassRulesExtraAttackCount(character) <= 0) {
    return null;
  }

  return {
    id: "custom-class-extra-attack",
    remaining: clampRemaining(getCustomClassWeaponAttackMultiCount(character)),
    priority: 10,
    accessRules: [createAttackAccessRule()],
    consume: (nextCharacter, context) =>
      consumeCustomClassWeaponAttack(nextCharacter, createWeaponAttackConsumptionContext(context))
  };
}

function createWarlockPactBladeExtraAttackPool(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool | null {
  if (
    !hasCharacterClass(character, "Warlock") ||
    !hasWarlockPactBladeExtraAttackFeature(character)
  ) {
    return null;
  }

  return {
    id: "warlock-pact-blade-extra-attack",
    remaining: clampRemaining(getWarlockPactWeaponAttackMultiCount(character)),
    priority: 10,
    accessRules: [
      {
        ...createAttackAccessRule(),
        attackKinds: ["weapon"],
        weaponInventoryFeatureTags: [INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE]
      }
    ],
    consume: (nextCharacter, context) =>
      consumeWarlockPactWeaponAttack(nextCharacter, createWeaponAttackConsumptionContext(context))
  };
}

function createWizardBladesingerExtraAttackPool(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool | null {
  if (
    !hasCharacterClass(character, "Wizard") ||
    getClassSubclassId(character, "Wizard") !== "wizard-bladesinger" ||
    getClassLevel(character, "Wizard") < 6
  ) {
    return null;
  }

  const wizardState = character.classFeatureState?.wizard;
  const cantripReplacementUsed = wizardState?.bladesingerCantripReplacementUsedThisTurn === true;

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
        : consumeWizardWeaponAttack(nextCharacter, createWeaponAttackConsumptionContext(context))
  };
}

function hasExistingExtraAttackFeature(character: SharedEconomyMultiCharacter): boolean {
  const hasCustomExtraAttackOverride = getCharacterClassRulesExtraAttackCount(character) > 0;
  const pools = [
    hasCustomExtraAttackOverride ? null : createFighterExtraAttackPool(character),
    hasCustomExtraAttackOverride ? null : createBardValorExtraAttackPool(character),
    hasCustomExtraAttackOverride ? null : createBarbarianExtraAttackPool(character),
    hasCustomExtraAttackOverride ? null : createRangerExtraAttackPool(character),
    hasCustomExtraAttackOverride ? null : createPaladinExtraAttackPool(character),
    hasCustomExtraAttackOverride ? null : createArtificerExtraAttackPool(character),
    hasCustomExtraAttackOverride ? null : createMonkExtraAttackPool(character),
    createCustomClassExtraAttackPool(character),
    hasCustomExtraAttackOverride ? null : createWarlockPactBladeExtraAttackPool(character),
    hasCustomExtraAttackOverride ? null : createWizardBladesingerExtraAttackPool(character)
  ];

  return pools.some((pool) => pool !== null);
}

function createSpellExtraAttackPool(
  character: SharedEconomyMultiCharacter,
  options: {
    id: string;
    spellId: string;
    isActive: (character: SharedEconomyMultiCharacter) => boolean;
  }
): SharedEconomyMultiPool | null {
  if (!options.isActive(character) || hasExistingExtraAttackFeature(character)) {
    return null;
  }

  const hasActionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");
  const extraAttacksUsed = getRoundTrackerSpellExtraAttackUses(
    character.roundTracker,
    options.spellId
  );

  return {
    id: options.id,
    remaining: hasActionAvailable ? 0 : clampRemaining(1 - extraAttacksUsed),
    priority: 10,
    accessRules: [
      {
        ...createAttackAccessRule(),
        attackKinds: ["weapon"]
      }
    ],
    consume: (nextCharacter) => {
      if (isRoundTrackerResourceAvailable(nextCharacter.roundTracker, "action")) {
        return {
          ...nextCharacter,
          roundTracker: consumeRoundTrackerResource(nextCharacter.roundTracker, "action")
        };
      }

      if (getRoundTrackerSpellExtraAttackUses(nextCharacter.roundTracker, options.spellId) >= 1) {
        return nextCharacter;
      }

      return {
        ...nextCharacter,
        roundTracker: consumeRoundTrackerSpellExtraAttackUse(
          nextCharacter.roundTracker,
          options.spellId
        )
      };
    }
  };
}

function createTashasOtherworldlyGuiseExtraAttackPool(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool | null {
  return createSpellExtraAttackPool(character, {
    id: "tashas-otherworldly-guise-extra-attack",
    spellId: tashasOtherworldlyGuiseSpellId,
    isActive: hasActiveTashasOtherworldlyGuiseStatus
  });
}

function createTensersTransformationExtraAttackPool(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool | null {
  return createSpellExtraAttackPool(character, {
    id: "tensers-transformation-extra-attack",
    spellId: tensersTransformationSpellId,
    isActive: hasActiveTensersTransformationStatus
  });
}

function getSharedEconomyMultiPools(
  character: SharedEconomyMultiCharacter
): SharedEconomyMultiPool[] {
  if ((character as Character).multiclass && !(character as Character).classEntryId) {
    const pools = getCharacterClasses(character).flatMap((entry) => {
      const view = getClassEditorCharacter(character, entry);
      // Resolve only this class's attack alternatives; the persisted view still keeps total level.
      return getSharedEconomyMultiPools({ ...view, multiclass: undefined } as Character)
        .filter(
          (pool) =>
            ![
              "tashas-otherworldly-guise-extra-attack",
              "tensers-transformation-extra-attack"
            ].includes(pool.id)
        )
        .map((pool) => ({
          ...pool,
          id: entry.className === "Custom" ? `${entry.id}:${pool.id}` : pool.id,
          consume: (next: Character, context: EconomyMultiActionContext) =>
            applyClassEditorChange(next, entry.id, (scoped) => pool.consume(scoped, context))
        }));
    });
    const spellPools = [
      createTashasOtherworldlyGuiseExtraAttackPool(character),
      createTensersTransformationExtraAttackPool(character)
    ].filter((pool): pool is SharedEconomyMultiPool => pool !== null);
    return [...pools, ...spellPools].sort((left, right) => left.priority - right.priority);
  }
  const hasCustomExtraAttackOverride = getCharacterClassRulesExtraAttackCount(character) > 0;
  const pools = [
    hasCustomExtraAttackOverride ? null : createFighterExtraAttackPool(character),
    createFighterActionSurgePool(character),
    hasCustomExtraAttackOverride ? null : createBardValorExtraAttackPool(character),
    hasCustomExtraAttackOverride ? null : createBarbarianExtraAttackPool(character),
    hasCustomExtraAttackOverride ? null : createRangerExtraAttackPool(character),
    hasCustomExtraAttackOverride ? null : createPaladinExtraAttackPool(character),
    hasCustomExtraAttackOverride ? null : createArtificerExtraAttackPool(character),
    hasCustomExtraAttackOverride ? null : createMonkExtraAttackPool(character),
    createCustomClassExtraAttackPool(character),
    hasCustomExtraAttackOverride ? null : createWarlockPactBladeExtraAttackPool(character),
    hasCustomExtraAttackOverride ? null : createWizardBladesingerExtraAttackPool(character),
    createTashasOtherworldlyGuiseExtraAttackPool(character),
    createTensersTransformationExtraAttackPool(character)
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
  action: Pick<
    WeaponAction,
    | "key"
    | "economyType"
    | "actionCategory"
    | "attackKind"
    | "combatType"
    | "inventoryStackId"
    | "inventoryFeatureTags"
  >
): EconomyMultiActionContext {
  return {
    economyType: action.economyType,
    actionCategory: action.actionCategory,
    attackKind: action.attackKind,
    combatType: action.combatType,
    weaponActionKey: action.key,
    weaponInventoryStackId: action.inventoryStackId,
    weaponInventoryFeatureTags: action.inventoryFeatureTags
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
  if (!shouldTrackRoundScopedResources(character.roundTracker)) {
    return 0;
  }

  const pools = getSharedEconomyMultiPools(character);
  if (!(character as Character).multiclass)
    return pools.reduce((total, pool) => total + getAccessiblePoolCount(pool, context), 0);
  // Extra Attack features offer alternatives for one Attack action; they never add together.
  return (
    Math.max(
      0,
      ...pools
        .filter((pool) => pool.id !== "fighter-action-surge")
        .map((pool) => getAccessiblePoolCount(pool, context))
    ) +
    pools
      .filter((pool) => pool.id === "fighter-action-surge")
      .reduce((total, pool) => total + getAccessiblePoolCount(pool, context), 0)
  );
}

export function consumeSharedEconomyMultiForCharacterAction(
  character: Character,
  context: EconomyMultiActionContext
): Character {
  if (!shouldTrackRoundScopedResources(character.roundTracker)) {
    return character;
  }

  const matchingPool = getPoolCandidatesForConsumption(character, context)[0];

  if (!matchingPool) {
    return character;
  }

  const result = matchingPool.consume(character, context);
  if (!character.multiclass || matchingPool.id === "fighter-action-surge") return result;
  // Keep each feature's attack counters in step, while retaining its own restrictions
  // (Pact weapon, cantrip replacement, and so on). All see the same pre-action state.
  let classFeatureState = { ...result.classFeatureState };
  const classes = new Map(result.multiclass!.classes.map((entry) => [entry.id, entry]));
  for (const pool of getSharedEconomyMultiPools(character)) {
    if (pool.id === "fighter-action-surge" || pool === matchingPool) continue;
    const consumptionContext = getFirstMatchingRule(pool, context)
      ? context
      : {
          ...context,
          actionCategory: ACTION_CATEGORY.ATTACK,
          attackKind: "weapon" as const,
          spellLevel: undefined
        };
    const consumed = pool.consume(character, consumptionContext);
    for (const entry of consumed.multiclass?.classes ?? []) {
      const previous = character.multiclass.classes.find((item) => item.id === entry.id);
      if (entry.customFeatureState !== previous?.customFeatureState) classes.set(entry.id, entry);
    }
    classFeatureState = {
      ...classFeatureState,
      ...Object.fromEntries(
        Object.entries(consumed.classFeatureState ?? {}).filter(
          ([key, state]) =>
            state !== character.classFeatureState?.[key as keyof typeof character.classFeatureState]
        )
      )
    };
  }
  return {
    ...result,
    classFeatureState,
    multiclass: { ...result.multiclass!, classes: [...classes.values()] }
  };
}
