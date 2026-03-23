import type { Character, CharacterClassFeatureState } from "../../../types";
import {
  activateBarbarianRage,
  applyLongRestToBarbarianFeatures,
  getBarbarianAbilityScoreBonuses,
  getBarbarianArmorClassBonuses,
  getBarbarianArmorClassModes,
  getBarbarianCoreStatIndicators,
  applyShortRestToBarbarianFeatures,
  deactivateBarbarianRage,
  getBarbarianDerivedConditions,
  getBarbarianFeatureAction,
  getBarbarianSkillIndicators,
  getBarbarianSavingThrowIndicators,
  getBarbarianSpeedBonuses,
  getBarbarianSpellcastingState,
  getBarbarianWeaponDamageBonuses,
  normalizeBarbarianRageState
} from "./barbarian";
import type {
  ArmorClassFeatureContext,
  CoreStatIndicatorMap,
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureAbilityScoreBonus,
  FeatureIndicator,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureDamageBonus,
  FeatureSpeedBonus,
  FeatureSpellcastingState,
  SavingThrowIndicatorMap,
  SpeedFeatureContext,
  SkillIndicatorMap,
  WeaponFeatureContext
} from "./types";

export type {
  ArmorClassFeatureContext,
  CoreStatIndicatorMap,
  FeatureActionCard,
  FeatureAbilityScoreBonus,
  FeatureIndicator,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureDamageBonus,
  FeatureSpeedBonus,
  SavingThrowIndicatorMap,
  SpeedFeatureContext,
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
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): SavingThrowIndicatorMap {
  return getBarbarianSavingThrowIndicators(character);
}

export function getCoreStatIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): CoreStatIndicatorMap {
  return getBarbarianCoreStatIndicators(character);
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

export function getSpeedBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: SpeedFeatureContext
): FeatureSpeedBonus[] {
  return getBarbarianSpeedBonuses(character, context);
}

export function getAbilityScoreBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureAbilityScoreBonus[] {
  return getBarbarianAbilityScoreBonuses(character);
}

export function getDerivedFeatureStatusEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): DerivedFeatureStatusEntry[] {
  return getBarbarianDerivedConditions(character);
}

export function activateFeatureActionForCharacter(character: Character, actionKey: string): Character {
  if (actionKey === "barbarian-rage") {
    return activateBarbarianRage(character);
  }

  return character;
}

export function removeFeatureStatusEntryForCharacter(
  character: Character,
  statusValue: string
): Character {
  if (statusValue.trim() === "Rage") {
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
