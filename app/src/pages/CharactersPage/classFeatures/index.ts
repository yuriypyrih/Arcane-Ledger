import type { Character, CharacterClassFeatureState, CharacterCondition } from "../../../types";
import {
  activateBarbarianRage,
  applyLongRestToBarbarianFeatures,
  getBarbarianArmorClassBonuses,
  getBarbarianArmorClassModes,
  applyShortRestToBarbarianFeatures,
  deactivateBarbarianRage,
  getBarbarianDerivedConditions,
  getBarbarianFeatureAction,
  getBarbarianSkillIndicators,
  getBarbarianSavingThrowIndicators,
  getBarbarianSpellcastingState,
  getBarbarianWeaponDamageBonuses,
  normalizeBarbarianRageState
} from "./barbarian";
import type {
  ArmorClassFeatureContext,
  DerivedFeatureCondition,
  FeatureActionCard,
  FeatureIndicator,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureDamageBonus,
  FeatureSpellcastingState,
  SavingThrowIndicatorMap,
  SkillIndicatorMap,
  WeaponFeatureContext
} from "./types";

export type {
  ArmorClassFeatureContext,
  FeatureActionCard,
  FeatureIndicator,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureDamageBonus,
  SavingThrowIndicatorMap,
  SkillIndicatorMap,
  WeaponFeatureContext
};

export function normalizeCharacterClassFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level">
): CharacterClassFeatureState {
  const record =
    value && typeof value === "object" ? (value as Partial<CharacterClassFeatureState>) : {};

  return {
    rage: normalizeBarbarianRageState(record.rage, character)
  };
}

export function getFeatureActionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionCard[] {
  const rageAction = getBarbarianFeatureAction(character);
  return rageAction ? [rageAction] : [];
}

export function getFeatureDamageBonusesForWeaponAction(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: WeaponFeatureContext
): FeatureDamageBonus[] {
  return getBarbarianWeaponDamageBonuses(character, context);
}

export function getSavingThrowIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SavingThrowIndicatorMap {
  return getBarbarianSavingThrowIndicators(character);
}

export function getSkillIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SkillIndicatorMap {
  return getBarbarianSkillIndicators(character);
}

export function getSpellcastingStateForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSpellcastingState {
  return getBarbarianSpellcastingState(character);
}

export function getArmorClassModesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: ArmorClassFeatureContext
): FeatureArmorClassMode[] {
  return getBarbarianArmorClassModes(character, context);
}

export function getArmorClassBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: ArmorClassFeatureContext
): FeatureArmorClassBonus[] {
  return getBarbarianArmorClassBonuses(character, context);
}

export function getDerivedFeatureConditionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): DerivedFeatureCondition[] {
  return getBarbarianDerivedConditions(character);
}

export function getResolvedConditionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "conditions">
): CharacterCondition[] {
  const manualConditions = Array.isArray(character.conditions)
    ? character.conditions.filter(
        (condition): condition is CharacterCondition =>
          Boolean(condition) &&
          typeof condition === "object" &&
          typeof condition.name === "string" &&
          typeof condition.roundsRemaining === "number"
      )
    : [];
  const derivedConditions = getDerivedFeatureConditionsForCharacter(character);
  const manualConditionsWithoutDerived = manualConditions.filter(
    (condition) => !derivedConditions.some((derivedCondition) => derivedCondition.name === condition.name)
  );

  return [...manualConditionsWithoutDerived, ...derivedConditions];
}

export function activateFeatureActionForCharacter(character: Character, actionKey: string): Character {
  if (actionKey === "barbarian-rage") {
    return activateBarbarianRage(character);
  }

  return character;
}

export function removeFeatureConditionForCharacter(character: Character, conditionName: string): Character {
  if (conditionName.trim() === "Rage") {
    return deactivateBarbarianRage(character);
  }

  return character;
}

export function applyShortRestToFeatureState(character: Character): Character {
  return applyShortRestToBarbarianFeatures(character);
}

export function applyLongRestToFeatureState(character: Character): Character {
  return applyLongRestToBarbarianFeatures(character);
}
