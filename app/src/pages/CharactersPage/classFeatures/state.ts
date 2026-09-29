import { applyClassEditorChange } from "../multiclass";
import type { Character, CharacterClassFeatureState } from "../../../types";

import { shouldTrackRoundScopedResources } from "../combat";

import {
  consumeSharedEconomyMultiForCharacterAction,
  createEconomyMultiContextForFeatureAction,
  createEconomyMultiContextForFeatureActionOption,
  createEconomyMultiContextForSpell,
  createEconomyMultiContextForWeaponAction,
  getSharedEconomyMultiCountForCharacterAction
} from "./economyMulti";
import { getClassFeatureModules } from "./modules";
import type {
  AbilityCheckIndicatorMap,
  ArmorClassFeatureContext,
  CoreStatIndicatorMap,
  FeatureActionCard,
  FeatureActionHeaderTag,
  FeatureActionHeaderTagPool,
  FeatureActionCardUsage,
  FeatureActionCardUsageCharges,
  FeatureActionCardUsageCost,
  FeatureActionDrawerConfig,
  FeatureActionExecuteConfig,
  FeatureActionFact,
  FeatureActionIcon,
  FeatureActionOptionCard,
  FeatureActionOptionSelection,
  FeatureActionResource,
  FeatureActionTone,
  FeatureAbilityScoreBonus,
  FeatureArmorProficiencyEntry,
  FeatureIndicator,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  EconomyMultiActionContext,
  FeatureLanguageProficiencyEntry,
  FeatureDamageBonus,
  FeatureEconomyMultiAccessRule,
  FeatureEconomyMultiPool,
  FeatureSavingThrowBonus,
  FeatureUnarmedStrikeConfig,
  FeatureSavingThrowProficiencyEntry,
  FeatureSkillBonus,
  FeatureSkillProficiencyEntry,
  FeatureSpeedBonus,
  FeatureWeaponProficiencyEntry,
  SavingThrowIndicatorMap,
  SpeedFeatureContext,
  SkillIndicatorMap,
  WeaponFeatureContext
} from "./types";

export function mergeIndicatorMaps<T extends string>(
  ...maps: Array<Partial<Record<T, FeatureIndicator[]>>>
): Partial<Record<T, FeatureIndicator[]>> {
  return maps.reduce<Partial<Record<T, FeatureIndicator[]>>>((result, currentMap) => {
    (Object.keys(currentMap) as T[]).forEach((key) => {
      const indicators = currentMap[key];

      if (!indicators || indicators.length === 0) {
        return;
      }

      result[key] = [...(result[key] ?? []), ...indicators];
    });

    return result;
  }, {});
}

export type {
  AbilityCheckIndicatorMap,
  ArmorClassFeatureContext,
  CoreStatIndicatorMap,
  EconomyMultiActionContext,
  FeatureActionCard,
  FeatureActionHeaderTag,
  FeatureActionHeaderTagPool,
  FeatureActionCardUsage,
  FeatureActionCardUsageCharges,
  FeatureActionCardUsageCost,
  FeatureActionDrawerConfig,
  FeatureActionExecuteConfig,
  FeatureActionFact,
  FeatureActionIcon,
  FeatureActionOptionCard,
  FeatureActionOptionSelection,
  FeatureActionResource,
  FeatureActionTone,
  FeatureAbilityScoreBonus,
  FeatureArmorProficiencyEntry,
  FeatureIndicator,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureLanguageProficiencyEntry,
  FeatureDamageBonus,
  FeatureEconomyMultiAccessRule,
  FeatureEconomyMultiPool,
  FeatureSavingThrowBonus,
  FeatureUnarmedStrikeConfig,
  FeatureSavingThrowProficiencyEntry,
  FeatureSkillBonus,
  FeatureSkillProficiencyEntry,
  FeatureSpeedBonus,
  FeatureWeaponProficiencyEntry,
  SavingThrowIndicatorMap,
  SpeedFeatureContext,
  SkillIndicatorMap,
  WeaponFeatureContext
};

export {
  consumeSharedEconomyMultiForCharacterAction,
  createEconomyMultiContextForFeatureAction,
  createEconomyMultiContextForFeatureActionOption,
  createEconomyMultiContextForSpell,
  createEconomyMultiContextForWeaponAction,
  getSharedEconomyMultiCountForCharacterAction
};

const roundScopedBooleanStateKeys = new Set([
  "brutalStrikePending",
  "battleMagicBonusAttackAvailable",
  "frenzyPending",
  "psiWarriorTelekineticMasterBonusAttackAvailable",
  "spellcastWeaponBonusActionAvailable",
  "steadyAimActive",
  "steadyAimAttackAdvantageAvailable",
  "warPriestBonusAttackAvailable",
  "warriorOfMercyFlurryOfHealingAndHarmActive",
  "warriorOfShadowShadowStepAdvantageActive"
]);

const roundScopedNumberStateKeys = new Set(["retaliationAttacksRemaining"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isRoundScopedBooleanStateKey(key: string): boolean {
  return key.endsWith("UsedThisTurn") || roundScopedBooleanStateKeys.has(key);
}

function isRoundScopedNumberStateKey(key: string): boolean {
  return (
    key.endsWith("RemainingThisTurn") ||
    key.endsWith("UsesThisTurn") ||
    roundScopedNumberStateKeys.has(key)
  );
}

function clearRoundScopedFeatureStateRecord(
  stateRecord: Record<string, unknown>
): Record<string, unknown> {
  let nextStateRecord: Record<string, unknown> | null = null;

  Object.entries(stateRecord).forEach(([key, value]) => {
    let nextValue = value;

    if (isRoundScopedBooleanStateKey(key) && value === true) {
      nextValue = false;
    } else if (isRoundScopedNumberStateKey(key) && typeof value === "number" && value !== 0) {
      nextValue = 0;
    }

    if (nextValue !== value) {
      nextStateRecord = nextStateRecord ?? { ...stateRecord };
      nextStateRecord[key] = nextValue;
    }
  });

  return nextStateRecord ?? stateRecord;
}

export function clearRoundScopedFeatureStateForCharacter(character: Character): Character {
  if (character.multiclass && !character.classEntryId) {
    character = character.multiclass.classes
      .filter((entry) => entry.className === "Custom")
      .reduce(
        (next, entry) =>
          applyClassEditorChange(next, entry.id, clearRoundScopedFeatureStateForCharacter),
        character
      );
  }
  const featureState = character.classFeatureState;

  if (!featureState) {
    return character;
  }

  let nextFeatureState: Record<string, unknown> | null = null;

  Object.entries(featureState).forEach(([stateKey, stateValue]) => {
    if (!isRecord(stateValue)) {
      return;
    }

    const nextStateValue = clearRoundScopedFeatureStateRecord(stateValue);

    if (nextStateValue !== stateValue) {
      nextFeatureState = nextFeatureState ?? { ...featureState };
      nextFeatureState[stateKey] = nextStateValue;
    }
  });

  return nextFeatureState
    ? {
        ...character,
        classFeatureState: nextFeatureState as CharacterClassFeatureState
      }
    : character;
}

export function clearRoundScopedFeatureStateIfOutOfCombat(character: Character): Character {
  return shouldTrackRoundScopedResources(character.roundTracker)
    ? character
    : clearRoundScopedFeatureStateForCharacter(character);
}

export function normalizeCharacterClassFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level"> &
    Partial<
      Pick<
        Character,
        | "abilities"
        | "cantripIds"
        | "classRules"
        | "customClass"
        | "feats"
        | "inventoryItems"
        | "statusEntries"
        | "subclassId"
      >
    >
): CharacterClassFeatureState {
  const record =
    value && typeof value === "object" ? (value as Partial<CharacterClassFeatureState>) : {};
  const rawRecord = record as Record<string, unknown>;
  const normalizedState = {} as CharacterClassFeatureState;

  getClassFeatureModules().forEach((module) => {
    (normalizedState as Record<string, unknown>)[module.stateKey] = module.normalizeState(
      rawRecord[module.stateKey],
      character
    );
  });

  return normalizedState;
}
